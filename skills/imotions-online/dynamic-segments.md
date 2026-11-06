# Creating and editing dynamic segments

A dynamic segment has inclusion criteria instead of a fixed list of respondents. The respondents who already meet all the criteria are added to it when it is created, and later respondents are added automatically when their data has been processed and they meet the criteria.
Dynamic segments can only be created in studies where study-overview shows the study type Online or Media Analytics. In other studies, create a static segment instead.
In Media Analytics studies, while the data collection is running, respondents meeting the criteria are only added once it is stopped and their data has been processed.
In Media Analytics studies, the criteria can no longer be changed once the segment has respondents, so check them before creating it.

## Create dynamic segment

Run create-segment with the name of the study and the name of the segment, followed by one or more criteria options and no respondent labels.

`aimotions create-segment "Study name" "Segment name" --flow "Flow name" --devices "desktop,tablet"`

- `--flow "Flow name"`: the flow the respondents saw. Only when the study has several flows.
- `--languages "en-US,da-DK"`: the languages the study was shown in. Only when the study offers several languages.
- `--devices "desktop,tablet,phone"`: the devices the respondents used. Only when the study allows several kinds of devices.
- `--url-variables "group=A,panel=x"`: the values of URL variables, which are query parameters in the data collection URL the respondents used, such as a group assigned by a panel provider. The respondent-details command shows a respondent's URL variables.
- `--et-accuracy-below-degrees 3`: eye tracking accuracy better than this many visual degrees. 3 is recommended.
- `--min-et-quality-percent 90`: eye tracking quality of at least this percentage. 90 is recommended.
- `--min-face-quality-percent 80`: face quality of at least this percentage. 80 is recommended.
- `--survey-criteria '<json>'`: conditions on the survey answers, described below.
- `--target 100`: the target number of respondents, which is how many respondents to collect for the segment. It does not change which respondents are added, but the progress towards it is shown in the Quota tab.

Two dynamic segments cannot have the same criteria.

## Survey criteria

The survey criteria are JSON. A condition compares the answer to one question:

`{"survey": "Survey name", "question": "age", "operator": "GREATER_OR_EQUAL", "value": 18}`

- `survey` is the name of the survey stimulus. It can be left out when the study has a single survey.
- `question` is the name of the question, as used in the survey JSON.
- `value` is what the answer is compared to. For choice questions it is a list of choice values, and the condition matches when the answer is any of them, e.g. `{"question": "gender", "value": ["female", "other"]}`.
- `operator` depends on the question. Choice questions (radiogroup, dropdown, checkbox, imagepicker, matrix and matrixdropdown) only have one operator, so it can be left out.
  - Numbers (rating, nouislider and number inputs): `EQUALS`, `GREATER_OR_EQUAL`, `LESS_OR_EQUAL`.
  - Text (comment and text inputs): `EQUALS`, `CONTAINS`, `STARTS_WITH`, `ENDS_WITH`.
  - Dates and times (date, datetime-local, month, week and time inputs): `EQUALS`, `NOT_EQUALS`, `BEFORE`, `ON_OR_BEFORE`, `ON_OR_AFTER`, `AFTER`, with values written like 2026-03-05, 2026-03-05T14:30, 2026-03, 2026-W12 and 14:30.
  - `IS_EMPTY` and `IS_NOT_EMPTY` work for all of these and take no value.
- Some questions also need the part of the answer to compare: `row` for matrix, `row` and `column` for matrixdropdown, `item` for multipletext, and `choice` for ranking, where the value is the position the choice was ranked at, starting from 1.

Combine several conditions with `{"and": [...]}` or `{"or": [...]}`, which can also be nested:

`{"and": [{"question": "age", "operator": "GREATER_OR_EQUAL", "value": 18}, {"or": [{"question": "country", "value": ["DK"]}, {"question": "language", "value": ["da"]}]}]}`

All the other criteria options must also be met, together with the survey criteria.

## Edit dynamic segment criteria

Respondents are automatically added to dynamic segments, so their respondents cannot be added or removed manually. Instead, change their criteria with edit-segment and the same options as create-segment.
Each criteria option replaces only that part of the criteria, and an empty value removes it. The other criteria stay as they are, and at least one must remain. An empty `--target` removes the target.

`aimotions edit-segment "Study name" "Segment name" --devices "phone" --flow ""`

When the criteria change, the respondents are updated to match them. In a Media Analytics study, this happens when the data collection is stopped, if it is running.
Once a dynamic segment in a Media Analytics study has respondents, only its name and target can be changed, as respondents cannot be removed from it.
