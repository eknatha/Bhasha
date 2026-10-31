# Bhasha

Learn spoken languages from what you watch and read, by [EknathaLabs](https://eknathalabs.com). *Bhasha* means "language" in Sanskrit, Hindi, Telugu, Kannada and Malayalam (Tamil: *mozhi*).

Bhasha is inspired by tools such as Language Reactor, but it does not touch Netflix or YouTube. It works on **your own** video, audio and text, so nothing is uploaded and nothing depends on another site.

| Screen | What it does |
|---|---|
| **Say it** | Type an English sentence, pick Telugu, Hindi, Kannada, Tamil, Malayalam, Bengali, Marathi, Gujarati, Assamese, Korean, Spanish, German or French, and get the sentence with romanization and a voice. Exact phrasebook matches work everywhere offline (with a name template such as "My name is Ravi"). Free-form sentences use the browser's on-device translator where it exists (recent Chrome). Otherwise it shows the closest phrasebook entries. |
| **Watch** | Open your own video or audio plus one or two subtitle files (.srt or .vtt). Dual subtitles, tappable words, repeat a line, pause after each line, speed 0.5x to 1.5x, subtitle offset, hide or blur a subtitle line, record yourself and compare (shadowing). With no media file it reads the lines aloud (listen mode). |
| **Read** | Paste or open any text. Every word is tappable, with romanization over the word, read-aloud with sentence highlight, and words coloured by status (new, learning, known). |
| **My words** | Saved words with meaning, example and status. Export CSV, Anki (tab separated) or a JSON backup. Import them back. |
| **Review** | Spaced repetition (SM-2 style). Four modes: word to meaning, meaning to word, listening, fill the gap. |
| **Scripts** | Telugu, Hindi, Kannada, Tamil, Malayalam, Bengali, Marathi, Gujarati, Assamese and Korean letters, vowel signs and digits. Tap to hear, quick quiz, finger or mouse tracing. |
| **Daily lesson** | `/today/`: five new phrases a day in a fixed order, a listening quiz, then recall of older phrases that are due (spaced repetition, kept on your device). Bonus lessons on request. |
| **Pronunciation practice** | A 🎙 button on every phrase (Phrases, Daily lesson, Conversation transcript): hear the model, record yourself, play yours back, compare by ear and see your waveform. Recordings stay in memory and are never saved or uploaded. There is no automatic score on purpose. |
| **Free and private** | `/privacy/`: plain statement (free, no accounts, no ads, no tracking), live list of what is saved in this browser, download, restore from file and delete-everything. |
| **Conversations** | `/talk/`: six short role-plays (meeting someone, restaurant, directions, shopping, doctor, hotel). Hear their line, pick your reply in the language, retry on a miss, optional hide-text listening mode, transcript at the end. |
| **Phrases** | 250 everyday phrases in all thirteen languages (14 categories) with romanization (where the script needs it) and slow audio. Tap any word to save it. |

- Interface in all fourteen languages: English, Hindi, Telugu, Kannada, Tamil, Malayalam, Bengali, Marathi, Gujarati, Assamese, Korean, Spanish, German and French. Light, Dark and New themes shared with the rest of EknathaLabs.
- Thirteen learning languages: Telugu, Hindi, Kannada, Tamil, Malayalam, Bengali, Marathi, Gujarati, Assamese, Korean, Spanish, German, French. Text can be in any language. Brahmic scripts and Korean get romanization (simple or scholarly style; Korean uses Revised Romanization). Other languages work with tap, speak and save.
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
| `_build/src/ui.js` | Settings, saved-words store, word popup |
| `_build/src/speech.js` | Voices: device voice first, optional offline eSpeak NG fallback, Voice check dialog |
| `_build/src/v-*.js` | The screens (Read, Watch, My words and Review, Home, Scripts and Phrases) |
| `_build/src/i18n.js` | Interface text in fourteen languages |
| `_build/src/app.js`, `app.css` | Router, header, settings, styles |

## Tests

Tests need Playwright (`npm i -g playwright`, then `npx playwright install chromium`).

```
python3 -m http.server 8766        # in the repo root, in a second terminal
cd _build
node tests/core.test.js            # transliteration, spaced repetition, subtitle parsing, CSV
node tests/flow.js                 # read, save, words, CSV export, review, Say it (with and without a translator), scripts, phrases, watch with real audio
node tests/validate.js             # 250 phrases x 13 languages, 6 conversations, script and romanization checks, interface text complete in 14 languages
node tests/voice.js                # offline voice produces audible audio for all thirteen languages (browser with no device voices)
node tests/voice2.js               # device voice matching (odd language tags), Voice check dialog
node tests/audit.js                # overflow at 4 widths x 3 themes x 14 languages x 11 pages, contrast, keyboard, no outside requests, offline
```

## Needs a native speaker before you rely on it

- **Interface text** for every language except English, and the **250-phrase phrasebook and conversations in all thirteen languages** (`src/data.js`), are careful drafts, not reviewed by native speakers. `node tests/validate.js` checks completeness, script and placeholders, not correctness of meaning.
- **Say it** uses machine translation when the browser provides it. Treat results as a study aid. Marathi and Hindi detection is by script only, so choose the language yourself for Devanagari text.
- **Romanization** is rule-based. It follows common spoken pronunciation (for example Hindi drops the final schwa), so it can differ from what a given speaker says. Simple style does not mark long and short vowels; scholarly style does.
- **Speech voices** come from the device first. If a language has no device voice (common for Assamese, Telugu, Kannada, Malayalam, Tamil, Bengali, Marathi on some systems) Bhasha offers a one-time ~18 MB download of an offline voice (eSpeak NG, robotic but audible). Settings, Voice check shows what each language will use. Tested here: all ten languages produce audio via the offline voice; real device voices vary and were checked only with mocks.
- **Subtitles and media** are yours to supply. Bhasha does not download or fetch any video.

## Licence note

`vendor/espeak/` is [eSpeak NG](https://github.com/espeak-ng/espeak-ng) (npm `espeak-ng` 1.0.2), licensed **GPL-3.0-or-later** (see `vendor/espeak/LICENSE`). It is loaded only after the user agrees. If you do not want GPL code in the repository, delete `vendor/espeak/` and set the offline voice to Off; device voices keep working.


- **Assamese and Gujarati**: new in this release and drafted without native review. Assamese romanization is rule-based and approximate (it shares a script with Bengali, so Marathi/Hindi and Assamese/Bengali cannot be told apart from the text alone; pick the language yourself). Gujarati uses the bundled Noto Sans Gujarati font.

## Feel (sound, vibration, celebration)
Short synthesised sounds (no audio files), vibration on phones and a confetti burst when a lesson or conversation finishes. Sound and vibration have switches in Settings (both on by default); confetti and the step animation are skipped when the system asks for reduced motion.

## More tests
`node tests/feel.js` covers recording, the waveform, a blocked or missing microphone, sounds and vibration (including off), reduced motion, the Settings switches, and the whole Free and private page (counts, no outside requests, no cookies, export, delete, restore, wrong file) in all 14 interface languages. Run it with Chromium's fake microphone (the test sets this up itself).
