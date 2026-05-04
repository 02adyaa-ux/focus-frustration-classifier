# Focus & Frustration Classifier NLP

A self-contained advanced browser NLP project that classifies text as focused, frustrated, cognitively loaded, mixed, or neutral.

This repository also includes a separate Python regression project:

- `study_productivity_predictor.py`
- `study_productivity_predictor_pure.py`
- `STUDY_PRODUCTIVITY_README.md`

## Run

Open `index.html` in a browser. No build step or dependencies are required.

## How It Works

The classifier uses a transparent weighted signal ensemble:

- Focus signals: planning, clarity, progress, execution language, debugging intent.
- Frustration signals: blocked, confused, annoyed, broken, rumination, exhaustion.
- Urgency signals: deadline, immediacy, clock pressure, deployment pressure.
- Agency signals: intent, action modality, next-step language.
- Uncertainty signals: hedging, doubt, unclear modality, self-questioning.
- Context modifiers: intensifiers, dampeners, negation, punctuation pressure, lexical density, sentence complexity.
- Output: label, confidence, focus/frustration/clarity/cognitive-load scores, tone, intent, urgency, complexity, modality, highlighted evidence, sentence diagnostics, feature vector, and dynamic model trace JSON.

## Advanced Project Features

- Live calibration sliders for focus and frustration sensitivity.
- Sentence-level diagnostics with focus/frustration micro-bars.
- Feature vector panel showing intermediate NLP features.
- Dynamic model trace showing raw scores, calibration, normalized scores, and prediction.
- Explainable highlighting for every detected signal family.

This is a practical prototype, not a trained production model. For production use, collect labeled examples and replace or augment the lexicon with a fine-tuned classifier.
