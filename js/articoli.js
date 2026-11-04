/* =========================================================
   GREST POFI ODV – Sistema articoli
   ---------------------------------------------------------
   Come funziona (in breve):
   - Ogni articolo è un file di testo .md nella cartella /articoli
   - Il file articoli/elenco.txt dice quali articoli mostrare e in che ordine
   - articoli.html mostra la lista, articolo.html?a=NOME mostra un articolo

   Non serve nessun database: basta caricare i file su Aruba.
   ATTENZIONE: aprendo i file con doppio clic (file://) gli articoli NON
   si vedono. Serve un piccolo server locale: vedi LEGGIMI.md.
   ========================================================= */

const CARTELLA = 'articoli/';

/* ---------- Lettura dei file ---------- */

// Legge elenco.txt e restituisce i nomi dei file (senza .md)
async function leggiElenco() {
  const risposta = await fetch(CARTELLA + 'elenco.txt', { cache: 'no-cache' });
  if (!risposta.ok) throw new Error('elenco.txt non trovato');
  const testo = await risposta.text();
  return testo
    .split('\n')
    .map((riga) => riga.trim().replace(/\.md$/, ''))
    .filter((riga) => riga && !riga.startsWith('#'))
    .filter(nomeValido);
}

// Solo lettere minuscole, numeri e trattini: evita errori e nomi strani
function nomeValido(nome) {
  return /^[a-z0-9-]+$/.test(nome);
}

// Legge un articolo e separa le informazioni iniziali dal testo
async function leggiArticolo(nome) {
  const risposta = await fetch(CARTELLA + nome + '.md', { cache: 'no-cache' });
  if (!risposta.ok) throw new Error('Articolo non trovato: ' + nome);
  const grezzo = (await risposta.text()).replace(/\r\n/g, '\n');
  return { nome, ...separaIntestazione(grezzo) };
}

// L'intestazione è il blocco tra le due righe "---" in cima al file
function separaIntestazione(testo) {
  const info = {};
  const m = testo.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { info, corpo: testo };
  m[1].split('\n').forEach((riga) => {
    const i = riga.indexOf(':');
    if (i > 0) info[riga.slice(0, i).trim().toLowerCase()] = riga.slice(i + 1).trim();
  });
  return { info, corpo: testo.slice(m[0].length) };
}

/* ---------- Da Markdown a HTML ----------
   Supporta: # titoli, **grassetto**, *corsivo*, [link](url),
   ![foto](url), elenchi con - o 1., > citazioni, paragrafi.
   Tutto il testo viene "ripulito" prima, quindi un articolo
   non può inserire codice nella pagina. */

