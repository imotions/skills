# iMotions WebET 3.0 — Webcam Based Eye Tracking Whitepaper (v3)

**March 2023 · iMotions Product Specialist Team**
*iMotions web camera based eye tracking algorithm — whitepaper (v3), iMotions webET v3.0*

---

## About the algorithm

In general, the pipeline consists of three algorithms: **processing**, **calibration**, and **mapping**, which utilize deep learning networks to estimate the gaze from the recording. All steps happen on webcam videos collected during stimulus presentation and hence, eye tracking data is **not extracted in real-time**.

### Processing

This step extracts the respondent's gaze position expressed in the camera coordinate system, relying on deep learning models to estimate the gaze position from the webcam video. The models used in this processing step are pre-trained on thousands of faces using accelerated deep learning algorithms.

### Calibration

It is mandatory to include calibration slides in the experiment because the calibration step is based on the recordings when the respondent was gazing at specific calibration markers. To calibrate the algorithm, sample pairs of gaze position retrieved in the Processing step and expected gaze location are matched. The mapping model used is a non-linear **RBF-based regression model**.

### Mapping

The model that was determined in the previous Calibration step is then used to map the gaze position on the screen in raw (x,y) coordinates on each stimulus frame, based on the gaze data identified in the Processing step. The result of this step is a gaze point for each frame of the webcam recording.

---

## Setup recommendations

To obtain the best possible performance of the webET, the following is recommended:

- Use large stimuli with a decent amount of whitespace around the objects of interest, for example, side-by-side comparisons of products, planograms, or coarse layout designs.
- Leave ca. **10 cm of whitespace** between the objects of interest. When placing Areas of Interest to quantify eye tracking data, we also recommend a **min. diameter of 10 cm**.
- Include a calibration block both at the **beginning and at the end** of your test. We recommend using **13 calibration points**.
- Make sure that the videos you get from your respondents are of good quality because this will improve the calculation of eye tracking data. Factors such as (partial) occlusion of the face, shadows on the face, or a respondent moving in front of the screen will impact the accuracy of your data.
- As with any eye tracking research, data quality can be impacted by respondents wearing glasses. Respondents can wear their vision aid during the data collection, but we recommend verifying that the glasses' frames do not occlude the eyes for the web camera. We also recommend checking the videos on a case-by-case basis and excluding respondents for whom light from the computer screen caused strong reflections on the glasses.
- The algorithm can cope with a certain variety of recording conditions, but you should instruct respondents to sit still and not talk during the test, to place a reading lamp close to the computer screen illuminating their faces evenly, and if you are testing in a lab, use the highest resolution that your web camera offers.
- To compensate for data loss, respondent exclusions, and the higher noise of webET, we recommend recruiting **significantly more respondents** than for classic lab studies.

### Classification recommendations

For consistency and comparability, the results presented below use the **I-VT filter** to classify fixations and saccades for the data derived from a screen-based eye tracker and the iMotions WebET algorithm. However, owing to the higher level of individual-level noise in webET-based studies, it is recommended to process webET data with iMotions' **Hidden Markov Models based fixation classification filter**. More details on this can be found in the iMotions help center article.

---

## Test report: Methodology

A validation study was run with **n=10** (7 female, mean age 33 years, range 23–46).

Stimuli were presented on a 22" computer screen in a dimly lit room. Respondents were sitting in front of a neutral gray wall and at a distance of **65 cm** to the web camera, and a reading lamp illuminated the respondents' faces from the front. Web camera data was collected with a **Logitech Brio** camera sampling at **30 Hz** with a resolution of **1920×1080 px**. Simultaneously, screen-based eye tracking data was collected with a top-of-the-line screen-based eye tracker without a chinrest. Respondents were instructed to sit perfectly still and not to talk.

Four extra conditions were tested — participants wearing glasses, a low web camera resolution, suboptimal face illumination, or having the respondent move and talk.

- **Glasses vs. no glasses ("Glasses")**: For respondents typically wearing glasses (n=5, 3 f., mean age 35) one block of the experiment was conducted with the respondent wearing their glasses. For all other conditions, they were recorded without their vision aid.

For a subset of **n=4** (2 f., mean age 36) one block of the experiment was repeated once for all extra conditions (sidelight, low web camera resolution, moving).

- **Low web camera resolution vs. high resolution ("Lowres")**: The webcam was set to **640×480 px** in the low-res condition.
- **Bad lighting vs. ideal face illumination ("Sidelight")**: To simulate bad lighting, a reading lamp was placed from the side in the sidelight condition.
- **Moving and talking respondents vs. sitting still ("Moving")**: In the moving condition, participants were encouraged to talk and move their upper body and head.

Every block of the study was preceded by a **9-point calibration** of the screen-based eye tracker either on white, gray, or black background. All reported respondents had excellent calibration data as classified by iMotions' internal calibration evaluation.

The experiment started with the subsequent presentation of 12 points and ended with the presentation of the same 12 points with the background color matching the color used in the calibration of the screen-based eye tracker. Both sets of points were used to calibrate the webET after the data collection was completed.

