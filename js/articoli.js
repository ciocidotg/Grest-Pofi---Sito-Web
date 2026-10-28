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
    } else if (/^!\[[^\]]*\]\([^)]+\)$/.test(r)) {
      chiudiParagrafo(); chiudiLista();
      html += inline(r) + '\n';
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

function mostraErrore(contenitore, messaggio) {
  contenitore.innerHTML = `<div class="notice"><p>${escape(messaggio)}</p></div>`;
}

/* ---------- Pagina LISTA (articoli.html) ---------- */

async function paginaLista() {
  const box = document.getElementById('lista-articoli');
  if (!box) return;
  try {
    const nomi = await leggiElenco();
    if (!nomi.length) return mostraErrore(box, 'Nessun articolo pubblicato, per ora.');

    const risultati = await Promise.allSettled(nomi.map(leggiArticolo));
    const articoli = risultati.filter((r) => r.status === 'fulfilled').map((r) => r.value);

    box.innerHTML = articoli.map(({ nome, info }) => `
      <a class="card article-card" href="articolo.html?a=${nome}">
        ${info.copertina ? `<img src="${urlSicuro(info.copertina)}" alt="" loading="lazy">` : ''}
        <div class="article-card__body">
          <p class="meta">${escape(formattaData(info.data))}${info.autore ? ' · ' + escape(info.autore) : ''}</p>
          <h2>${escape(info.titolo || nome)}</h2>
          ${info.riassunto ? `<p>${escape(info.riassunto)}</p>` : ''}
        </div>
      </a>`).join('');
  } catch (e) {
    mostraErrore(box, 'Non riesco a caricare gli articoli. ' + e.message);
  }
}

/* ---------- Pagina ARTICOLO (articolo.html?a=nome) ---------- */

async function paginaArticolo() {
  const box = document.getElementById('articolo');
  if (!box) return;
  const nome = new URLSearchParams(location.search).get('a') || '';
  if (!nomeValido(nome)) return mostraErrore(box, 'Articolo non trovato.');

  try {
    const { info, corpo } = await leggiArticolo(nome);
    const titolo = info.titolo || nome;
    document.title = titolo + ' – Grest Pofi ODV';
    box.innerHTML = `
      <p class="meta">${escape(formattaData(info.data))}${info.autore ? ' · ' + escape(info.autore) : ''}</p>
      <h1>${escape(titolo)}</h1>
      ${info.copertina ? `<img class="article__cover" src="${urlSicuro(info.copertina)}" alt="">` : ''}
      <div class="article__body">${markdown(corpo)}</div>
      <p><a href="articoli.html">← Tutti gli articoli</a></p>`;
  } catch (e) {
    mostraErrore(box, 'Articolo non trovato.');
  }
}

paginaLista();
paginaArticolo();
