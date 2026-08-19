# AI-Driven Emotion Recognition 101: All About Emotion Detection and Affectiva's Emotion Metrics

AI-powered emotion recognition technology enables machines to interpret human emotions through facial expressions, gestures, and body language. Affectiva's sophisticated AI measures emotional engagement and valence, mapping facial expressions to emotions with high accuracy.

## Affectiva Emotion Metrics: The Complete List

The Affectiva SDK provides **nine emotion metrics and 20 facial expression metrics** for measuring emotions and facial expressions using computer vision and machine learning.

### Emotions

The system detects nine distinct emotions through facial analysis.

### How Does Affectiva Calculate Emotional Engagement?

**Engagement** (also called Expressiveness) measures facial muscle activation indicating emotional engagement, with values from 0 to 100. It's a weighted sum of:

- Inner and outer brow raise
- Brow furrow
- Cheek raise
- Nose wrinkle
- Lip corner depressor
- Chin raise
- Lip press
- Mouth open
- Lip suck
- Smile

### How Does Affectiva Calculate Emotional Valence?

**Valence** measures positive or negative experience (range: -100 to 100).

**Increases Positive Likelihood:**

- Smile
- Cheek raise

**Increases Negative Likelihood:**

- Inner brow raise
- Brow furrow
- Nose wrinkle
- Lip corner depressor
- Chin raise
- Lip press

### How Does Affectiva Map Facial Expressions To Emotions?

The system builds on EMFACS mappings by Friesen & Ekman. Sentimentality and Confusion metrics are unique to Affectiva, derived from custom analysis of video content reactions.

| Emotion | Increase Likelihood | Decrease Likelihood |
| --- | --- | --- |
| Joy | Cheek Raise; Smile | / |
| Anger | Brow Furrow; Eye Widen; Lid Tighten; Upper Lip Raise; Chin Raise; Lip Press; Mouth Open | Inner Brow Raise; Outer Brow Raise; Nose Wrinkle; Smile |
| Disgust | Nose Wrinkle; Upper Lip Raise; Chin Raise; Mouth Open | Inner Brow Raise; Smile |
| Surprise | Inner Brow Raise; Outer Brow Raise; Eye Widen; Jaw Drop | / |
| Fear | Inner Brow Raise; Outer Brow Raise; Brow Furrow; Eye Widen; Lip Stretcher; Mouth Open | Nose Wrinkle; Smile |
| Sadness | Inner Brow Raise; Brow Furrow; Cheek Raise; Lip Corner Depressor; Chin Raise | Outer Brow Raise; Nose Wrinkle; Smile |
| Contempt | Brow Furrow; Smirk | Outer Brow Raise; Smile |
| Sentimentality | Inner Brow Raise; Brow Furrow; Cheek Raise; Lip Corner Depressor; Chin Raise; Lip Press; Lip Suck; Smile | Outer Brow Raise; Mouth Open |
| Confusion | Inner Brow Raise; Brow Furrow; Lid Tighten; Nose Wrinkle; Dimpler; Lip Corner Depressor; Lip Pucker; Jaw Drop | Smile |

## Using Affectiva's Emotional Metrics

Emotion and expression metric scores range from 0 (no expression) to 100 (fully present), indicating confidence levels. Valence scores from 0-100 indicate neutral to positive experiences; -100 to 0 indicate negative to neutral experiences.

### Determining Accuracy

Expression metrics are trained on hundreds of thousands of facial frames sampled from 6+ million videos across 90+ countries, representing real-world spontaneous expressions under challenging conditions (varying lighting, head movements, ethnicity, age, gender variations, facial hair, glasses).

### How Does Affectiva Measure Accuracy?

Affectiva uses Receiver Operating Characteristic (ROC) curve analysis (values 0-1; closer to 1 = more accurate).

**High accuracy expressions** (ROC >0.9): smile, brow furrow, mouth open, eye closure, brow raise

**Moderate accuracy expressions** (ROC >0.8): lip corner depressor, eye widen, inner brow raise

### Face Tracking and Head Angle Estimation

The SDK includes latest face tracking with:

- **Facial Landmarks Estimation:** Cartesian coordinates for four facial landmarks
- **Head Orientation Estimation:** 3D head position in Euler angles (pitch, yaw, roll)
- **Interocular Distance:** Distance between two outer eye corners