All respondents were exposed to all three calibrations (white, gray, or black background), and hence, the experiment was repeated three times per respondent. Glasses, Lowres, Sidelight, and Moving conditions (for a subset of respondents) were only collected after black calibration and the other calibration variations were not repeated for these conditions.

For the actual experiment, four sets of targets were used (and presented in all conditions and after all calibration variations): Each set of targets included **9 subsequently and randomly presented points** shown at locations placed in between the location of the webET calibration points, and the set of points was either presented on a white, gray, or black background or overlaid with a flickering video. Every trial lasted **4 seconds**. Each set of targets was preceded by one stimulus showing all 9 points at once for 12 seconds.

---

## Test report: Analysis

Two types of analyses were run:

### 1. Accuracy comparisons across conditions

- Data from the first second of each trial was discarded.
- For screen-based eye tracker data, fixations further than 5 dva away from the target were discarded (for webET, this threshold was disabled).
- For every trial and every respondent, the mean Euclidean distance of all fixations as classified by an I-VT filter (velocity threshold 30 deg/s) was computed.
- Descriptive statistics (mean, median, lower and upper quartiles) of accuracy offsets were computed for ideal conditions (n=10) and four extra conditions (n=4 and n=5).
- The accuracy of the webET in the extra conditions was compared to webET data from the equivalent blocks recorded under ideal conditions, and on the same respondents, using **Wilcoxon signed-ranks tests**.

### 2. Intraclass correlations between the two systems, across conditions

- All raw gaze data samples from the original screen-based eye tracker and webET were matched (through downsampling of screen-based eye tracker data).
- Intraclass correlation coefficients with 95% confidence intervals were calculated for the horizontal and vertical gaze data (of the right eye) separately.
- Scatterplots were created to investigate consistency between screen-based eye tracker as well as webET data, and reveal any potential systematicity of data offsets.

---

## Test report: Results of accuracy comparisons

### Summary

| Condition | n | webET mean offset | Trials > 5 dva | webET lost trials | Screen-based ET mean offset |
|---|---|---|---|---|---|
| Ideal | 10 | 2.2 dva | 12% | 1% | 0.5 dva (0% lost) |
| Moving | 4 | 5.0 dva | 38% | 0% | 0.7 dva (3% lost) |
| Sidelight | 4 | 4.9 dva | 4% | 5% | 0.6 dva (1% lost) |
| Lowres | 4 | 3.1 dva | 19% | — | 0.6 dva |
| Glasses | 5 | 3.6 dva | 41% | — | 0.9 dva |

| Condition (webET) | Median | Q1 | Q3 | vs. matched ideal blocks (median / Q1 / Q3) | Wilcoxon |
|---|---|---|---|---|---|
| Moving | 3.9 dva | 2.2 | 6.2 | 1.8 / 1.1 / 3.1 | p ≪ 0.01 |
| Sidelight | 4.2 dva | 2.5 | 6.6 | 1.8 / 1.1 / 3.1 | p ≪ 0.01 |
| Lowres | 2.4 dva | 1.3 | 4.2 | 1.8 / 1.1 / 3.1 | p = 0.01 |
| Glasses | 3.9 dva | 1.9 | 6.6 | 2.3 / 1.5 / 4.6 | p < 0.01 |

### Ideal conditions

Under most ideal conditions, without any manipulations (n=10), the webET had an average accuracy offset of **2.2 dva** and 1% of trials were lost due to data dropout (for screen-based eye tracker data, average accuracy was 0.5 dva with no lost trials). In this condition, webET data from 12% of all trials had average offsets larger than 5 dva.

### Moving

Data recorded from respondents who were talking and moving their head (n=4) was worse than data recorded while the same respondents were sitting perfectly still. Data from the screen-based eye tracker confirmed that respondents correctly maintained their gaze on the targets (and average accuracy was 0.7 dva with 3% lost trials). The webET algorithm succeeded to calculate gaze data for 100% of the trials with moving respondents with an average offset of **5.0 dva**. 38% of the trials had an offset larger than 5 dva.

A paired Wilcoxon signed-ranks test comparing webET data from trials with moving respondents (median 3.9 dva, Q1 2.2 dva, Q3 6.2 dva) to the equivalent blocks in which the same respondents sat still (median 1.8 dva, Q1 1.1 dva, Q3 3.1 dva) revealed highly significant differences (p ≪ 0.01) between the two conditions.

### Sidelight

Strong sidelight (n=4) also caused data offsets with average accuracy of **4.9 dva** for webET and 5% lost trials (for the screen-based eye tracker, average accuracy was 0.6 dva with 1% lost trials) and 4% of trials had average offsets of more than 5 dva for webET data.

A paired Wilcoxon signed-ranks test comparing webET data from trials with bad face illumination (median 4.2 dva, Q1 2.5 dva, Q3 6.6 dva) to the equivalent blocks in which the same respondents were recorded under ideal conditions (median 1.8 dva, Q1 1.1 dva, Q3 3.1 dva) revealed highly significant differences (p ≪ 0.01) between the two conditions.

