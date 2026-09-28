# ES → EN Oral Quiz

A single-page quiz for practicing spoken English translation from Spanish. It shows a Spanish sentence, you say the English translation out loud, then reveal the answer to check yourself.

**Live:** deployed via GitHub Pages on push to `master` ([workflow](.github/workflows/deploy.yml)).

## Usage

1. Go to <https://gorcajo.github.io/english-quiz/>
2. Pick which topics/sections to include.
3. Click **Start quiz**.
4. Say the translation, then press **Enter/Space** or click the button to reveal the answer.
5. Press again to get the next card.

## Running locally

Browsers block `fetch` on local JSON files opened via `file://`, so serve the folder instead:

```bash
python3 -m http.server --directory src
```

Then open `http://localhost:8000`.

## Adding exercises

Exercises live in JSON files in the [src/resources/](src/resources/) directory (e.g. [conditionals.json](src/resources/conditionals.json), [modals.json](src/resources/modals.json), [there-to-be.json](src/resources/there-to-be.json)), each structured as:

```json
{
  "title": "Topic name",
  "sections": [
    {
      "id": 1,
      "name": "Section name",
      "items": [
        { "es": "Spanish sentence.", "en": "English sentence." }
      ]
    }
  ]
}
```

To add a new topic file, also add its filename to `JSON_FILES` in [src/index.html](src/index.html).
