const sampleText = document.querySelector("#sampleText");
const classifyButton = document.querySelector("#classifyButton");
const clearButton = document.querySelector("#clearButton");
const exampleSelect = document.querySelector("#exampleSelect");
const focusSensitivity = document.querySelector("#focusSensitivity");
const frustrationSensitivity = document.querySelector("#frustrationSensitivity");

const verdict = document.querySelector("#verdict");
const confidenceLabel = document.querySelector("#confidenceLabel");
const focusScore = document.querySelector("#focusScore");
const frustrationScore = document.querySelector("#frustrationScore");
const clarityScore = document.querySelector("#clarityScore");
const loadScore = document.querySelector("#loadScore");
const focusBar = document.querySelector("#focusBar");
const frustrationBar = document.querySelector("#frustrationBar");
const clarityBar = document.querySelector("#clarityBar");
const loadBar = document.querySelector("#loadBar");
const toneValue = document.querySelector("#toneValue");
const intentValue = document.querySelector("#intentValue");
const urgencyValue = document.querySelector("#urgencyValue");
const complexityValue = document.querySelector("#complexityValue");
const modalityValue = document.querySelector("#modalityValue");
const sentenceValue = document.querySelector("#sentenceValue");
const signalList = document.querySelector("#signalList");
const highlightedText = document.querySelector("#highlightedText");
const featureGrid = document.querySelector("#featureGrid");
const sentenceDiagnostics = document.querySelector("#sentenceDiagnostics");
const modelTrace = document.querySelector("#modelTrace");

const examples = {
  "deep-work":
    "I have a clear plan for the next 90 minutes: finish the draft, review the examples, and ship the update before standup. I know exactly what to do next.",
  blocked:
    "I keep hitting the same confusing bug and nothing I try makes sense. The docs are vague, the error is useless, and I am getting really annoyed.",
  mixed:
    "I know the next step is to isolate the failing test, but I am blocked by inconsistent results. I can probably solve it, though this is starting to feel exhausting.",
  deadline:
    "The deadline is today and I still need to fix the broken import path, write the tests, and deploy before the review. I can do it, but the clock is making every failed run feel worse.",
  rumination:
    "I keep replaying the same mistake and I cannot tell whether I am missing something obvious. Maybe this should be simple, but I feel scattered and stuck.",
  neutral:
    "The meeting moved to Thursday. Please add the notes to the shared folder and send the agenda when it is ready.",
};

const signalFamilies = {
  focus: {
    label: "Focus",
    color: "focus",
    terms: {
      "clear": 1.1,
      "plan": 1.2,
      "priority": 1.1,
      "next step": 1.7,
      "finish": 1.2,
      "ship": 1.3,
      "solve": 1.35,
      "progress": 1.25,
      "flow": 1.1,
      "ready": 0.9,
      "focused": 1.5,
      "understand": 1.1,
      "decide": 1.1,
      "execute": 1.25,
      "review": 0.8,
      "draft": 0.75,
      "complete": 1.15,
      "specific": 1.05,
      "exactly": 1.05,
      "momentum": 1.25,
      "isolate": 1.4,
      "debug": 1.0,
      "test": 0.85,
      "verify": 1.1,
      "organize": 1.0,
      "schedule": 0.85,
    },
  },
  frustration: {
    label: "Frustration",
    color: "frustration",
    terms: {
      "blocked": 1.6,
      "stuck": 1.5,
      "confusing": 1.25,
      "annoyed": 1.5,
      "angry": 1.7,
      "irritated": 1.55,
      "frustrated": 1.75,
      "useless": 1.35,
      "vague": 1.1,
      "broken": 1.35,
      "exhausting": 1.5,
      "overwhelmed": 1.8,
      "nothing works": 2.1,
      "same bug": 1.75,
      "failing": 1.35,
      "fail": 1.2,
      "hate": 1.8,
      "unclear": 1.25,
      "impossible": 1.65,
      "waste": 1.35,
      "scattered": 1.25,
      "replaying": 1.05,
      "missing something": 1.35,
      "worse": 1.0,
    },
  },
  urgency: {
    label: "Urgency",
    color: "urgency",
    terms: {
      "now": 1.0,
      "urgent": 1.7,
      "asap": 1.7,
      "deadline": 1.4,
      "before": 0.7,
      "today": 1.1,
      "immediately": 1.8,
      "clock": 1.2,
      "deploy": 0.9,
    },
  },
  agency: {
    label: "Agency",
    color: "agency",
    terms: {
      "need": 0.75,
      "want": 0.65,
      "should": 0.55,
      "must": 0.9,
      "will": 0.9,
      "can": 0.95,
      "try": 0.6,
      "going to": 1.0,
      "next": 0.7,
      "probably": 0.45,
    },
  },
  uncertainty: {
    label: "Uncertainty",
    color: "uncertainty",
    terms: {
      "maybe": 1.0,
      "probably": 0.8,
      "might": 0.85,
      "could": 0.65,
      "whether": 0.9,
      "not sure": 1.35,
      "cannot tell": 1.55,
      "guess": 1.0,
      "seems": 0.55,
    },
  },
};

