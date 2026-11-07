/* =========================================================
   GREST POFI ODV – Script della pagina principale
   Piccole funzioni, nessuna libreria esterna.
   ========================================================= */

// 1. Menu su telefono: apre e chiude la lista dei link
const toggle = document.querySelector('.nav__toggle');
const menu = document.querySelector('.nav__menu');

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const aperto = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', aperto);
  });

  // chiude il menu quando si clicca su un link
  menu.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );
}

// 2. Pulsanti "Copia" (codice fiscale, IBAN)
document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const testo = document.querySelector(btn.dataset.copy)?.textContent.trim();
    if (!testo) return;
    try {
      await navigator.clipboard.writeText(testo);
      btn.textContent = 'Copiato!';
    } catch {
      btn.textContent = 'Seleziona e copia';
    }
    setTimeout(() => (btn.textContent = 'Copia'), 2000);
  });
});

// 3. Anno corrente nel footer
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// 4. Tasto "← Indietro" (pagina del singolo articolo)
//    Se si arriva da una pagina del nostro sito (es. l'elenco articoli già
//    filtrato, o la home), torna lì come il tasto "indietro" del browser.
//    Se invece il link è stato aperto da fuori (WhatsApp, Facebook…),
//    il link funziona normalmente e porta a articoli.html.
document.querySelectorAll('[data-indietro]').forEach((link) => {
  link.addEventListener('click', (evento) => {
    const daQuestoSito = document.referrer.startsWith(location.origin);
    if (daQuestoSito && history.length > 1) {
      evento.preventDefault();
      history.back();
    }
  });
});

// Chi preferisce meno movimento (impostazione del telefono/computer)
// vede i numeri e il nastro fermi.
const menoMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 5. Nastro scorrevole della splash
//    Le parole sono scritte una volta sola in index.html, dentro .ribbon__gruppo.
//    Qui: (a) le ripetiamo finché il gruppo è più largo dello schermo,
//    (b) duplichiamo il gruppo, (c) calcoliamo le durate per una velocità costante.
const nastro = document.querySelector('.ribbon');
const VELOCITA_NASTRO = 70; // pixel al secondo: aumentate per farlo andare più veloce

if (nastro && !menoMovimento) {
  const binario = nastro.querySelector('.ribbon__track');
  const gruppo = nastro.querySelector('.ribbon__gruppo');
  const parole = gruppo.innerHTML;
  // larghezza da coprire: lo schermo più grande su cui si può allargare la finestra
  const daCoprire = Math.max(window.screen.width, window.innerWidth);

  // (a) ripete le parole (massimo 20 volte, per sicurezza)
  for (let i = 0; gruppo.offsetWidth < daCoprire && i < 20; i++) {
    gruppo.insertAdjacentHTML('beforeend', parole);
  }
  // (b) seconda copia identica: quando la prima è uscita, la seconda è al suo posto
  binario.appendChild(gruppo.cloneNode(true));

  // (c) durate: spazio da percorrere ÷ velocità
  const larghezzaNastro = nastro.offsetWidth;
  nastro.style.setProperty('--larghezza-nastro', larghezzaNastro + 'px');
  nastro.style.setProperty('--durata-entrata', (larghezzaNastro / VELOCITA_NASTRO) + 's');
  nastro.style.setProperty('--durata-giro', (gruppo.offsetWidth / VELOCITA_NASTRO) + 's');
  nastro.classList.add('is-pronto'); // da qui parte l'animazione (vedi style.css)
}

// 6. Numeri di "Chi siamo" che "scorrono" fino al valore
//    Il valore finale è quello scritto in index.html (es. <strong>+80</strong>):
//    per cambiarlo basta cambiare il numero lì. Simboli prima/dopo (+, %) restano.
//    L'animazione parte quando il riquadro entra nello schermo, una volta sola.
const numeri = document.querySelectorAll('.stat strong');
const DURATA_NUMERI = 1800; // millisecondi

function faiScorrere(el) {
  const [, prima, cifre, dopo] = el.dataset.valore.match(/^(\D*)(\d+)(.*)$/);
  const finale = Number(cifre);
  const inizio = performance.now();

  function passo(adesso) {
    const t = Math.min((adesso - inizio) / DURATA_NUMERI, 1); // da 0 a 1
    const frenata = 1 - Math.pow(1 - t, 3);                   // veloce all'inizio, rallenta alla fine
    el.textContent = prima + Math.round(finale * frenata) + dopo;
    if (t < 1) requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);
}

if (numeri.length && 'IntersectionObserver' in window && !menoMovimento) {
  const osservatore = new IntersectionObserver((voci) => {
    voci.forEach((voce) => {
      if (!voce.isIntersecting) return;
      faiScorrere(voce.target);
      osservatore.unobserve(voce.target); // una volta sola
    });
  }, { threshold: 0.6 }); // parte quando il riquadro è visibile per il 60%

  numeri.forEach((el) => {
    const testo = el.textContent.trim();
    if (!/^(\D*)(\d+)(.*)$/.test(testo)) return; // non è un numero: lo lasciamo stare
    el.dataset.valore = testo;
    el.textContent = testo.replace(/\d+/, '0'); // si parte da 0
    osservatore.observe(el);
  });
}
