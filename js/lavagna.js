/* =========================================================
   GREST POFI ODV – Lavagna "Disegna il tuo sole"
   ---------------------------------------------------------
   Una lavagna nella splash della home: si parte da un sole da
   colorare (oppure da un foglio bianco), si disegna con il dito
   o con il mouse e si scarica il disegno come immagine PNG.

   PRIVACY: il disegno resta sul telefono o sul computer di chi
   lo fa. Non viene inviato a nessun server e non si salva nulla.

   Come funziona, in breve:
   - <canvas> è un foglio di pixel: lo disegniamo con ctx (il "pennello").
   - Il foglio è sempre 1000×1000 pixel, anche se sullo schermo
     appare più piccolo: così il PNG scaricato è sempre nitido.
   - I pulsanti si trovano in index.html, dentro <div class="lavagna">.
     Per aggiungere un colore basta copiare un pulsante .lavagna__colore
     e cambiare data-colore, --colore e aria-label: il JavaScript
     non va toccato.
   ========================================================= */

(function () {
  'use strict';

  var lavagna = document.querySelector('.lavagna');
  if (!lavagna) return;                     // se la lavagna non c'è nella pagina, non facciamo nulla

  var tela = lavagna.querySelector('.lavagna__tela');
  var ctx = tela.getContext('2d', { willReadFrequently: true });
  var annuncio = lavagna.querySelector('[data-annuncio]');  // testo letto ad alta voce dai lettori di schermo

  var LATO = 1000;                          // misura del foglio (e del PNG) in pixel
  var INCHIOSTRO = '#111111';               // nero dei contorni, uguale a --c-ink
  var MAX_ANNULLA = 20;                     // quante volte si può premere "Annulla"

  var stato = {
    strumento: 'pennello',                  // pennello | gomma | riempi
    colore: '#fcca59',
    spessore: 24,
    disegnando: false,
    ultimo: null                            // ultimo punto toccato, per unire i tratti
  };
  var storia = [];                          // copie del disegno, per "Annulla"

  tela.width = LATO;
  tela.height = LATO;


  /* ---------- 1. DISEGNI DI PARTENZA ---------- */

  // Foglio bianco. Lo sfondo è bianco "vero" (non trasparente):
  // serve al secchiello e rende il PNG leggibile ovunque.
  function foglioBianco() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, LATO, LATO);
  }

  // Il sole da colorare: solo contorni neri, tutte forme chiuse,
  // così il secchiello riempie ogni parte senza "uscire".
  function soleDaColorare() {
    foglioBianco();
    var cx = 500, cy = 500;
    ctx.strokeStyle = INCHIOSTRO;
    ctx.lineWidth = 10;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // 12 raggi a triangolo, staccati dalla faccia
    for (var i = 0; i < 12; i++) {
      var a = (Math.PI * 2 / 12) * i;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a - 0.13) * 262, cy + Math.sin(a - 0.13) * 262);
      ctx.lineTo(cx + Math.cos(a) * 410, cy + Math.sin(a) * 410);
      ctx.lineTo(cx + Math.cos(a + 0.13) * 262, cy + Math.sin(a + 0.13) * 262);
      ctx.closePath();
      ctx.stroke();
    }

    // la faccia
    ctx.beginPath();
    ctx.arc(cx, cy, 235, 0, Math.PI * 2);
    ctx.stroke();

    // gli occhiali da sole (già neri) e il sorriso
    disegnaOcchiali(cx, cy - 40, 300);
    ctx.strokeStyle = INCHIOSTRO;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, cy + 40, 95, Math.PI * 0.18, Math.PI * 0.82);
    ctx.stroke();
  }

  // Occhiali da sole centrati in (x, y), larghi "larghezza" pixel.
  // Li disegna il sole da colorare.
  function disegnaOcchiali(x, y, larghezza) {
    var lente = larghezza * 0.42;           // larghezza di una lente
    var alta = larghezza * 0.28;            // altezza di una lente
    var ponte = larghezza - lente * 2;      // spazio tra le lenti
    var sx = x - larghezza / 2;             // bordo sinistro
    var top = y - alta / 2;

    ctx.fillStyle = INCHIOSTRO;
    rettangoloTondo(sx, top, lente, alta, alta * 0.35);
    rettangoloTondo(sx + lente + ponte, top, lente, alta, alta * 0.35);

    // ponte sul naso
    ctx.strokeStyle = INCHIOSTRO;
    ctx.lineWidth = Math.max(4, larghezza * 0.035);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx + lente, top + alta * 0.3);
    ctx.lineTo(sx + lente + ponte, top + alta * 0.3);
    ctx.stroke();

    // un riflesso bianco su ogni lente
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(3, larghezza * 0.02);
    [sx, sx + lente + ponte].forEach(function (l) {
      ctx.beginPath();
      ctx.moveTo(l + lente * 0.18, top + alta * 0.62);
      ctx.lineTo(l + lente * 0.38, top + alta * 0.25);
      ctx.stroke();
    });
  }

  // Rettangolo con gli angoli arrotondati, riempito
  function rettangoloTondo(x, y, l, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + l, y, x + l, y + h, r);
    ctx.arcTo(x + l, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + l, y, r);
    ctx.closePath();
    ctx.fill();
  }


  /* ---------- 2. ANNULLA ---------- */

  // Prima di ogni modifica salviamo una copia del disegno
  function salvaPerAnnulla() {
    storia.push(ctx.getImageData(0, 0, LATO, LATO));
    if (storia.length > MAX_ANNULLA) storia.shift();  // teniamo solo le ultime 20
  }

  function annulla() {
    if (!storia.length) { annuncia('Niente da annullare'); return; }
    ctx.putImageData(storia.pop(), 0, 0);
    annuncia('Annullato');
  }


  /* ---------- 3. PENNELLO E GOMMA ---------- */

  // Converte la posizione del dito/mouse in pixel del foglio 1000×1000
  function puntoDa(evento) {
    var r = tela.getBoundingClientRect();
    return {
      x: (evento.clientX - r.left) * LATO / r.width,
      y: (evento.clientY - r.top) * LATO / r.height
    };
  }

  function tratto(da, a) {
    // la gomma dipinge di bianco, il colore dello sfondo
    ctx.strokeStyle = stato.strumento === 'gomma' ? '#ffffff' : stato.colore;
    ctx.lineWidth = stato.spessore;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(da.x, da.y);
    ctx.lineTo(a.x, a.y);
    ctx.stroke();
  }


  /* ---------- 4. SECCHIELLO (RIEMPI) ----------
     Parte dal punto toccato e colora tutti i pixel vicini dello
     stesso colore, finché non trova un bordo di colore diverso. */

  function coloreInRgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function riempi(punto) {
    var x0 = Math.floor(punto.x), y0 = Math.floor(punto.y);
    if (x0 < 0 || y0 < 0 || x0 >= LATO || y0 >= LATO) return;

    var img = ctx.getImageData(0, 0, LATO, LATO);
    var px = img.data;                       // 4 numeri per pixel: rosso, verde, blu, opacità
    var nuovo = coloreInRgb(stato.colore);
    var i0 = (y0 * LATO + x0) * 4;
    var r0 = px[i0], g0 = px[i0 + 1], b0 = px[i0 + 2];

    // se l'area ha già quel colore non c'è niente da fare
    if (Math.abs(r0 - nuovo[0]) + Math.abs(g0 - nuovo[1]) + Math.abs(b0 - nuovo[2]) < 12) return;

    salvaPerAnnulla();
    var TOLLERANZA = 120;                    // più alta = riempie anche le sfumature dei bordi
    var visto = new Uint8Array(LATO * LATO);
    var daFare = [y0 * LATO + x0];

    while (daFare.length) {
      var p = daFare.pop();
      if (visto[p]) continue;
      visto[p] = 1;
      var i = p * 4;
      if (Math.abs(px[i] - r0) + Math.abs(px[i + 1] - g0) + Math.abs(px[i + 2] - b0) > TOLLERANZA) continue;

      px[i] = nuovo[0]; px[i + 1] = nuovo[1]; px[i + 2] = nuovo[2]; px[i + 3] = 255;

      var x = p % LATO;
      if (x > 0) daFare.push(p - 1);                    // a sinistra
      if (x < LATO - 1) daFare.push(p + 1);             // a destra
      if (p >= LATO) daFare.push(p - LATO);             // sopra
      if (p < LATO * (LATO - 1)) daFare.push(p + LATO); // sotto
    }
    ctx.putImageData(img, 0, 0);
  }


  /* ---------- 5. DITO E MOUSE ----------
     I "pointer events" funzionano sia con il mouse sia con il
     dito sia con la penna: un solo codice per tutti. */

  tela.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    var p = puntoDa(e);

    if (stato.strumento === 'riempi') { riempi(p); return; }

    salvaPerAnnulla();
    stato.disegnando = true;
    stato.ultimo = p;
    tela.setPointerCapture(e.pointerId);   // continua il tratto anche se si esce dal bordo
    tratto(p, p);                          // un tocco singolo lascia un puntino
  });

  tela.addEventListener('pointermove', function (e) {
    if (!stato.disegnando) return;
    var p = puntoDa(e);
    tratto(stato.ultimo, p);
    stato.ultimo = p;
  });

  function fineTratto() { stato.disegnando = false; stato.ultimo = null; }
  tela.addEventListener('pointerup', fineTratto);
  tela.addEventListener('pointercancel', fineTratto);


  /* ---------- 6. SCARICA IL PNG ---------- */

  function scarica() {
    // Lavoriamo su una copia per aggiungere la firma in basso
    // senza sporcare la lavagna.
    var copia = document.createElement('canvas');
    copia.width = LATO;
    copia.height = LATO;
    var c2 = copia.getContext('2d');
    c2.drawImage(tela, 0, 0);
    c2.font = '30px "Cal Sans", system-ui, sans-serif';
    c2.fillStyle = INCHIOSTRO;
    c2.textAlign = 'right';
    c2.fillText('Il mio sole · Grest Pofi', LATO - 32, LATO - 32);

    copia.toBlob(function (file) {
      var nome = 'il-mio-sole-grest-pofi.png';
      scaricaFile(file, nome); // SCARICA
    }, 'image/png');
  }

  // Crea un link invisibile al file e lo "clicca"
  function scaricaFile(file, nome) {
    var indirizzo = URL.createObjectURL(file);
    var link = document.createElement('a');
    link.href = indirizzo;
    link.download = nome;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(indirizzo); }, 1000);
    annuncia('Disegno scaricato');
  }


  /* ---------- 7. PULSANTI ---------- */

  function annuncia(testo) { if (annuncio) annuncio.textContent = testo; }

  // Accende un pulsante del gruppo e spegne gli altri
  function premi(gruppo, scelto) {
    gruppo.forEach(function (b) { b.setAttribute('aria-pressed', b === scelto ? 'true' : 'false'); });
  }

  var strumenti = Array.prototype.slice.call(lavagna.querySelectorAll('[data-strumento]'));
  strumenti.forEach(function (b) {
    b.addEventListener('click', function () {
      stato.strumento = b.dataset.strumento;
      premi(strumenti, b);
      annuncia('Strumento: ' + b.textContent.trim());
    });
  });

  var colori = Array.prototype.slice.call(lavagna.querySelectorAll('[data-colore]'));
  colori.forEach(function (b) {
    b.addEventListener('click', function () {
      stato.colore = b.dataset.colore;
      premi(colori, b);
      // scegliere un colore mentre c'è la gomma riporta al pennello
      if (stato.strumento === 'gomma') {
        stato.strumento = 'pennello';
        premi(strumenti, lavagna.querySelector('[data-strumento="pennello"]'));
      }
      annuncia('Colore: ' + b.getAttribute('aria-label'));
    });
  });

  var cursore = lavagna.querySelector('#lavagna-spessore');
  var valore = lavagna.querySelector('[data-spessore]');
  cursore.addEventListener('input', function () {
    stato.spessore = Number(cursore.value);
    if (valore) valore.textContent = cursore.value;
  });

  lavagna.querySelector('[data-azione="annulla"]').addEventListener('click', annulla);
  lavagna.querySelector('[data-azione="scarica"]').addEventListener('click', scarica);
  // "Nuovo" si può annullare: per questo non chiediamo conferma
  lavagna.querySelector('[data-azione="nuovo-sole"]').addEventListener('click', function () {
    salvaPerAnnulla(); soleDaColorare(); annuncia('Nuovo sole da colorare');
  });
  lavagna.querySelector('[data-azione="foglio-bianco"]').addEventListener('click', function () {
    salvaPerAnnulla(); foglioBianco(); annuncia('Foglio bianco');
  });

  // Si parte dal sole da colorare
  soleDaColorare();
})();