const intensifiers = new Set(["really", "very", "so", "extremely", "totally", "completely", "still"]);
const dampeners = new Set(["slightly", "kind", "kindof", "somewhat", "maybe"]);
const negators = new Set(["not", "never", "no", "cannot", "can't", "wont", "won't", "dont", "don't"]);
const stopWords = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "to",
  "of",
  "in",
  "it",
  "is",
  "am",
  "are",
  "i",
  "we",
  "you",
  "this",
  "that",
  "for",
  "with",
  "on",
]);

function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s']/g, " ").replace(/\s+/g, " ").trim();
}

function tokenize(text) {
  return normalize(text).split(" ").filter(Boolean);
}

function splitSentences(text) {
  return text.match(/[^.!?]+[.!?]*/g)?.map((sentence) => sentence.trim()).filter(Boolean) || [];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function scanFamily(text, familyKey) {
  const family = signalFamilies[familyKey];
  const tokens = tokenize(text);
  const normalized = normalize(text);
  const matches = [];
  let score = 0;

  Object.entries(family.terms).forEach(([term, baseWeight]) => {
    if (term.includes(" ")) {
      const re = new RegExp(`\\b${escapeRegExp(term)}\\b`, "gi");
      const found = normalized.match(re) || [];
      found.forEach(() => {
        const weight = baseWeight * 1.25;
        matches.push({ term, weight, type: familyKey, label: family.label });
        score += weight;
      });
      return;
    }

    tokens.forEach((token, index) => {
      if (token !== term) return;
      const context = [tokens[index - 2], tokens[index - 1]].filter(Boolean);
      let weight = baseWeight;
      if (context.some((word) => intensifiers.has(word))) weight *= 1.35;
      if (context.some((word) => dampeners.has(word))) weight *= 0.8;
      if (context.some((word) => negators.has(word))) weight *= -0.75;
      matches.push({ term, weight, type: familyKey, label: family.label });
      score += weight;
    });
  });

  return { score, matches };
}

function extractStats(text) {
  const sentences = splitSentences(text);
  const tokens = tokenize(text);
  const uniqueTerms = new Set(tokens.filter((word) => !stopWords.has(word)));
  const punctuation = {
    questions: (text.match(/\?/g) || []).length,
    exclamations: (text.match(/!/g) || []).length,
    commas: (text.match(/,/g) || []).length,
  };
  const avgSentenceLength = sentences.length ? tokens.length / sentences.length : tokens.length;
  const lexicalDensity = tokens.length ? uniqueTerms.size / tokens.length : 0;
  const longWords = tokens.filter((word) => word.length >= 8).length;

  return {
    sentenceCount: sentences.length,
    wordCount: tokens.length,
    avgSentenceLength,
    lexicalDensity,
    longWordRatio: tokens.length ? longWords / tokens.length : 0,
    punctuation,
  };
}

function analyzeSentences(text) {
  return splitSentences(text).map((sentence, index) => {
    const focus = scanFamily(sentence, "focus").score + scanFamily(sentence, "agency").score * 0.65;
    const frustration = scanFamily(sentence, "frustration").score + scanFamily(sentence, "uncertainty").score * 0.4;
    const urgency = scanFamily(sentence, "urgency").score;
    const net = focus - frustration;
    let label = "Neutral";
    if (focus > 1.1 && frustration > 1.1) label = "Mixed";
    else if (net > 0.8) label = "Focus";
    else if (net < -0.8) label = "Frustration";
    if (urgency > 1.2 && label !== "Frustration") label = `${label} + urgency`;
    return { index: index + 1, sentence, focus, frustration, urgency, label };
  });
}

function classify(text) {
  const stats = extractStats(text);
  if (!text.trim() || stats.wordCount === 0) return emptyResult();

  const familyScores = Object.fromEntries(
    Object.keys(signalFamilies).map((key) => [key, scanFamily(text, key)]),
  );

  const punctuationPressure =
    stats.punctuation.exclamations * 0.9 + stats.punctuation.questions * 0.35 + stats.punctuation.commas * 0.08;
  const complexity =
    stats.avgSentenceLength * 0.08 + stats.lexicalDensity * 3.4 + stats.longWordRatio * 3.2;
  const loadRaw =
    familyScores.frustration.score * 1.3 +
    familyScores.uncertainty.score * 1.2 +
    punctuationPressure +
    complexity * 0.65;

  const focusRaw =
    familyScores.focus.score * 1.55 +
    familyScores.agency.score * 0.85 +
    stats.lexicalDensity * 1.2 -
    familyScores.uncertainty.score * 0.22;
  const frustrationRaw =
    familyScores.frustration.score * 1.55 +
    familyScores.urgency.score * 0.65 +
    familyScores.uncertainty.score * 0.75 +
    punctuationPressure;
  const clarityRaw =
    familyScores.focus.score * 1.1 +
    familyScores.agency.score * 0.6 -
    familyScores.uncertainty.score * 0.7 -
    stats.punctuation.questions * 0.28 -
    Math.max(0, stats.avgSentenceLength - 22) * 0.06;

  const lengthConfidence = clamp(stats.wordCount / 55, 0.32, 1);
  const focusMultiplier = Number(focusSensitivity.value) / 100;
  const frustrationMultiplier = Number(frustrationSensitivity.value) / 100;

  const focusPercent = toPercent(focusRaw * focusMultiplier, lengthConfidence, 5.8);
  const frustrationPercent = toPercent(frustrationRaw * frustrationMultiplier, lengthConfidence, 5.8);
  const clarityPercent = toPercent(clarityRaw, lengthConfidence, 4.2);
  const loadPercent = toPercent(loadRaw, lengthConfidence, 5.4);

  let label = "Neutral";
  if (focusPercent >= 42 && frustrationPercent >= 42) label = "Focused Under Strain";
  else if (focusPercent - frustrationPercent >= 14) label = "Focused";
  else if (frustrationPercent - focusPercent >= 14) label = "Frustrated";
  else if (loadPercent >= 45) label = "Cognitively Loaded";

  const separation = Math.abs(focusPercent - frustrationPercent);
  const evidenceMass = Object.values(familyScores).reduce((sum, family) => sum + Math.max(0, family.score), 0);
  const certainty = clamp(Math.round((separation * 0.45 + Math.max(focusPercent, frustrationPercent) * 0.55) * lengthConfidence + evidenceMass * 2), 0, 100);

  const matches = Object.values(familyScores).flatMap((family) => family.matches);
  const diagnostics = analyzeSentences(text);
  const features = {
    words: stats.wordCount,
    sentences: stats.sentenceCount,
    lexicalDensity: Number(stats.lexicalDensity.toFixed(2)),
    avgSentenceLength: Number(stats.avgSentenceLength.toFixed(1)),
    punctuationPressure: Number(punctuationPressure.toFixed(2)),
    focusEvidence: Number(familyScores.focus.score.toFixed(2)),
    frustrationEvidence: Number(familyScores.frustration.score.toFixed(2)),
    urgencyEvidence: Number(familyScores.urgency.score.toFixed(2)),
    agencyEvidence: Number(familyScores.agency.score.toFixed(2)),
    uncertaintyEvidence: Number(familyScores.uncertainty.score.toFixed(2)),
  };

  return {
    label,
    certainty,
    focus: focusPercent,
    frustration: frustrationPercent,
    clarity: clarityPercent,
    load: loadPercent,
    tone: describeTone(focusPercent, frustrationPercent, loadPercent),
    intent: familyScores.agency.score > 2 || familyScores.focus.score > 2.5 ? "Action oriented" : "Descriptive",
    urgency: familyScores.urgency.score > 1.4 || stats.punctuation.exclamations > 1 ? "Elevated" : "Normal",
    complexity: describeComplexity(complexity),
    modality: describeModality(familyScores),
    matches,
    features,
    diagnostics,
    trace: {
      model: "weighted_signal_ensemble_v2",
      calibration: {
        focusSensitivity: focusMultiplier,
        frustrationSensitivity: frustrationMultiplier,
      },
      rawScores: {
        focus: Number(focusRaw.toFixed(3)),
        frustration: Number(frustrationRaw.toFixed(3)),
        clarity: Number(clarityRaw.toFixed(3)),
        cognitiveLoad: Number(loadRaw.toFixed(3)),
      },
      normalized: {
        focus: focusPercent,
        frustration: frustrationPercent,
        clarity: clarityPercent,
        cognitiveLoad: loadPercent,
      },
      prediction: label,
    },
  };
}

function emptyResult() {
  const features = {
    words: 0,
    sentences: 0,
    lexicalDensity: 0,
    avgSentenceLength: 0,
    punctuationPressure: 0,
    focusEvidence: 0,
    frustrationEvidence: 0,
    urgencyEvidence: 0,
    agencyEvidence: 0,
    uncertaintyEvidence: 0,
  };

  return {
    label: "Awaiting text",
    certainty: 0,
    focus: 0,
    frustration: 0,
    clarity: 0,
    load: 0,
    tone: "Unknown",
    intent: "Unknown",
    urgency: "Unknown",
    complexity: "Unknown",
    modality: "Unknown",
    matches: [],
    features,
    diagnostics: [],
    trace: {
      model: "weighted_signal_ensemble_v2",
      calibration: {
        focusSensitivity: Number(focusSensitivity.value) / 100,
        frustrationSensitivity: Number(frustrationSensitivity.value) / 100,
      },
      rawScores: {
        focus: 0,
        frustration: 0,
        clarity: 0,
        cognitiveLoad: 0,
      },
      normalized: {
        focus: 0,
        frustration: 0,
        clarity: 0,
        cognitiveLoad: 0,
      },
      prediction: "Awaiting text",
    },
  };
}

function toPercent(raw, confidence, scale) {
  return clamp(Math.round(sigmoid(raw / scale - 0.45) * 100 * confidence), 0, 100);
}

function describeTone(focus, frustration, load) {
  if (focus >= 42 && frustration >= 42) return "Determined strain";
  if (load >= 55 && frustration >= 35) return "High pressure";
  if (focus > frustration) return "Composed";
  if (frustration > focus) return "Strained";
  return "Even";
}

function describeComplexity(score) {
  if (score >= 5.2) return "High";
  if (score >= 3.5) return "Moderate";
  return "Low";
}

function describeModality(familyScores) {
  if (familyScores.uncertainty.score >= 2) return "Uncertain";
  if (familyScores.agency.score >= 2) return "Agentic";
  return "Declarative";
}

function render(result, text) {
  verdict.querySelector(".verdict-label").textContent = result.label;
  verdict.querySelector(".verdict-score").textContent = `${result.certainty}%`;
  confidenceLabel.textContent = `${confidenceWord(result.certainty)} confidence`;

  setMeter(focusScore, focusBar, result.focus);
  setMeter(frustrationScore, frustrationBar, result.frustration);
  setMeter(clarityScore, clarityBar, result.clarity);
  setMeter(loadScore, loadBar, result.load);

  toneValue.textContent = result.tone;
  intentValue.textContent = result.intent;
  urgencyValue.textContent = result.urgency;
  complexityValue.textContent = result.complexity;
  modalityValue.textContent = result.modality;
  sentenceValue.textContent = result.features.sentences;

  renderSignals(result.matches);
  highlightedText.innerHTML = highlight(text, result.matches.filter((match) => match.weight > 0));
  renderFeatures(result.features);
  renderDiagnostics(result.diagnostics);
  modelTrace.textContent = JSON.stringify(result.trace, null, 2);
}

function setMeter(label, bar, value) {
  label.textContent = value;
  bar.style.width = `${value}%`;
}

function renderSignals(matches) {
  signalList.innerHTML = "";
  const usefulMatches = matches
    .filter((match) => match.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  if (!usefulMatches.length) {
    signalList.innerHTML = '<span class="chip">No strong lexical signals</span>';
    return;
  }

  usefulMatches.slice(0, 24).forEach((match) => {
    const chip = document.createElement("span");
    chip.className = `chip ${match.type}`;
    chip.textContent = `${match.label}: ${match.term} +${match.weight.toFixed(2)}`;
    signalList.appendChild(chip);
  });
}

function renderFeatures(features) {
  featureGrid.innerHTML = "";
  Object.entries(features).forEach(([key, value]) => {
    const item = document.createElement("div");
    item.className = "feature-item";
    item.innerHTML = `<span>${humanize(key)}</span><strong>${value}</strong>`;
    featureGrid.appendChild(item);
  });
}

function renderDiagnostics(diagnostics) {
  sentenceDiagnostics.innerHTML = "";
  if (!diagnostics.length) {
    sentenceDiagnostics.innerHTML = '<div class="sentence-row">No sentences detected.</div>';
    return;
  }

  diagnostics.forEach((item) => {
    const row = document.createElement("div");
    row.className = "sentence-row";
    row.innerHTML = `
      <div class="sentence-copy">
        <span>S${item.index} · ${item.label}</span>
        <p>${escapeHtml(item.sentence)}</p>
      </div>
      <div class="sentence-mini-bars" aria-label="Sentence scores">
        <span style="width:${clamp(item.focus * 18, 4, 100)}%"></span>
        <span style="width:${clamp(item.frustration * 18, 4, 100)}%"></span>
      </div>
    `;
    sentenceDiagnostics.appendChild(row);
  });
}

function highlight(text, matches) {
  if (!text.trim()) return "Your highlighted evidence will appear here.";
  let escaped = escapeHtml(text);
  const terms = [...new Map(matches.map((match) => [match.term, match])).values()]
    .sort((a, b) => b.term.length - a.term.length);

  terms.forEach((match) => {
    const re = new RegExp(`\\b(${escapeRegExp(escapeHtml(match.term))})\\b`, "gi");
    escaped = escaped.replace(re, `<mark class="${match.type}">$1</mark>`);
  });
  return escaped;
}

function confidenceWord(score) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function humanize(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function runClassification() {
  const result = classify(sampleText.value);
  render(result, sampleText.value);
}

classifyButton.addEventListener("click", runClassification);
sampleText.addEventListener("input", () => {
  window.clearTimeout(sampleText.autoTimer);
  sampleText.autoTimer = window.setTimeout(runClassification, 120);
});

[focusSensitivity, frustrationSensitivity].forEach((input) => {
  input.addEventListener("input", runClassification);
});

clearButton.addEventListener("click", () => {
  sampleText.value = "";
  exampleSelect.value = "";
  runClassification();
  sampleText.focus();
});

exampleSelect.addEventListener("change", () => {
  const next = examples[exampleSelect.value];
  if (!next) return;
  sampleText.value = next;
  runClassification();
});

sampleText.value = examples.deadline;
runClassification();
