# Come pubblicare un articolo – Guida per chi scrive

Non serve saper programmare. Un articolo è un normale file di testo.
Servono solo due cose: **scrivere il file** e **aggiungerlo all'elenco**.

---

## 1. Scrivi l'articolo

1. Apri la cartella `articoli`.
2. Fai una copia del file `_MODELLO.md`.
3. Rinomina la copia così: **anno-mese-titolo-breve.md**
   - solo lettere minuscole, numeri e trattini
   - niente spazi, accenti, apostrofi
   - ✅ `2027-07-festa-di-apertura.md`
   - ❌ `Festa d'apertura 2027.md`
4. Apri il file con un editor di testo semplice
   (Blocco note su Windows, TextEdit in modalità "testo semplice" su Mac,
   oppure Visual Studio Code). **Non usare Word.**
5. Compila la parte in alto, tra le due righe `---`:

| Campo | Cosa scrivere | Esempio |
|---|---|---|
| titolo | Il titolo dell'articolo | Festa di apertura 2027 |
| data | Anno-mese-giorno | 2027-07-13 |
| autore | Chi firma | Aurora |
| riassunto | 1-2 frasi per la lista | Una serata indimenticabile… |
| copertina | Percorso della foto (facoltativo) | img/articoli/apertura.jpg |

6. Sotto la seconda riga `---` scrivi il testo.

## 2. Le "regolette" di scrittura

| Scrivi così | Ottieni |
|---|---|
| Una riga vuota tra due blocchi di testo | Due paragrafi separati |
| `**parola**` | **parola** in grassetto |
| `*parola*` | *parola* in corsivo |
| `# Sottotitolo` all'inizio della riga | Un sottotitolo |
| `- testo` all'inizio della riga | Un elenco puntato |
| `1. testo` all'inizio della riga | Un elenco numerato |
| `> testo` all'inizio della riga | Una citazione |
| `[testo](https://indirizzo.it)` | Un link |
| `![descrizione](img/articoli/foto.jpg)` | Una foto |

Se sbagli una regoletta non si rompe niente: al massimo vedrai gli asterischi nel testo.

## 3. Le foto

- Mettile nella cartella `img/articoli/`, con nomi semplici (`apertura-2027.jpg`).
- Rimpicciolisci le foto prima di caricarle: **massimo 1600 px di larghezza**,
  così il sito resta veloce (ad esempio con squoosh.app, gratuito).
- ⚠️ **Mai foto di bambini riconoscibili senza la liberatoria firmata dai genitori.**
  Nel dubbio, foto di spalle, da lontano o dei soli animatori maggiorenni.

## 4. Aggiungi l'articolo all'elenco

1. Apri `articoli/elenco.txt`.
2. Scrivi il nome del file **senza `.md`** nella **prima riga libera in alto**
   (sotto le righe che iniziano con `#`). Il più recente sta in cima.

```
2027-07-festa-di-apertura
2026-10-benvenuti-sul-sito
```

Per nascondere un articolo senza cancellarlo, metti `#` davanti al suo nome.

## 5. Pubblica

Passa i file a chi gestisce il sito (o caricali tu dal File Manager di Aruba):
- il file `.md` nella cartella `articoli/`
- l'`elenco.txt` aggiornato
- le eventuali foto in `img/articoli/`

Poi apri il sito e controlla che l'articolo si veda bene.

---

**Prima di pubblicare, rileggi:** nomi scritti giusti? Date corrette?
Ci sono dati personali (telefoni, indirizzi, cognomi di minori) da togliere?
