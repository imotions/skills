# Editing the study design

These commands change the design of a study: its flows, blocks and stimuli.
The design can only be edited while the study is being built. Once data collection has started, the commands fail with an explanation.
Always run study-overview first to see the current design, and check with the user before deleting anything.

These commands are only available if study creation and editing was granted when the connection to iMotions was authorized.
If a command fails because the permissions are missing, relay the explanation to the user instead of retrying. They can grant the permissions by running the logout command and authorizing again.

## How a study is structured

- A **stimulus** is a single piece of content shown to the respondent: an image, a video, a website, a survey or an instruction text.
- A **flow** is the ordered sequence of stimuli that a respondent goes through, from top to bottom. Every study has at least one flow. When a study has multiple flows, each respondent is assigned exactly one of them, which is how between-group designs are built (e.g. one group sees ad A, the other ad B). How the flow is assigned is controlled with `edit-study --flow-selection`.
- A **block** is a group of stimuli inside a flow that belong together. The stimuli in a block stay next to each other, and blocks are the unit of position randomization: items (stimuli or whole blocks) that are marked as randomized are shuffled among each other within their block, while items marked as fixed keep their position. The marker is changed with `edit-stimulus --randomized/--fixed` for a stimulus and `edit-block --randomized/--fixed` for a whole block.
- The same stimulus can be used in several flows. Such a stimulus is shared: its settings, content and collected data are the same everywhere, and edit-stimulus affects every flow it is in. For content that is supposed to be the same, it is important to make it the same shared stimulus, rather than two different stimuli with the same data in them. delete-stimulus only removes it from one flow, and it is only deleted permanently when it is not used in any other flow.
- Studies with eye tracking have automatically managed **calibration slides** near the start and end of each flow. Do not attempt to move, rename or delete them; new stimuli are automatically placed before the post-calibration slide.

## Create study

Create a new empty study.

`aimotions create-study "Study name"`

The study is placed at the top level of the account's folder tree unless an existing folder is picked with `--folder "Folder name"` (see Folders below).

The new study has a single empty flow and the default webcam-based sensors, with calibration slides already in place when eye tracking is on. Build its design with the commands below. The sensors, device types and data collection settings, and starting data collection itself, are managed by the user in the web interface.

## Create flow

Create a new empty flow at the end of the study's flows.

`aimotions create-flow "Study name" "Flow name"`

## Rename flow

`aimotions edit-flow "Study name" "Flow name" --name "New name"`

## Copy flow

Create a new flow containing the same stimuli as an existing one. The stimuli are shared, not copied, so editing one affects both flows. Use this for between-group designs: copy the flow, then use delete-stimulus, add-stimulus and move-stimulus to make the variants differ.

`aimotions copy-flow "Study name" "Flow name" "New flow name"`

## Delete flow

Delete a flow. **Stimuli that are only used in this flow are permanently deleted with it**, so check the study overview and ask the user first. Studies must have at least one flow.

`aimotions delete-flow "Study name" "Flow name"`

## Create block

Create a block at the end of a flow. With `--stimuli`, the named stimuli are moved from the flow into the block, in the order they are given. Use move-block to place the block somewhere else in the flow afterwards.

`aimotions create-block "Study name" "Flow name" "Block name" --stimuli "Ad 1,Ad 2,Ad 3"`

## Edit block

Rename a block or change its position randomization. Only the specified options are changed.

`aimotions edit-block "Study name" "Flow name" "Block name" --name "New name" --randomized`

`--randomized` shuffles the whole block as one unit with the other randomized items around it, for each respondent. The stimuli inside it keep their own order and randomization settings. `--fixed` (the default for new blocks) keeps it in place.

## Move block

Move a block to a different position within its flow. The stimuli inside it move with it. The destination is given with `--after "Name"` (a stimulus or block name), `--first` or `--last`, like in move-stimulus.

`aimotions move-block "Study name" "Flow name" "Block name" --after "Intro"`

## Delete block

Delete a block from a flow. **Stimuli that are only used in this block are permanently deleted with it.** To keep a stimulus, first move it out with `move-stimulus --out-of-block`.

`aimotions delete-block "Study name" "Flow name" "Block name"`

## Add stimulus

Add a new stimulus at the end of a flow (before the post-calibration slide, if the study uses eye tracking). The type must be one of:

