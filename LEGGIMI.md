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
├── LEGGIMI.md            ← questa guida
├── css/
│   └── style.css         ← tutto lo stile; le variabili sono in cima
├── js/
│   ├── main.js           ← menu mobile, pulsanti "Copia", anno nel footer
│   └── articoli.js       ← legge e mostra gli articoli
├── fonts/                ← file dei font (Instrument Serif e Cal Sans)
├── img/
│   ├── SOLESPILLA.png    ← logo usato nel menu e come icona della scheda
│   ├── logo.svg          ← vecchio logo provvisorio (non più usato)
│   └── articoli/         ← foto degli articoli
└── articoli/
    ├── elenco.txt        ← quali articoli mostrare, in che ordine
    ├── _MODELLO.md       ← modello da copiare per un nuovo articolo
    ├── GUIDA-ARTICOLI.md ← guida per chi scrive (da dare ad Aurora)
    └── 2026-10-benvenuti-sul-sito.md
```

**Importante:** `articoli.html` e `articolo.html` devono stare nella cartella
principale, accanto a `index.html`. Tutti i loro collegamenti (`css/`, `js/`,
`img/`, `articoli/`) partono da lì.

## Provare il sito sul proprio computer

La pagina principale si apre anche con doppio clic su `index.html`.
**Gli articoli no**: il browser blocca la lettura dei file `.md` da `file://`.
Serve un mini server locale, a scelta:

- **Visual Studio Code** + estensione *Live Server* → tasto destro su `index.html` → *Open with Live Server*
- oppure, da terminale nella cartella del sito: `python -m http.server 8000`
  e poi aprire `http://localhost:8000`

**Su Mac, passo per passo:**
1. Apri *Terminale* (Cmd + Spazio, scrivi "Terminale").
2. Scrivi `cd ` (con lo spazio dopo), trascina la cartella del sito nella finestra e premi Invio.
3. Scrivi `python3 -m http.server 8000` e premi Invio.
   La prima volta il Mac può chiedere di installare gli "strumenti per sviluppatori": accetta.
4. Nel browser apri `http://localhost:8000`. Per fermare il server: Ctrl + C nel Terminale.

Se apri le pagine con doppio clic, al posto degli articoli compare un riquadro
che spiega proprio questo.

Su Aruba funziona tutto senza configurazioni.

## Le cose da completare (cercate "DA COMPLETARE" e "DA VERIFICARE")

- [ ] IBAN per le donazioni
- [ ] Indirizzo esatto del profilo Instagram
- [ ] Grest campo estivo: descrizione, età, periodo, orari
- [ ] Loghi della Regione e di Armonia Circolare nei banner
- [ ] Numeri in "Chi siamo" (edizioni, animatori, bambini)
- [ ] Foto vera al posto del disegno nella splash
- [ ] Immagine di anteprima per WhatsApp/Facebook (`og:image`, 1200×630)
- [ ] Informativa privacy: completarla e farla verificare
- [ ] Iscrizione RUNTS: verificare il numero/la dicitura nel footer

## Portare la UI del designer

Lo stile è **neo-brutalista**: bordi neri spessi, ombre piene sfalsate,
angoli vivi, colori della palette **Armonia Circolare**.

1. **Colori, font, bordi, ombre, spazi**: si cambiano dalle variabili
   in cima a `css/style.css` (sezione 1). Iniziate sempre da lì.
   - Colori: `--AC-giallo`, `--AC-arancione`, `--AC-verde`, `--AC-azzurro`,
     `--AC-rosa`, `--AC-sfondoBianco`
   - Font: `--font-primario` (titoli) e `--font-secondario` (testi)
   - Esempi rapidi: `--radius: 12px` ammorbidisce tutti gli angoli;
     `--border: 2px solid ...` alleggerisce il tratto.
2. **Griglia da 1 cm**: `--gutter` è il margine laterale e la distanza tra i box.
   Vale 16px su telefono e 40px (circa 1 cm) da 1024px in su.
   Se usate `var(--gutter)` per le nuove distanze, tutto resta allineato.