function escape(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function urlSicuro(url) {
  url = url.trim();
  return /^(https?:\/\/|mailto:|\/|\.{0,2}\/|[a-z0-9_-]+\/)/i.test(url) && !/^javascript:/i.test(url) ? url : '#';
}

function inline(testo) {
  return escape(testo)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => `<img src="${urlSicuro(url)}" alt="${alt}" loading="lazy">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => {
      const u = urlSicuro(url);
      const esterno = /^https?:/.test(u) ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${u}"${esterno}>${txt}</a>`;
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>');
}

function markdown(testo) {
  const righe = testo.split('\n');
  let html = '';
  let paragrafo = [];
  let lista = null; // 'ul' oppure 'ol'

  const chiudiParagrafo = () => {
    if (paragrafo.length) html += `<p>${inline(paragrafo.join(' '))}</p>\n`;
    paragrafo = [];
  };
  const chiudiLista = () => {
    if (lista) html += `</${lista}>\n`;
    lista = null;
  };

  for (const riga of righe) {
    const r = riga.trim();
    let m;

    if (!r) { chiudiParagrafo(); chiudiLista(); continue; }

    if ((m = r.match(/^(#{1,3})\s+(.*)$/))) {
      chiudiParagrafo(); chiudiLista();
      // "#" nel testo diventa h2: l'h1 è il titolo dell'articolo
      const livello = Math.min(m[1].length + 1, 4);
      html += `<h${livello}>${inline(m[2])}</h${livello}>\n`;
    } else if ((m = r.match(/^>\s?(.*)$/))) {
      chiudiParagrafo(); chiudiLista();
      html += `<blockquote><p>${inline(m[1])}</p></blockquote>\n`;
    } else if ((m = r.match(/^[-*]\s+(.*)$/)) || (m = r.match(/^\d+[.)]\s+(.*)$/))) {
      chiudiParagrafo();
      const tipo = /^\d/.test(r) ? 'ol' : 'ul';
      if (lista !== tipo) { chiudiLista(); html += `<${tipo}>\n`; lista = tipo; }
      html += `<li>${inline(m[1])}</li>\n`;
    } else if ((m = r.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/))) {
      // Foto da sola su una riga: diventa una figura, e la descrizione
      // scritta tra [ ] compare sotto come didascalia
      chiudiParagrafo(); chiudiLista();
      const didascalia = m[1] ? `<figcaption>${escape(m[1])}</figcaption>` : '';
      html += `<figure>${inline(r)}${didascalia}</figure>\n`;
    } else {
      chiudiLista();
      paragrafo.push(r);
    }
  }
  chiudiParagrafo(); chiudiLista();
  return html;
}

/* ---------- Utilità ---------- */

function formattaData(iso) {
  const d = new Date(iso + 'T12:00:00');
  if (isNaN(d)) return iso || '';
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Tempo di lettura stimato: circa 200 parole al minuto
function minutiDiLettura(testo) {
  const parole = testo.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(parole / 200));
}

function mostraErrore(contenitore, messaggio) {
  contenitore.innerHTML = `<div class="notice"><p>${escape(messaggio)}</p></div>`;
}

// Aperto con doppio clic (indirizzo file://)? Il browser vieta di leggere
// i file .md e elenco.txt: spieghiamo come aprire il sito nel modo giusto.
// Online su Aruba questo messaggio non compare mai.
function apertoDaFile(contenitore) {
  if (location.protocol !== 'file:') return false;
  contenitore.innerHTML = `
    <div class="notice archivio__vuoto">
      <p><strong>Gli articoli non si vedono perché il sito è aperto con un doppio clic.</strong></p>
      <p>Per sicurezza il browser non lascia leggere i file degli articoli da una pagina aperta così.
      Apri il sito con un piccolo server locale (istruzioni nel file LEGGIMI.md, sezione
      "Provare il sito sul proprio computer"). Una volta caricato su Aruba funziona da solo.</p>
    </div>`;
  return true;
}

/* ---------- Pagina LISTA (articoli.html) ---------- */

// Toglie maiuscole e accenti, così "Città" si trova anche cercando "citta"
function normalizza(testo) {
  return (testo || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Toglie i simboli del Markdown dal testo, per la ricerca
function soloTesto(corpo) {
  return corpo
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, ' $1 ')   // foto → solo la descrizione
    .replace(/\[([^\]]*)\]\([^)]*\)/g, ' $1 ')    // link → solo il testo
    .replace(/[#>*]/g, ' ');
}

// Colori dei riquadri per gli articoli senza copertina (si alternano)
const COLORI_SCHEDA = ['giallo', 'azzurro', 'rosa', 'arancione'];

// Il box di un articolo nella lista. "grande" = il primo, a tutta larghezza
function schedaHTML(articolo, grande) {
  const { nome, info, corpo, colore } = articolo;
  const d = new Date(info.data + 'T12:00:00');
  const valida = !isNaN(d);

  // Copertina, oppure un riquadro colorato con la data stile "timbro"
  const media = info.copertina
    ? `<img src="${urlSicuro(info.copertina)}" alt="" loading="lazy">`
    : `<span class="scheda__timbro" aria-hidden="true">${valida
        ? `${d.getDate()}<small>${d.toLocaleDateString('it-IT', { month: 'short' })} ${d.getFullYear()}</small>`
        : '☀️'}</span>`;

  return `
    <a class="card scheda${grande ? ' scheda--grande' : ''}" href="articolo.html?a=${nome}">
      <div class="scheda__media scheda__media--${colore}">${media}</div>
      <div class="scheda__corpo">
        <p class="scheda__meta">
          <time datetime="${escape(info.data || '')}">${escape(formattaData(info.data))}</time>
          · ${minutiDiLettura(corpo)} min di lettura
        </p>
        <h2 class="scheda__titolo">${escape(info.titolo || nome)}</h2>
        ${info.riassunto ? `<p>${escape(info.riassunto)}</p>` : ''}
        <span class="scheda__leggi">Leggi l'articolo →</span>
      </div>
    </a>`;
}

async function paginaLista() {
  const box = document.getElementById('lista-articoli');
  if (!box) return;

  const modulo     = document.getElementById('filtri');
  const campoCerca = document.getElementById('filtro-cerca');
  const campoAnno  = document.getElementById('filtro-anno');
  const campoOrdine = document.getElementById('filtro-ordine');
  const conteggio  = document.getElementById('conteggio');

  if (apertoDaFile(box)) { modulo.hidden = true; return; }

  // 1. Legge tutti gli articoli dell'elenco
  let articoli;
  try {
    const nomi = await leggiElenco();
    const risultati = await Promise.allSettled(nomi.map(leggiArticolo));
    articoli = risultati
      .filter((r) => r.status === 'fulfilled')
      .map((r, i) => {
        const { info, corpo } = r.value;
        return {
          ...r.value,
          posizione: i,                                 // ordine in elenco.txt
          colore: COLORI_SCHEDA[i % COLORI_SCHEDA.length],
          anno: /^\d{4}/.test(info.data || '') ? info.data.slice(0, 4) : '',
          // tutto il testo in cui cercare, già "normalizzato"
          perRicerca: normalizza([info.titolo, info.sottotitolo, info.riassunto, info.autore, soloTesto(corpo)].join(' ')),
        };
      });
  } catch (e) {
    modulo.hidden = true;
    return mostraErrore(box, 'Non riesco a caricare gli articoli. ' + e.message);
  }

  if (!articoli.length) {
    modulo.hidden = true;
    return mostraErrore(box, 'Nessun articolo pubblicato, per ora.');
  }

  // 2. Riempie il menu degli anni con quelli presenti negli articoli
  const anni = [...new Set(articoli.map((a) => a.anno).filter(Boolean))].sort().reverse();
  campoAnno.insertAdjacentHTML('beforeend', anni.map((a) => `<option value="${a}">${a}</option>`).join(''));

  // 3. Se l'indirizzo contiene già dei filtri (es. articoli.html?anno=2026), li applica
  const parametri = new URLSearchParams(location.search);
  campoCerca.value = parametri.get('q') || '';
  if (anni.includes(parametri.get('anno'))) campoAnno.value = parametri.get('anno');
  if (parametri.get('ordine') === 'vecchi') campoOrdine.value = 'vecchi';

  // 4. Filtra, ordina e mostra. Viene richiamata a ogni modifica dei filtri.
  function aggiorna() {
    const parole = normalizza(campoCerca.value).split(/\s+/).filter(Boolean);
    const anno = campoAnno.value;
    const verso = campoOrdine.value === 'vecchi' ? 1 : -1;

    const trovati = articoli
      // ogni parola cercata deve comparire da qualche parte nell'articolo
      .filter((a) => parole.every((p) => a.perRicerca.includes(p)))
      .filter((a) => !anno || a.anno === anno)
      // per data; a parità di data (o senza data) vale l'ordine di elenco.txt
      .sort((a, b) => {
        const da = a.info.data || '', db = b.info.data || '';
        if (da !== db) return (da < db ? -1 : 1) * verso;
        return a.posizione - b.posizione;
      });

    conteggio.textContent = trovati.length === 1 ? '1 articolo' : `${trovati.length} articoli`;

    box.innerHTML = trovati.length
      ? trovati.map((a, i) => schedaHTML(a, i === 0)).join('')
      : `<div class="notice archivio__vuoto">
           <p><strong>Nessun articolo trovato.</strong> Prova con un'altra parola o con un altro anno.</p>
         </div>`;

    // Tiene i filtri nell'indirizzo: così un link condiviso mostra gli stessi risultati
    const nuovi = new URLSearchParams();
    if (campoCerca.value.trim()) nuovi.set('q', campoCerca.value.trim());
    if (anno) nuovi.set('anno', anno);
    if (verso === 1) nuovi.set('ordine', 'vecchi');
    const query = nuovi.toString();
    history.replaceState(null, '', location.pathname + (query ? '?' + query : ''));
  }

  modulo.addEventListener('input', aggiorna);
  modulo.addEventListener('change', aggiorna);
  modulo.addEventListener('submit', (e) => { e.preventDefault(); aggiorna(); });
  document.getElementById('filtri-azzera').addEventListener('click', () => {
    modulo.reset();
    aggiorna();
    campoCerca.focus();
  });

  aggiorna();
}

/* ---------- Pagina ARTICOLO (articolo.html?a=nome) ---------- */

async function paginaArticolo() {
  const box = document.getElementById('articolo');
  if (!box) return;
  if (apertoDaFile(box)) return;
  const nome = new URLSearchParams(location.search).get('a') || '';
  if (!nomeValido(nome)) return mostraErrore(box, 'Articolo non trovato.');

  try {
    const { info, corpo } = await leggiArticolo(nome);
    const titolo = info.titolo || nome;
    // Se manca il sottotitolo usiamo il riassunto, così non resta un buco
    const sottotitolo = info.sottotitolo || info.riassunto || '';
    document.title = titolo + ' – Grest Pofi ODV';

    // Struttura dell'articolo, dall'alto in basso:
    // rubrica → titolo → sottotitolo → firma → copertina → testo → fine
    box.innerHTML = `
      <header class="lettura__head">
        <p class="sticker">Gli articoli di Aurora</p>
        <h1 class="lettura__titolo">${escape(titolo)}</h1>
        ${sottotitolo ? `<p class="lettura__sottotitolo">${escape(sottotitolo)}</p>` : ''}
        <p class="lettura__firma">
          ${info.autore ? `<span>Di <strong>${escape(info.autore)}</strong></span>` : ''}
          <span><time datetime="${escape(info.data || '')}">${escape(formattaData(info.data))}</time></span>
          <span>${minutiDiLettura(corpo)} min di lettura</span>
        </p>
      </header>
      ${info.copertina ? `<figure class="lettura__copertina"><img src="${urlSicuro(info.copertina)}" alt=""></figure>` : ''}
      <div class="lettura__testo">${markdown(corpo)}</div>
      <footer class="lettura__fine">
        <a class="btn" href="articoli.html">← Tutti gli articoli</a>
      </footer>`;
  } catch (e) {
    mostraErrore(box, 'Articolo non trovato.');
  }
}

paginaLista();
paginaArticolo();
