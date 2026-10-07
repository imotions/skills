# iMotions Lab study data layout

Use this reference when a task requires locating raw signals, imported streams, analysis output, AOI results, media, survey assets, or quality summaries inside `studyDataFolder`.

## Critical rule

`get-respondent-samples` lists live device streams only. It omits analysis outputs and imported streams. Do not report a signal, metric, or derived output as missing based only on AtCli output; inspect `studyDataFolder` first.

## Layout

```text
Signals/<respondent uuid>/
    Live device CSVs returned by get-respondent-samples,
    plus Native_SlideEvents / SurveyData / UserInputEvents.

Signals/<respondent uuid>/seg<NNNN>/
    R-notebook analysis output, one folder per segment id.
    ET_RMetricsAPI-*.csv  -> one value per stimulus.
    ET_RExtAPI-*.csv      -> continuous series.

Signals/<respondent uuid>/<stimulus id>/
    Per-stimulus gaze analysis, when one was run.

Ex_Data/<label>/<name>/<stimulus>.csv
    Imported time series. Treat this as a read location in existing studies,
    not only a write destination. It may contain channel names or preprocessing
    that the live stream does not.

Analysis/<sensor>/AnalysisAlgorithmSettings.json
    Parameters used by analysis notebooks, with per-stimulus report output nearby.

AoiData/<stimulus id>/
    aoiModel.json (UTF-16), metadata.csv, Geometry/,
    and Signals/<respondent uuid>/<aoi id>metrics.csv for AOI metrics.

Survey/<stimulus name>/
    Survey question assets, often plain images.

Stimuli/
    Media shown to respondents.

Capture/
    Face recordings named like r<respondent>__s<stimulus>.wmv.

ExposureSummary/<stimulus id>.csv
    Per-sensor sample rate and quality by respondent.
```

## Segment folders

The `segments` returned by `get-study` contain IDs. Each segment `id` corresponds to the `<NNNN>` in a `seg<NNNN>` analysis folder.

## Useful study metadata

`get-study` also returns:

- `studyDataFolder`: root for the files above.
- `studyScreenResolution`: the presentation resolution needed for AOI work.
- `studyType`: use this to distinguish desktop from online studies.
