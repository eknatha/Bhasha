# Bhasha

Learn spoken languages from what you watch and read, by [EknathaLabs](https://eknathalabs.com). *Bhasha* means "language" in Sanskrit, Hindi, Telugu, Kannada and Malayalam (Tamil: *mozhi*).

Bhasha is inspired by tools such as Language Reactor, but it does not touch Netflix or YouTube. It works on **your own** video, audio and text, so nothing is uploaded and nothing depends on another site.

| Screen | What it does |
|---|---|
| **Watch** | Open your own video or audio plus one or two subtitle files (.srt or .vtt). Dual subtitles, tappable words, repeat a line, pause after each line, speed 0.5x to 1.5x, subtitle offset, hide or blur a subtitle line, record yourself and compare (shadowing). With no media file it reads the lines aloud (listen mode). |
| **Read** | Paste or open any text. Every word is tappable, with romanization over the word, read-aloud with sentence highlight, and words coloured by status (new, learning, known). |
| **My words** | Saved words with meaning, example and status. Export CSV, Anki (tab separated) or a JSON backup. Import them back. |
| **Review** | Spaced repetition (SM-2 style). Four modes: word to meaning, meaning to word, listening, fill the gap. |
| **Scripts** | Telugu, Hindi, Kannada, Tamil and Malayalam letters, vowel signs and digits. Tap to hear, quick quiz, finger or mouse tracing. |
| **Phrases** | 43 everyday phrases in the five Indian languages with romanization and slow audio. Tap any word to save it. |

- Interface in English, Hindi, Telugu, Kannada, Tamil and Malayalam. Light, Dark and New themes shared with the rest of EknathaLabs.
- Text can be in any language. Indian languages get romanization (two styles: simple and scholarly). Other languages work with tap, speak and save.
- No sign-up, no ads, no tracking, no third-party requests. Saved words stay in your browser (`localStorage`). Export a backup now and then.
- Works offline after the first visit (service worker).
- Optional: if your browser has the on-device Translator API (recent Chrome), a "Translate on device" button appears. Nothing is sent to a server. Wiktionary and Google Translate links open only when you click them.

## Deploy (GitHub Pages)

1. Push this folder as the root of a new repository.
2. Settings, Pages: deploy from the `main` branch, root folder.
3. Add the custom domain `bhasha.eknathalabs.com` and a DNS `CNAME` record pointing to your Pages host.

The site is plain static files. The generated pages are already committed, so no build is needed to deploy.

## Rebuild after changing the source

```
cd _build
node build.js     # bundles src/*.js into app.js, writes the route pages, sitemap, manifest and service worker
```

Node 18 or newer, no npm dependencies. Set `BHASHA_BASE` if the site lives on another domain.

| Path | What |
|---|---|
| `_build/src/core.js` | DOM-free engine: language list, language detection, Brahmic to Latin transliteration, spaced repetition, SRT/VTT parser, tokenizer, CSV |
| `_build/src/data.js` | Script charts, numerals, phrasebook, sample subtitles |
| `_build/src/ui.js` | Settings, speech, saved-words store, word popup |
| `_build/src/v-*.js` | The screens (Read, Watch, My words and Review, Home, Scripts and Phrases) |
| `_build/src/i18n.js` | Interface text in six languages |
| `_build/src/app.js`, `app.css` | Router, header, settings, styles |

## Tests

Tests need Playwright (`npm i -g playwright`, then `npx playwright install chromium`).

```
python3 -m http.server 8766        # in the repo root, in a second terminal
cd _build
node tests/core.test.js            # transliteration, spaced repetition, subtitle parsing, CSV
node tests/flow.js                 # read, save, words, CSV export, review, scripts, phrases, watch with real audio
node tests/audit.js                # overflow at 4 widths x 3 themes x 4 languages x 7 pages, contrast, keyboard, no outside requests, offline
```

## Needs a native speaker before you rely on it

- **Interface text** for Hindi, Telugu, Kannada, Tamil and Malayalam, and the **43-phrase phrasebook** (`src/data.js`), are careful drafts, not reviewed by native speakers.
- **Romanization** is rule-based. It follows common spoken pronunciation (for example Hindi drops the final schwa), so it can differ from what a given speaker says. Simple style does not mark long and short vowels; scholarly style does.
- **Speech voices** come from the device. Telugu, Kannada, Malayalam and Tamil voices may be missing on some phones and desktops. Bhasha tells you when a voice is missing.
- **Subtitles and media** are yours to supply. Bhasha does not download or fetch any video.
