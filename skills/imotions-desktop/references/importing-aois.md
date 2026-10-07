# Importing AOIs from CSV

AOI CSV imports can succeed without reporting errors even when geometry, scope, encoding, or timing is wrong. Validate the file before importing.

Use respondent labels, stimulus names, and `studyScreenResolution` exactly as returned by `get-study`. Names are case sensitive.

AtCli has no AOI import command. Import the finished CSV through iMotions Lab.

## File format

Save the file as **UTF-16 LE with a BOM**. The first two bytes must be `FF FE`; UTF-8 will not import.

Use exactly these 12 columns, in this order:

```csv
Respondent Name,Stimulus Name,AOI Name,Color,Group,Timestamp (ms),Is active,Points,Translation,Scale,Rotation,Interpolate
```

### Geometry fields

* `Points`: polygon as `X1;Y1;;X2;Y2;;X3;Y3`. Use at least three coordinate pairs and repeat the first pair at the end to close the shape.
* `Translation`: `X;Y`
* `Scale`: `Width;Height`
* `Rotation`: degrees
* `Color`: optional hex value such as `#FFCC00`
* `Group`: optional label for grouping/filtering AOIs

Avoid commas inside names. A comma requires CSV quoting, and the importer's handling of quoted fields is undocumented.

Write `Points`, `Translation`, `Scale`, and `Rotation` using **whole numbers only**. These fields are parsed using the machine locale, so decimal points can silently produce incorrect geometry on comma-decimal systems.

`Timestamp (ms)` can parse decimals, but use integer timestamps when possible.

## Coordinates

The coordinate origin is the **top-left**:

* X increases to the right.
* Y increases downward.

Coordinates use the **study resolution**, not necessarily the source media resolution.

Take `studyScreenResolution` from `get-study` and scale source coordinates:

```text
x_study = x_source * study_width  / source_width
y_study = y_source * study_height / source_height
```

Derive source dimensions from the media itself.

If the source coordinate system uses a bottom-left origin, convert Y first:

```text
y = source_height - y
```

Then scale into study coordinates.

## Static AOIs

A static AOI uses **one row** and applies to every respondent.

Rules:

* `Respondent Name` must contain a real respondent label, but does not limit the AOI to that respondent.
* Do **not** create one copy per respondent; that creates duplicate overlapping AOIs.
* Set `Timestamp (ms)` to `0`.
* Leave `Is active` blank.
* Leave `Interpolate` blank.

## Dynamic AOIs

A dynamic AOI belongs to **one respondent**. To apply it to several respondents, repeat the complete AOI block using each respondent's label.

### Initial row

The first row contains:

* `Respondent Name`
* `Stimulus Name`
* `AOI Name`
* `Color`
* `Group`
* geometry and timing fields

### Continuation keyframes

Continuation rows leave the first five identity columns blank. They attach to the AOI defined by the preceding initial row.

Every dynamic row must contain:

* `Timestamp (ms)`
* `Is active`: `1` or `0`
* geometry
* `Interpolate`: `1` or `0`

Timestamps must increase within an AOI.

`Interpolate = 1` moves the geometry smoothly toward the next keyframe.

`Interpolate = 0` holds the geometry until the next keyframe.

### Final deactivation

The final keyframe must set:

```text
Is active = 0
```

If the final keyframe remains active, the AOI persists until the end of the stimulus.

Place the deactivation keyframe one sample after the final real position and repeat the same geometry. Otherwise, the AOI ends one keyframe too early.

Example:

```csv
Respondent Name,Stimulus Name,AOI Name,Color,Group,Timestamp (ms),Is active,Points,Translation,Scale,Rotation,Interpolate
R1,Soda game,cola bottle,#FF3B30,dynamic objects,1000,1,100;100;;200;100;;200;200;;100;200;;100;100,0;0,1;1,0,1
,,,,,2000,1,600;600;;800;600;;800;800;;600;800;;600;600,0;0,1;1,0,1
,,,,,2125,0,600;600;;800;600;;800;800;;600;800;;600;600,0;0,1;1,0,0
```

Only emit a keyframe when the geometry departs from what interpolation would produce between surrounding keyframes. Do not create one keyframe per sampled frame unless it is necessary.

## Workflow

1. Run `get-study <study_uuid>`.
2. Take `studyScreenResolution`, respondent `label`s, and stimulus `name`s directly from its output.
3. Decide whether each AOI is static or dynamic before writing rows.
4. Convert coordinates into study resolution.
5. Round geometry values to whole numbers.
6. Write rows using the exact 12-column order.
7. Leave the first five identity columns blank only on continuation keyframes.
8. Save as UTF-16 LE with BOM.
9. Validate the file before importing it through iMotions Lab.

## Validation checklist

Before importing, verify all of the following:

* The first two bytes are `FF FE`.
* The file decodes as UTF-16 LE.
* The header matches the required 12 columns exactly.
* Every row contains 12 fields.
* Respondent labels exactly match `get-study`.
* Stimulus names exactly match `get-study`.
* Every `Points` value contains at least three coordinate pairs.
* `Points` uses `;` between X/Y and `;;` between coordinate pairs.
* No mapped coordinate falls outside the study resolution.
* `Points`, `Translation`, `Scale`, and `Rotation` contain no decimal points.
* No continuation row appears before its initial row.
* Dynamic AOI timestamps increase.
* Every dynamic AOI ends with `Is active = 0`.
