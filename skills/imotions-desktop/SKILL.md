---
name: "imotions-desktop"
description: "Access and analyze iMotions Desktop Lab studies on the local machine, including studies, stimuli, respondents, sensor data, annotations and segmentations, and import AOIs or custom time series data. Use for reading or modifying the local iMotions Lab study library, inspecting study files and analysis outputs, or answering iMotions Lab how-to questions through the Help Center."
---

# iMotions Lab

Use the local iMotions Lab study library through `AtCli.exe`. There is no login step. All commands are offline except `search-help` and `help-article`, which also require access to the iMotions cloud.

Call AtCli.exe the ‘iMotions Lab skill’ in user-facing prose. Preserve the executable name only in commands, paths, and technical diagnostics.

## Run the tool

Default path:

```
C:\Program Files\iMotions\Lab_XG\AtCli.exe
```

Quote the path because it contains spaces. In PowerShell, invoke it with `&`.

Do not read the study SQLite database directly. Use the tool.

If documented behavior does not match the installed command set, run `AtCli.exe` with no arguments and follow its built-in help; it is authoritative for that installation.

### Preconditions and command conventions

- iMotions Lab must be running. If calls to `localhost:8086` are refused, ask the user to start iMotions Lab (`AttentionTool.exe`) and retry.
- Use `IMOTIONS_R_SERVER` only when Lab is intentionally serving from another host or port.
- Use **kebab-case** command names such as `list-studies`, `get-study`, and `get-respondent-details`.
- Pass parameters positionally; there are no flags. Quote values containing spaces.
- Treat YAML output containing `statusCode` as a failure, not a result.

## Read commands

- `list-studies` — resolve a study name to its UUID. Every other command takes UUIDs.
- `get-study <study id>` — study overview: respondents, stimuli, segments, sensors,
  `studyDataFolder`, `studyScreenResolution`, `studyType`.
  - Segment IDs map to `seg<NNNN>` analysis folders.
- `get-stimuli-details <study id>` — stimulus type, media URL, exposure time, display order.
- `get-respondent-details <study id> [respondent id]` — demographics, variables, exposure,
  survey answers, face-recording path. Omit the respondent ID for all tested respondents.
- `get-respondent-annotations <study id> [respondent id]` — existing timeline markings.
  Fragment times are milliseconds on the slideshow timeline. Omit the respondent ID for all
  tested respondents.
- `get-respondent-samples <study id> <respondent id>` — stream/channel metadata and CSV
  paths, not raw values.
  - Does **not** enumerate analysis outputs or imported streams. Before reporting a signal
    or metric as unavailable, inspect `studyDataFolder`.

Read [references/study-data-layout.md](./references/study-data-layout.md) when locating

study files or derived data.

## Help Center questions

For questions about how to use iMotions Lab, or product behavior not covered here:

1. Read the installed iMotions Lab version.
2. Run `search-help "search phrase"`.
3. Open the relevant result with `help-article <article id>`.
4. Verify that the article applies to the installed version before answering.
5. Include the article URL in the answer.

Read [references/help-center.md](./references/help-center.md) before relying on Help Center content.

## Write commands

Only run write commands when the user has explicitly asked to modify the study library. AtCli has no delete or update command, so anything created here must be removed manually in the iMotions Lab UI. Confirm success from the returned YAML object and its new `id`.

### Create a segmentation

```
AtCli.exe create-segmentation <study id> "Segment name" "Comment" <respondent id>,<respondent id>
```

All listed respondents must exist and be tested. Pass respondent IDs as one comma-separated value with no spaces.

### Create a respondent annotation

```
AtCli.exe create-respondent-annotation <study id> <respondent id> "Annotation name" <range start> <range end> ["Description"]
```

Use slideshow-timeline milliseconds. Reusing a track name adds the fragment to that track. Fragments on the same track may not overlap; an overlap returns `statusCode: 400` and writes nothing. Different tracks may overlap. Each command creates one fragment.

AtCli creates **respondent annotations only**. Stimulus annotations must be created in the Lab UI or imported from CSV. Stimulus-annotation CSV times are relative to **stimulus start**, not the slideshow timeline; convert between the two when necessary. Use the Help Center article **Annotations** for the full CSV format.

## Import custom time series

Custom time series are not imported through AtCli. iMotions reads them from an `Ex_Data` folder inside `studyDataFolder` and matches respondents and stimuli by exact folder and file names. Use names returned by `get-study` verbatim; mismatches may be skipped silently.

Read [references/importing-data.md](./references/importing-data.md) before writing imported time series.

## Import AOIs from CSV

AtCli has no AOI import command. AOIs are imported from a UTF-16 LE CSV through the iMotions Lab UI.

Read [references/importing-aois.md](./references/importing-aois.md) before creating AOI import files; locale-sensitive decimal coordinates, static-AOI duplication, and missing final deactivation keyframes can produce files that import without error but are wrong.

## Typical workflow

1. `list-studies` -> resolve the study UUID.
2. `get-study <study>` -> get respondents, stimuli, sensors, segments, resolution, and data folder.
3. `get-stimuli-details <study>` -> determine what was shown, in what order, and for how long.
4. `get-respondent-details <study>` -> retrieve respondent variables, survey answers, exposures, and recordings.
5. `get-respondent-samples <study> <respondent>` -> locate live sensor-stream CSVs and channel metadata.
6. Inspect `studyDataFolder` when analysis outputs, imported streams, AOIs, reports, or other derived files may matter.
7. Optionally read `get-respondent-annotations <study>` for existing timeline markings.

For per-respondent analysis, loop over respondent IDs from `get-study`. There is no aggregated or segment-level read command; compute cross-respondent comparisons from the underlying files. Push a resulting grouping back with `create-segmentation`, or respondent-level events with `create-respondent-annotation`, only when requested.

## References

For study-file locations and derived outputs, read [references/study-data-layout.md](./references/study-data-layout.md).

For Help Center/version rules, read [references/help-center.md](./references/help-center.md).

For external data import, read [references/importing-data.md](./references/importing-data.md).

For AOI import, read [references/importing-aois.md](./references/importing-aois.md).

References to sensor and research-method articles are available in [articles.md](./articles.md).
