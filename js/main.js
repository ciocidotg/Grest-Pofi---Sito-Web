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