- `image`: shows an image (png, jpg, gif, webp or bmp), either uploaded from a local file with `--file` or reused from the media library with `--library-file` (see below). Shown for 6 seconds unless `--exposure-ms` is given.
- `video`: shows an mp4 video, either uploaded with `--file` or reused from the media library with `--library-file`, for the length of the video. Uploaded videos also need a thumbnail image for the analysis views, given with `--thumbnail`. Extract a representative frame from the video, e.g. `ffmpeg -i video.mp4 -frames:v 1 thumbnail.jpg` if ffmpeg is available. Library files already have a thumbnail.
- `web`: shows the website given with `--url`. It will be displayed in an iframe which not all websites support.
- `qualtrics`: shows the Qualtrics survey given with `--url`.
- `survey`: a survey built with SurveyJS. Give the questions as SurveyJS JSON with `--questions`, e.g. `--questions "{\"pages\": [{\"elements\": [{\"type\": \"rating\", \"name\": \"liking\", \"title\": \"How much did you like the ad?\"}]}]}"`. Respondents advance it themselves when done. iMotions supports a restricted and extended set of question types, so read [survey-questions.md](./survey-questions.md) before writing the JSON.
- `instruction`: shows the text given with `--instructions` (simple HTML formatting is supported).

`aimotions add-stimulus "Study name" "Flow name" "Stimulus name" --type web --url "https://example.com"`

`aimotions add-stimulus "Study name" "Flow name" "Stimulus name" --type image --file photo.jpg`

To control how long the stimulus is shown, add `--exposure-ms` with a number of milliseconds. Each type has a sensible default (websites 5 minutes, instructions 30 seconds).
To add the stimulus inside a block instead of directly in the flow, add `--block "Block name"`.
Media files should be at most 1920x1080; larger files hurt the respondents' data quality. Videos are limited to 30 minutes.

### Media library

The account has a shared media library of images and videos that can be reused across studies, managed by the user in the web interface. List its contents:

`aimotions list-media`

To use a library file as a stimulus, give its name to add-stimulus with `--library-file` instead of uploading a local file:

`aimotions add-stimulus "Study name" "Flow name" "Stimulus name" --type image --library-file "photo.png"`

When several library files share a name, include the folder path shown by list-media, e.g. `--library-file "Campaign A/photo.png"`.
The stimulus gets a copy of the library file's content, so later changes to the library file do not affect the stimulus.
Prefer the media library when the user already keeps their stimuli there, or when adding the same content to several studies.

Local files can also be uploaded to the library, which is useful when the same file will be used in several studies:

`aimotions create-media photo.png`

`aimotions create-media video.mp4 --thumbnail thumbnail.jpg`

Videos need a thumbnail image, like in add-stimulus. The file is placed in the shared Media folder unless another library folder is picked with `--folder "Folder name"` (create one with create-folder if needed), and is named after the file unless `--name "Name"` is given.
Uploading a file whose content is already in the library fails and points to the existing file; reuse that file, or add `--ignore-duplicate` if the user wants a second copy on purpose.

## Edit stimulus

Rename a stimulus or change its settings or content. Only the specified options are changed.

`aimotions edit-stimulus "Study name" "Stimulus name" --name "New name" --exposure-ms 10000`

- `--url` changes the address of a web or Qualtrics stimulus.
- `--exposure-ms` changes how long the stimulus is shown. On videos, -1 means the full video length.
- `--instructions` replaces the text of an instruction stimulus.
- `--questions` replaces the SurveyJS JSON of a survey stimulus entirely, so include the existing questions (shown by stimulus-details) if they should be kept. Read [survey-questions.md](./survey-questions.md) for the supported question types.
- `--aoi-selectors` sets the page elements to track as AOIs on a web or Qualtrics stimulus (see below).
- `--randomized` shows the stimulus in random order: for each respondent it is shuffled with the other randomized items directly next to it in the flow or block, while fixed items keep their position. `--fixed` (the default for new stimuli) keeps it in place. To shuffle a group of stimuli among themselves without mixing them into the rest of the flow, put them in a block first and randomize the stimuli inside the block.

If the stimulus is used in several flows, the change affects all of them, except `--randomized`/`--fixed` which are set per flow: add `--flow "Flow name"` to pick one when the stimulus is in more than one flow.

### Website AOIs

On web and Qualtrics stimuli, AOIs are not drawn as shapes like on images and videos. Instead they track the position of HTML elements on the page, identified by CSS selectors, so they follow the elements when the respondent scrolls or the layout changes. Set them as semicolon-separated `name: CSS selector` pairs:

`aimotions edit-stimulus "Study name" "Web stimulus" --aoi-selectors "Logo: #logo; Menu: nav > ul; Buy button: .checkout button"`

The option replaces the existing selectors entirely (shown by stimulus-details), and an empty value removes them all.