### Lowres

Lower camera resolutions (n=4) also caused some, but in comparison to the other conditions the smallest, increase in data offsets with an average accuracy of **3.1 dva** (for the screen-based eye tracker, average accuracy was 0.6 dva) and 19% of trials showing an average offset of webET data above 5 dva.

A paired Wilcoxon signed-ranks test comparing webET data from trials with low webcam resolution (median 2.4 dva, Q1 1.3 dva, Q3 4.2 dva) to the equivalent blocks in which the same respondents with high resolution (median 1.8 dva, Q1 1.1 dva, Q3 3.1 dva) revealed significant differences (p = 0.01) between the two conditions.

### Glasses

For the 5 respondents who were re-recorded wearing glasses, an offset of **3.6 dva** was observed for webET (for the screen-based eye tracker, average accuracy was 0.9 dva) and 41% of the trials had an average offset of webET data higher than 5 dva.

A paired Wilcoxon signed-ranks test comparing webET data from trials in which respondents wore their vision aid (median 3.9 dva, Q1 1.9 dva, Q3 6.6 dva) to the equivalent blocks in which the same respondents were recorded without vision aid (median 2.3 dva, Q1 1.5 dva, Q3 4.6 dva) revealed significant differences (p < 0.01) between the two conditions.

### Changes in light conditions

As is the case for standard screen based eye trackers, it is recommended that webET is calibrated under the same conditions as the experimental part will be conducted in. A white (very bright) screen during calibration followed by a very dark stimulus (or vice versa) leads to slightly larger offsets than observed if the calibration screen and target have the same luminance:

- 3.0 dva — bright calibration followed by dark stimulus
- 2.8 dva — dark calibration followed by dark stimulus
- 2.3 dva — luminance kept constant

Flickering stimuli (n=10), mimicking what one would expect from video stimuli, did not negatively impact the accuracy either as opposed to images with constant luminance (average accuracy across all trials with flickering stimuli was 2.66 dva, and average accuracy across all trials with stimuli with constant luminance was 2.63 dva).

---

## Test report: Results of intraclass correlations

| Condition | n | ICC horizontal | 95% CI horizontal | ICC vertical | 95% CI vertical | Consistency |
|---|---|---|---|---|---|---|
| Ideal | 10 | 0.86 | 0.86–0.87 | 0.83 | 0.82–0.83 | Good |
| Moving | 4 | 0.74 | 0.71–0.77 | 0.72 | 0.71–0.73 | Good |
| Sidelight | 4 | 0.93 | 0.75–0.87 * | 0.81 | 0.80–0.81 | Good |
| Lowres | 4 | 0.87 | 0.87–0.88 | 0.82 | 0.79–0.85 | Good |
| Glasses | 5 | 0.70 | 0.65–0.73 | 0.57 | 0.35–0.69 | Medium |

\* As printed in the source document — the reported point estimate for horizontal gaze in the Sidelight condition (0.93) falls outside its stated confidence interval.

### Ideal conditions

Under most ideal conditions (n=10), screen-based eye tracker and webET data showed good consistency (ICC for horizontal gaze 0.86, for vertical gaze 0.83; 95% CI for horizontal gaze 0.86 < ICC < 0.87, for vertical gaze 0.82 < ICC < 0.83).

### Moving

In the condition with moving and talking respondents (n=4), screen-based eye tracker and webET data showed good consistency (ICC for horizontal gaze 0.74, for vertical gaze 0.72; 95% CI for horizontal gaze 0.71 < ICC < 0.77, for vertical gaze 0.71 < ICC < 0.73).

### Sidelight

For recordings with sidelight (n=4), screen-based eye tracker and webET data showed good consistency (ICC for horizontal gaze 0.93, for vertical gaze 0.81; 95% CI for horizontal gaze 0.75 < ICC < 0.87, for vertical gaze 0.80 < ICC < 0.81).

### Lowres

When recorded with a low resolution camera (n=4), screen-based eye tracker and webET data showed good consistency (ICC for horizontal gaze 0.87, for vertical gaze 0.82; 95% CI for horizontal gaze 0.87 < ICC < 0.88, for vertical gaze 0.79 < ICC < 0.85).

### Glasses

When recorded while wearing glasses (n=5), screen-based eye tracker and webET data showed medium consistency (ICC for horizontal gaze 0.70, for vertical gaze 0.57; 95% CI for horizontal gaze 0.65 < ICC < 0.73, for vertical gaze 0.35 < ICC < 0.69).

Scatterplots show that webET data (plotted on the y axis) has a larger variance than screen-based eye tracker data (plotted on the x axis). In the source document, exemplary plots are presented for data recorded from the control condition as well as from respondents wearing glasses, showing data from the right eye's horizontal and vertical gaze.

> *Note: the scatterplot figures on page 9 of the source PDF are images and are not reproduced in this Markdown conversion.*
