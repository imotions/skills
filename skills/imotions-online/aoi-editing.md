# Creating, editing and deleting AOIs

An area of interest (AOI) marks an area on a stimulus, which creates eye tracking metrics based on when respondents look at it, such as time to first fixation and dwell time.

## Create AOI

Create an AOI on a stimulus, as either a rectangle or a polygon.
AOIs can only be created in studies with the eye tracking sensor enabled, since their metrics are based on individual eye tracking data.
All positions and sizes are in percent of the stimulus size with the origin in the top left corner.
To determine where the AOI should be, first fetch the stimulus image (the URL is in the stimulus details) and identify the region of interest, then calculate its position as percentages of the image width and height.

A rectangle is given as four numbers: left, top, width and height:

`aimotions create-aoi "Study name" "Stimulus name" "AOI name" --bounds "10 25 30 40"`

A polygon is given as comma-separated x,y corners in order along the outline of the shape:

`aimotions create-aoi "Study name" "Stimulus name" "AOI name" --points "10,25 40,25 45,60 10,65"`

On video stimuli, an AOI that moves, appears or disappears during the video is given as a timeline of semicolon-separated entries, where each entry is a time in milliseconds followed by a rectangle, a polygon or the word hidden:

`aimotions create-aoi "Study name" "Video name" "AOI name" --timeline "0: hidden; 5000: 10 25 30 40; 12500: 35 25 30 40; 22000: hidden"`

There is no interpolation between the entries: each shape stays in place until the time of the next entry, and the AOI does not exist before the first entry.
Do not try to track the object frame by frame. The number of entries is limited to an average of one per 200 ms of video.

Prefer rectangles, and only use a polygon when a rectangle would badly overlap a neighboring region, such as for diagonal or L-shaped content.

Size the AOIs for the accuracy of webcam eye tracking, which is described in the referenced WebET accuracy whitepaper: gaze positions are off by about 2 degrees of visual angle on average under ideal conditions, and 3-5 degrees under common realistic conditions such as glasses, suboptimal lighting or head movement. On a desktop screen, 2-5 degrees is roughly 5-12% of the screen width; on tablets and phones, which are smaller and held closer, the same error covers an even larger share of the screen. So:
- Make AOIs at least roughly 20% of the screen width (about 10 cm on a desktop screen), and larger when the study allows tablets or phones. Research shows that large AOIs are the noise-robust choice.
- Pad AOIs generously beyond the visible object instead of outlining it precisely, since the measured gaze positions scatter around the true target. Pad more when it is important to catch every look at the object, when there is empty space around it, and when comparing across many respondents.
- Detailed or pixel-accurate shapes do not improve the metrics, and polygons can have at most 12 points.
- Keep generous space between the objects that are compared (about 10 cm on a desktop screen), and avoid overlapping or directly adjacent AOIs, since gazes near a shared border cannot be attributed reliably.

To set the display color, add `--color "#ffa500"`.
It takes a few minutes for the metrics of a new AOI to be calculated.

## Edit AOI

Rename an AOI, change the area it covers or change its display color.
The new shape is given with `--bounds`, `--points` or `--timeline` in the same format as when creating an AOI, and replaces the existing shape entirely.
Editing an AOI that moves over time requires `--timeline`, since a single shape would discard its movement.

`aimotions edit-aoi "Study name" "Stimulus name" "AOI name" --name "New name" --bounds "10 25 30 40" --color "#ffa500"`

Only the specified options are changed. Changing the area causes the metrics to be recalculated, which takes a few minutes.
AOIs that are defined per respondent can only be changed in the web interface.

## Delete AOI

Delete an AOI and its metrics.

`aimotions delete-aoi "Study name" "Stimulus name" "AOI name"`