This only works when the website includes the iMotions tracking snippet in its HTML, so it cannot be used on third-party websites whose code cannot be changed. The snippet has the form `<script type="module" src="<data collection URL>/imotions.js"></script>`; the command output includes the exact snippet with the right URL for the user's region. Add it to the website's `<head>` yourself if you are building the website or have access to its code, and otherwise give it to the user to add. For Qualtrics surveys, the snippet is added under Look and Feel - General by editing the Header: in the dialog that opens, click the Source button and paste in the snippet (pasting without clicking Source shows it as text instead).

Prefer short, stable selectors such as ids or descriptive class names. If you are building the page, give the elements to track stable ids and use those as the selectors. To find a selector on an existing page, right-click the element in the browser, select Inspect, right-click the highlighted element and select Copy - Copy selector. The user can preview the tracked positions on the stimulus's Website AOIs page in the web interface.

## Move stimulus

Move a stimulus to a different position within a flow. The destination is given with one of:

- `--after "Name"`: place it after the stimulus or block with that name.
- `--first` / `--last`: place it at the start or end.
- `--to-block "Block name"`: move it into a block (optionally combined with a position option).
- `--out-of-block`: move it out of its block, to the end of the flow itself (optionally combined with a position option).

`aimotions move-stimulus "Study name" "Flow name" "Stimulus name" --after "Intro"`

In studies with eye tracking, a stimulus can also be placed before the pre-calibration slide or after the post-calibration slide. This is mainly useful for instructions; keep the stimuli that collect data between the calibration slides.

## Delete stimulus

Remove a stimulus from a flow. If it is not used in any other flow, **the stimulus and its settings are permanently deleted**.

`aimotions delete-stimulus "Study name" "Flow name" "Stimulus name"`

## Edit study

Rename the study or change study-wide settings. Only the specified options are changed.

`aimotions edit-study "Study name" --name "New name"`

`--flow-selection` controls how respondents are assigned to a flow in studies with multiple flows:

`aimotions edit-study "Study name" --flow-selection random`

- `manual`: each flow has its own data collection link, and respondents get the flow whose link they were sent.
- `random`: each respondent gets a flow picked randomly among all the flows.
- `balanced`: each respondent gets a flow picked randomly among the flows with the fewest respondents in progress or finished.

`--folder` moves the study to a folder (see Folders below), or to the top level with `--folder /`. Unlike the other settings, moving the study is also allowed after data collection has started.

## Previewing a study

After building or changing a study, if you want to verify it, you can preview its flows in a browser. The preview shows the stimuli like a respondent would see them, but skips the sensor setup steps and saves no data.

`aimotions preview-link "Study name"`

This prints a preview link for each flow; add `--flow "Flow name"` for just one. The links also work for studies that have started or stopped data collection, so they are safe to open at any time.

The links only work in a browser that is authenticated to iMotions with an account that has access to the study, so how to open them depends on the browser:

- **The user's own browser** (e.g. through a browser extension): the user is normally already logged in to iMotions there, so just open the link. If it shows that the study is unavailable, ask the user to log in to iMotions in that browser first.
- **An automated browser such as playwright-cli**: it has no login session, so hand it the token from the config file (`~/.aimotions` by default) by setting `window.iMotionsPreviewAuth` to the file's parsed JSON contents **before any page script runs**. Keep the file contents off the shell command line — they contain a live credential. With playwright-cli, write a temporary script file with the JSON inlined (delete it when done):

  ```js
  async page => {
      await page.addInitScript(auth => { window.iMotionsPreviewAuth = auth; }, /* JSON contents of ~/.aimotions */);
      await page.goto("<preview link>");
  }
  ```

  Then run `playwright-cli open about:blank` followed by `playwright-cli run-code --filename=<script file>`. After that, the page can be inspected and screenshotted normally, and the same page can navigate to other preview links without injecting again.
- **No browser available**: if you are not allowed to use the user's browser and playwright-cli is not installed, suggest installing it with `npm install -g @playwright/cli@latest` and its skill with `playwright-cli install --skills`. Alternatively, give the links to the user to open themselves.

The preview shows each stimulus for its full exposure time before advancing, just like respondents will experience it, so sitting a flow out takes roughly the sum of its exposure times. Timed stimuli show a banner with a **Skip** button in the preview, so verify each stimulus when it appears and then skip ahead instead of waiting — especially for videos and websites, which can run for minutes. Surveys have no timer; advance them by answering the questions and pressing their own Complete button, which also verifies that they work.

## Folders

The account has a folder tree for organizing studies and media library files, shown by list-studies and list-media. Folders can be created at the top level or inside another folder:

`aimotions create-folder "Folder name"`

`aimotions create-folder "Folder name" --parent "Parent folder"`

When several folders share a name, refer to them by the path shown by list-media, e.g. `--parent "Campaign A/Assets"`. Creating folders does not require the study editing permissions, but placing a study in one does.