3. **Componenti riutilizzabili** (sezione 4 del CSS):
   - `box` → riquadro bianco con bordo e ombra
   - `sticker` (+ `sticker--rosa`, `sticker--paper`) → etichetta ruotata
   - `icon` (+ `icon--giallo`, `--arancione`, `--verde`, `--azzurro`, `--rosa`) → quadratino con icona
   - `btn` (+ `btn--primary`, `btn--small`) → pulsanti
   - `highlight` → evidenziatore giallo dietro una parola
4. **Sezione Attività**: è divisa in tre blocchi, spiegati nei commenti di `index.html`:
   - `card card--featured` → box grande a tutta larghezza (Grest campo estivo)
   - `progetto` → riquadro colorato di un progetto, con dentro una `griglia-3`
     dove mettere box minori (`card`), banner lunghi (`banner banner--3`)
     e banner da una colonna (`banner banner--1`)
   - `cards` → box minori delle altre attività
5. **Struttura delle sezioni**: ogni sezione in `index.html` è delimitata da un
   commento grande `<!-- ===== N. NOME ===== -->`.
6. **Immagine della splash**: al posto del disegno SVG potete mettere una foto,
   c'è un commento con la riga pronta.
7. **Nastro scorrevole**: le parole sono scritte due volte (serve per l'effetto
   continuo): modificate entrambe le righe. Chi ha "riduci movimento" attivo
   sul telefono lo vede fermo.

## Font: Instrument Serif e Cal Sans

Sono font gratuiti (licenza OFL). Li ospitiamo sul nostro sito invece di
caricarli da Google Fonts, che per il GDPR è sconsigliato.

Nella cartella `fonts/` servono tre file:
- `instrument-serif-latin-400-normal.woff2` → titoli del sito e testo degli articoli
- `instrument-serif-latin-400-italic.woff2` → sottotitoli degli articoli e *corsivo*
  (**da scaricare**: su fontsource.org cercate *Instrument Serif*, stile *Italic*, sottoinsieme *latin*)
- `cal-sans-latin-400-normal.woff2` → testi del sito e titoli degli articoli

Esistono solo nel peso normale (400), quindi nel CSS non usiamo
il grassetto: lo farebbe il browser "a mano" e verrebbe sbavato.
Finché manca il file del corsivo, al suo posto si vede il corsivo di Georgia.

## Pagina con tutti gli articoli

`articoli.html` mostra gli articoli come box (classe `scheda`, stile nella sezione 8
di `style.css`). Il più recente è un box grande a tutta riga. Se un articolo non ha
copertina, al suo posto c'è un riquadro colorato con la data.

I filtri (logica in `js/articoli.js`, funzione `paginaLista`):
- **Cerca**: cerca in titolo, sottotitolo, riassunto, autore e testo. Più parole
  vanno trovate tutte; maiuscole e accenti non contano ("citta" trova "città").
- **Anno**: il menu si riempie da solo con gli anni delle date degli articoli.
- **Data di aggiunta**: più recenti o meno recenti prima, secondo il campo `data:`.

I filtri restano nell'indirizzo (es. `articoli.html?anno=2026&q=presepe`):
un link così si può condividere e mostra gli stessi risultati.

## Pagina del singolo articolo

`articolo.html` è impaginata come una rivista (sezione 9 di `style.css`):
titolo in Cal Sans, sottotitolo in Instrument Serif corsivo, testo in Instrument Serif,
in una colonna stretta. La larghezza della colonna si cambia con `--colonna`.
Il sottotitolo viene dal campo `sottotitolo:` del file `.md`; se manca, si usa `riassunto:`.
Se cambiate nome a un file, correggetelo nella sezione 2 del CSS.

## Menu e footer

Il link "Articoli" è attivo nel menu e nel footer di tutte le pagine.
`articoli.html`, `articolo.html` e `privacy.html` hanno lo stesso menu e lo stesso
footer della home, con i link che puntano a `index.html#sezione`.
**Se cambiate il menu o il footer in `index.html`, cambiateli anche in queste tre pagine.**
La voce della pagina in cui ci si trova ha `aria-current="page"` e appare evidenziata in giallo.

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
