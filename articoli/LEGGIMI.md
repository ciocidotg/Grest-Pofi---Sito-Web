# Sito Grest Pofi ODV – Guida per chi sviluppa

Sito statico in **HTML + CSS + un po' di JavaScript**, senza librerie esterne,
senza database, senza programmi da installare. Si pubblica copiando i file su Aruba.

## Struttura delle cartelle

```
grest-pofi-sito/
├── index.html            ← la pagina unica a scorrimento (5 sezioni)
├── articoli.html         ← lista degli articoli
├── articolo.html         ← pagina del singolo articolo (?a=nome-file)
├── privacy.html          ← informativa privacy (BOZZA da completare)
├── css/
│   └── style.css         ← tutto lo stile; le variabili sono in cima
├── js/
│   ├── main.js           ← menu mobile, pulsanti "Copia", anno nel footer
│   └── articoli.js       ← legge e mostra gli articoli
├── fonts/               ← file dei font (da scaricare, vedi sotto)
├── img/
│   ├── logo.svg          ← logo provvisorio (sostituire)
│   └── articoli/         ← foto degli articoli
├── articoli/
│   ├── elenco.txt        ← quali articoli mostrare, in che ordine
│   ├── _MODELLO.md       ← modello da copiare per un nuovo articolo
│   └── 2026-10-benvenuti-sul-sito.md
└── GUIDA-ARTICOLI.md     ← guida per chi scrive (da dare ad Aurora)
```

## Provare il sito sul proprio computer

La pagina principale si apre anche con doppio clic su `index.html`.
**Gli articoli no**: il browser blocca la lettura dei file `.md` da `file://`.
Serve un mini server locale, a scelta:

- **Visual Studio Code** + estensione *Live Server* → tasto destro su `index.html` → *Open with Live Server*
- oppure, da terminale nella cartella del sito: `python -m http.server 8000`
  e poi aprire `http://localhost:8000`

Su Aruba funziona tutto senza configurazioni.

## Le cose da completare (cercate "DA COMPLETARE" e "DA VERIFICARE")

- [ ] Codice fiscale dell'associazione (sezione Supportaci + footer)
- [ ] IBAN per le donazioni
- [ ] Indirizzo esatto del profilo Instagram
- [ ] Dettagli del Grest: età, periodo, orari
- [ ] Numeri in "Chi siamo" (edizioni, animatori, bambini)
- [ ] Foto vera al posto del riquadro a righe in "Chi siamo"
- [ ] Logo vero al posto di `img/logo.svg`
- [ ] Immagine di anteprima per WhatsApp/Facebook (`og:image`, 1200×630)
- [ ] Informativa privacy: completarla e farla verificare
- [ ] Iscrizione RUNTS: verificare il numero/la dicitura nel footer

## Portare la UI del designer

Lo stile di partenza è **neo-brutalista**: bordi neri spessi, ombre piene
sfalsate, angoli vivi, colori accesi (giallo sole, rosa, azzurro, menta, pesca).

1. **Colori, font, bordi, ombre, spazi**: si cambiano dalle variabili
   in cima a `css/style.css` (sezione 1). Iniziate sempre da lì.
   Esempi rapidi: `--radius: 12px` ammorbidisce tutti gli angoli;
   `--border: 2px solid ...` alleggerisce il tratto.
2. **Componenti riutilizzabili** (sezione 4 del CSS):
   - `box` → riquadro bianco con bordo e ombra
   - `sticker` (+ `sticker--pink`, `sticker--paper`) → etichetta ruotata
   - `icon` (+ `icon--sun`, `--pink`, `--sky`, `--mint`, `--peach`) → quadratino con icona
   - `btn` (+ `btn--primary`, `btn--small`) → pulsanti
   - `highlight` → evidenziatore giallo dietro una parola
3. **Struttura delle sezioni**: ogni sezione in `index.html` è delimitata da un
   commento grande `<!-- ===== N. NOME ===== -->`.
4. **Immagine della splash**: al posto del disegno SVG potete mettere una foto,
   c'è un commento con la riga pronta.
5. **Nastro scorrevole**: le parole sono scritte due volte (serve per l'effetto
   continuo): modificate entrambe le righe. Chi ha "riduci movimento" attivo
   sul telefono lo vede fermo.

## Font: Space Grotesk e Space Mono

Sono font gratuiti (licenza OFL). Li ospitiamo sul nostro sito invece di
caricarli da Google Fonts, che per il GDPR è sconsigliato.

1. Andate su **fontsource.org**, cercate *Space Grotesk* e *Space Mono* e scaricateli.
2. Copiate questi due file nella cartella `fonts/` (createla accanto a `css/`):
   - `space-grotesk-latin-variable.woff2` (dalla variante "variable")
   - `space-mono-latin-700-normal.woff2`
3. Fatto: il CSS li cerca già con questi nomi. Se il nome è diverso,
   correggetelo nella sezione 2 del CSS.

Finché i file non ci sono, il sito usa font di sistema simili e funziona lo stesso.

## Attivare il link "Articoli" nel menu

In `index.html`, nel menu, togliete il commento alla riga:
```html
<!-- <li><a href="articoli.html">Articoli</a></li> -->
```

## Pubblicare su Aruba

1. Nel pannello Aruba, attivate (se non c'è già) il **certificato SSL** gratuito,
   così il sito è su `https://`.
2. Caricate **il contenuto** della cartella `grest-pofi-sito` (non la cartella stessa)
   nella cartella principale del sito, di solito `www.vostrodominio.it/`,
   con il **File Manager** del pannello oppure con un programma FTP come **FileZilla**
   (i dati FTP sono nell'email di attivazione Aruba).
3. Aprite il sito e controllate: menu da telefono, link, pagina articoli.

Consiglio: tenete il codice anche su **GitHub** (gratis). Così avete la storia
di ogni modifica e potete tornare indietro se qualcosa si rompe.

## Prossimi passi (non ancora inclusi, da studiare con calma)

- **Archivio foto**: richiede regole chiare su liberatorie e minori,
  e probabilmente un'area non pubblica.
- **Iscrizioni**: tratta dati di minori (anche sanitari, es. allergie);
  va progettata con attenzione a privacy, conservazione dei dati e sicurezza.
