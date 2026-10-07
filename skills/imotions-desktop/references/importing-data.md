# Import external time-series data

External data is not imported through AtCli. iMotions discovers it from
`Ex_Data` folders. Use names returned by `get-study` exactly; mismatches
may be skipped silently.

## Per-respondent data

<studyDataFolder>\Ex_Data\<respondent label>\<data name>\<stimulus name>.csv

1. Get `studyDataFolder`, respondent `label`s, and stimulus `name`s from
   `get-study`.
2. Create `Ex_Data` if needed.
3. Create one directory per exact respondent label.
4. Create a directory for the stream name.
5. Write one CSV per exact stimulus name.
6. Open the study in iMotions Lab for the data to appear.

## Aggregate data

Use this when there is one series per stimulus rather than per respondent.

<studyDataFolder>\Analysis\<analysis name>\Ex_Data\<data name>\<stimulus name>.csv

1. Create a new analysis and open its folder.
2. Create `Ex_Data\<data name>`.
3. Add one CSV per stimulus.
4. Re-run the analysis.
5. Verify ingestion under:
   `Signals\seg<NNNN>\<stimulus id>\`

### Verify aggregate storage

Before importing, confirm:
- `AnalysisAlgorithmSettings.json` contains an aggregation flow.
- `Signals\seg<NNNN>\` exists.

Without an aggregate store, the import silently does nothing.

### Clear stale output

If the analysis has already run, delete the affected stimulus's:

- `aggregation.csv`
- `aggregation.json`
- `aggregationsummary.json`

They are regenerated on the next run.

## CSV format

- Header row required.
- First column must be lowercase `timestamp`.
- Timestamps are milliseconds relative to stimulus start.
- Remaining columns become signal/channel names.
- Write plain CSV without BOM.

Example:

timestamp,bpm
133,20.45772022

## Important

Do not write `ET_RExtAPI-*` files directly into analysis output folders.
Only flows declared by the analysis are discovered there. Use `Ex_Data`
as the import path.