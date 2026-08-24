# Survey question JSON reference

Survey stimuli are defined with SurveyJS JSON, passed to add-stimulus and edit-stimulus with `--questions`.
iMotions uses a restricted and extended version of SurveyJS, so read this before writing the JSON instead of relying on general SurveyJS knowledge.

## Overall structure

```json
{
    "title": "Ad feedback",
    "showCompletedPage": false,
    "pages": [
        {"elements": [{"type": "rating", "name": "liking", "title": "How much did you like the ad?"}]},
        {"elements": [{"type": "comment", "name": "feedback", "title": "Any other feedback?"}]}
    ]
}
```

- Always set `showCompletedPage` to false. Respondents step through the pages and advance to the next stimulus when done.
- A question's `name` becomes the key of its answers in respondent-details and list-respondents-csv, so make the names short, stable and descriptive.
- In `choices`, use `{"value": "...", "text": "..."}` entries when the stored answer value should differ from the displayed text; plain strings are used as both.
- `title` is the question text shown to the respondent, `isRequired: true` makes a question mandatory, and conditional logic with `visibleIf` (e.g. `"{liking} <= 2"`) is supported.
- Make sure question and option texts are short and easy to understand. Respondents might not have English as their first language.

## Supported question types

Standard SurveyJS types:
- `radiogroup` (single choice)
- `checkbox` (multiple choice, optionally with `minSelectedChoices`/`maxSelectedChoices`)
- `dropdown`
- `ranking`
- `imagepicker` (choices as `{"value": "...", "imageLink": "url"}`)
- `buttongroup`
- `rating` (scale, optionally with `rateMin`/`rateMax`/`minRateDescription`/`maxRateDescription`)
- `matrix` (grid of `rows` rated against `columns`)
- `matrixdropdown`
- `text` (free text, optionally with `inputType` such as number, date or email)
- `multipletext`
- `comment` (multi-line free text)
- `image` (shows the image at `imageLink`, see "Images in surveys" below).

**Not supported**: `html`, `file`, `boolean`, `panel`, `paneldynamic`, `tagbox`, `matrixdynamic`, `signaturepad` and `expression`. Do not use them; use the iMotions types below instead where they fit.

## iMotions-specific question types

`instruction` displays text without asking anything, formatted with markdown. Use it instead of `html`:

```json
{"type": "instruction", "name": "intro", "instruction": "## Welcome\nYou will now see a series of ads.\n- Watch each one fully\n- Answer the questions after each"}
```

`nouislider` is a slider that stores a number. Use it for continuous scales:

```json
{
    "type": "nouislider",
    "name": "purchase_intent",
    "title": "How likely are you to buy this product?",
    "rangeMin": 0,
    "rangeMax": 100,
    "step": 1,
    "pipsValues": [0, 25, 50, 75, 100],
    "pipsText": [{"value": 0, "text": "Not at all"}, {"value": 100, "text": "Definitely"}]
}
```

`rangeMin`/`rangeMax`/`step` control the scale (defaults 0/100/1). `pipsValues` sets where labels are shown along the slider, and `pipsText` optionally replaces those numbers with texts.

## Images in surveys

Image URLs in the JSON, such as `imageLink` on the `image` and `imagepicker` types or the survey `logo`, can be given in three forms:

- A publicly reachable http or https URL, used as-is.
- `file://` followed by the path of a local image file, which is uploaded into the study, e.g. `"imageLink": "file://./ads/variant-a.png"`.
- `library://` followed by the name of an image in the media library (shown by list-media), which is copied into the study, e.g. `"imageLink": "library://logo.png"`, or with the folder path when several files share a name, e.g. `"library://Campaign A/logo.png"`.

The `file://` and `library://` references are replaced with real URLs when the survey is saved, wherever they appear in the JSON, so stimulus-details afterwards shows the resolved URLs.
`file://` only works in the CLI, not through the MCP server; there, upload the image with the web interface or reference an existing media library file with `library://` instead.

## Verifying

After creating or editing a survey, stimulus-details shows a summary of the questions.
The user can preview the survey and refine it visually in the study builder in the web interface, so mention that when handing over.
