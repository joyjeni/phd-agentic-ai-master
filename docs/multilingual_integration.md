# Multilingual Integration Module

**PhD Research — Agricultural AI Assistant**
**Version**: 1.0 | **Date**: June 2026 | **Status**: Design Document

---

## Overview

This document specifies the technical design for adding multilingual support (Hindi, Kannada, Tamil, Malayalam, Marathi) to all four PhD objectives. The system targets ~600 million Indian farmers who are native speakers of Indic languages, making multilingual access a first-class requirement rather than an afterthought.

---

## 1. Language Codes and Scripts

| Language   | ISO  | Script      | Primary State(s)             | Farmers (million) |
|------------|------|-------------|------------------------------|-------------------|
| English    | en   | Latin       | All                          | —                 |
| Kannada    | kn   | Kannada     | Karnataka                    | 35                |
| Tamil      | ta   | Tamil       | Tamil Nadu                   | 37                |
| Malayalam  | ml   | Malayalam   | Kerala                       | 17                |
| Hindi      | hi   | Devanagari  | UP, MP, Bihar, Rajasthan     | 200+              |
| Marathi    | mr   | Devanagari  | Maharashtra                  | 58                |

Total addressable farmer population across these five Indic languages: **~347 million**.

---

## 2. Translation Pipeline

### 2.1 Model: IndicTrans2 (AI4Bharat, 2023)

IndicTrans2 is the state-of-the-art open-source translation model for 22 Indian languages, released by AI4Bharat under the MIT license.

| Direction         | HuggingFace Model ID                               | Purpose                          |
|-------------------|----------------------------------------------------|----------------------------------|
| Indic → English   | `ai4bharat/indictrans2-indic-en-1B`                | Translate user query to English  |
| English → Indic   | `ai4bharat/indictrans2-en-indic-1B`                | Translate response back to user  |

**Latency**: ~80 ms per query on NVIDIA T4 GPU (single-sentence queries typical of voice/chat).

### 2.2 Supplementary Models

| Purpose                       | Model ID                        | Notes                                        |
|-------------------------------|---------------------------------|----------------------------------------------|
| Dense embeddings              | `google/embeddinggemma-300m`    | Language-agnostic; operates on English text  |
| Indic-specific embeddings     | `ai4bharat/indic-bert`          | 12-language BERT for entity NER in Indic text|

### 2.3 Installation

```bash
pip install transformers>=4.38 sentencepiece sacremoses
# IndicTrans2 requires IndicNLP Library
pip install indic-nlp-library
```

---

## 3. Multilingual Query Flow

The pipeline follows a **translate-in / translate-out** architecture. All internal processing occurs in English; translation is applied only at the boundary.

```
User (any language)
        │
        ▼
┌───────────────────┐
│  Language Detect  │  langdetect OR fastText lid.176.bin
└───────────────────┘
        │
   Non-English?
        │ Yes                      No
        ▼                          │
┌───────────────────┐              │
│  IndicTrans2      │              │
│  Indic → English  │              │
└───────────────────┘              │
        │                          │
        └──────────┬───────────────┘
                   ▼
        ┌────────────────────┐
        │  Obj1: SessionRe-  │  API scoring, co-activation cache
        │  rank+ (en)        │
        └────────────────────┘
                   │
                   ▼
        ┌────────────────────┐
        │  Obj2: APRR        │  Multi-agent routing (en)
        └────────────────────┘
                   │
                   ▼
        ┌────────────────────┐
        │  Obj3: MNCD        │  Mesh agents (en)
        └────────────────────┘
                   │
                   ▼
        ┌────────────────────┐
        │  Obj4: FCNP        │  Context pruning (embeddings)
        └────────────────────┘
                   │
                   ▼
        ┌────────────────────┐
        │  IndicTrans2       │  English → user language
        │  English → Indic   │
        └────────────────────┘
                   │
                   ▼
        Response + source attribution (user language)
```

### Step-by-Step Description

1. **Language Detection**: Use `langdetect` (Python, fast) or `fastText lid.176.bin` (more accurate for Indic scripts). Map detected language to ISO code (`kn`, `ta`, `ml`, `hi`, `mr`, `en`).

2. **Indic → English Translation** (if non-English): Load `ai4bharat/indictrans2-indic-en-1B`. Pass user query as input with appropriate language tag. Output: English query string.

3. **English Pipeline Processing**: Route through the Obj1→Obj2→Obj3→Obj4 chain as normal. All intermediate processing, scoring, routing, and pruning occur in English only.

4. **English → Indic Translation**: Load `ai4bharat/indictrans2-en-indic-1B`. Pass English response with target language tag corresponding to the originally detected language.

5. **Return Response**: Deliver the Indic-language response along with source attribution (API name, data.gov.in resource ID, mandi name) so the farmer can verify the data origin.

### Language Detection Code (Reference)

```python
from langdetect import detect

SUPPORTED_LANGS = {"kn", "ta", "ml", "hi", "mr", "en"}

def detect_language(text: str) -> str:
    try:
        lang = detect(text)
        return lang if lang in SUPPORTED_LANGS else "en"
    except Exception:
        return "en"  # fallback
```

### IndicTrans2 Translation Code (Reference)

```python
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

def load_indictrans2(direction: str):
    """direction: 'indic-en' or 'en-indic'"""
    model_id = f"ai4bharat/indictrans2-{direction}-1B"
    tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_id, trust_remote_code=True)
    return tokenizer, model

def translate(text: str, src_lang: str, tgt_lang: str,
              tokenizer, model) -> str:
    inputs = tokenizer(
        text,
        src_lang=src_lang,
        return_tensors="pt",
        padding=True
    )
    outputs = model.generate(
        **inputs,
        forced_bos_token_id=tokenizer.lang_code_to_id[tgt_lang],
        max_new_tokens=256
    )
    return tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]
```

---

## 4. Per-Objective Changes

### Objective 1 — SessionRerank+ (session-aware-toolbench-rerank)

**Current state**: `FarmerProfile` already has a `language` field. `name_kn` label exists.

**Changes required**:
- Add language to **profile mask scoring**: penalise API calls that return labels not in the farmer's language.
- Add language-specific API display labels:

```python
class APILabel(BaseModel):
    name_en: str
    name_kn: Optional[str] = None   # exists
    name_ta: Optional[str] = None   # ADD
    name_ml: Optional[str] = None   # ADD
    name_hi: Optional[str] = None   # ADD
    name_mr: Optional[str] = None   # ADD
```

- Scoring mask: `lang_match = 1.0 if label.get(f"name_{user_lang}") else 0.8` (small preference for labelled APIs).

### Objective 2 — APRR (aprr-multi-agent-routing)

**Current state**: Routing is language-agnostic.

**Changes required**:
- Add `user_language: str` field to **episode metadata** for every logging event:

```python
episode = {
    "episode_id": ...,
    "query_en": ...,
    "user_language": detected_lang,   # ADD
    "agent_path": [...],
    ...
}
```

- No change to routing logic — W-matrix updates, CROW deliberation, and OctoRoute tokens all operate on English queries.

### Objective 3 — MNCD (mncd-mesh-agents)

**Current state**: Context bus carries structured messages between agents.

**Changes required**:
- **Broadcast `user_language`** on the context bus as a metadata field in every message envelope:

```python
message_envelope = {
    "topic": "market_query",
    "payload": {...},
    "meta": {
        "user_language": detected_lang,   # ADD
        "session_id": ...,
    }
}
```

- Agents do not translate internally; they read `meta.user_language` and pass it through. The translation layer at the system boundary uses this to select the correct IndicTrans2 target language.
- Distress signals are language-agnostic (numeric confidence scores).

### Objective 4 — FCNP (fcnp-context-pruning)

**Current state**: Operates on dense embeddings (`google/embeddinggemma-300m`). Entirely language-agnostic.

**Changes required**: **None.** The Kirchhoff/physarum flow operates on embedding similarity matrices, which are computed from English text (post-translation). No modification needed.

---

## 5. data.gov.in Multilingual API Field Catalogue

The data.gov.in Kisan API returns structured records with English field keys. The table below maps each field to its Indic-language display label for frontend rendering.

| Field (API key)  | Tamil                | Kannada             | Malayalam            | Hindi          | Marathi          |
|------------------|----------------------|---------------------|----------------------|----------------|------------------|
| `state`          | நிலை                 | ರಾಜ್ಯ               | സംസ്ഥാനം             | राज्य           | राज्य             |
| `district`       | மாவட்டம்             | ಜಿಲ್ಲೆ               | ജില്ല                 | जिला            | जिल्हा            |
| `market`         | சந்தை                | ಮಾರುಕಟ್ಟೆ           | മാർക്കറ്റ്            | बाजार           | बाजार             |
| `commodity`      | பொருள்               | ಸರಕು                | ചരക്ക്               | वस्तु           | माल               |
| `modal_price`    | மாதிரி விலை          | ಮಾದರಿ ಬೆಲೆ          | മോഡൽ വില             | मोडल मूल्य      | मॉडेल भाव         |

### Usage in UI

When rendering API results to a non-English user, substitute field keys with the localised labels from this table. Example JSON-to-display mapping function:

```python
FIELD_LABELS = {
    "ta": {"state": "நிலை", "district": "மாவட்டம்", "market": "சந்தை",
            "commodity": "பொருள்", "modal_price": "மாதிரி விலை"},
    "kn": {"state": "ರಾಜ್ಯ", "district": "ಜಿಲ್ಲೆ", "market": "ಮಾರುಕಟ್ಟೆ",
            "commodity": "ಸರಕು", "modal_price": "ಮಾದರಿ ಬೆಲೆ"},
    "ml": {"state": "സംസ്ഥാനം", "district": "ജില്ല", "market": "മാർക്കറ്റ്",
            "commodity": "ചരക്ക്", "modal_price": "മോഡൽ വില"},
    "hi": {"state": "राज्य", "district": "जिला", "market": "बाजार",
            "commodity": "वस्तु", "modal_price": "मोडल मूल्य"},
    "mr": {"state": "राज्य", "district": "जिल्हा", "market": "बाजार",
            "commodity": "माल", "modal_price": "मॉडेल भाव"},
}

def localise_record(record: dict, lang: str) -> dict:
    labels = FIELD_LABELS.get(lang, {})
    return {labels.get(k, k): v for k, v in record.items()}
```

---

## 6. Demo Queries in Each Language

The following queries all mean: *"What is today's tomato price?"* — a canonical test case for the system.

| Language   | ISO  | Demo Query                                | English Translation             |
|------------|------|-------------------------------------------|---------------------------------|
| Tamil      | ta   | இன்று தக்காளி விலை என்ன?                   | What is today's tomato price?   |
| Kannada    | kn   | ಇಂದು ಟೊಮೇಟೊ ಬೆಲೆ ಎಷ್ಟು?                   | What is today's tomato price?   |
| Malayalam  | ml   | ഇന്ന് തക്കാളിയുടെ വില എന്തൊക്കെ?           | What is today's tomato price?   |
| Hindi      | hi   | आज टमाटर का भाव क्या है?                   | What is today's tomato price?   |
| Marathi    | mr   | आज टोमॅटोचा भाव काय आहे?                   | What is today's tomato price?   |

### Expected Round-Trip Flow (Tamil Example)

```
Input  : "இன்று தக்காளி விலை என்ன?"
Detect : ta (Tamil)
→ EN   : "What is today's tomato price?"
Obj1   : Scores data.gov.in commodity APIs (NDCG@5 → top API: 9ef84268...)
Obj2   : Routes to price_lookup agent via APRR
Obj3   : Mesh query → Tamil Nadu APMC data
Obj4   : Prunes 50-record response → top 5 markets
→ ta   : "இன்று தக்காளி விலை: சென்னை ₹45/kg, கோயம்பத்தூர் ₹42/kg..."
Output : Tamil response with market attribution
```

---

## 7. HuggingFace Models Summary

| Model                             | HF ID                                  | Usage in System                          |
|-----------------------------------|----------------------------------------|------------------------------------------|
| IndicTrans2 (Indic→EN)            | `ai4bharat/indictrans2-indic-en-1B`    | Translate user query to English          |
| IndicTrans2 (EN→Indic)            | `ai4bharat/indictrans2-en-indic-1B`    | Translate response to user language      |
| Gemma Embedding                   | `google/embeddinggemma-300m`           | Dense embeddings for Obj1, Obj4          |
| IndicBERT                         | `ai4bharat/indic-bert`                 | Language-specific NER, entity extraction |

---

## 8. Implementation Roadmap

| Phase | Tasks                                                                     | Target     |
|-------|---------------------------------------------------------------------------|------------|
| P1    | Integrate langdetect; add user_language to all logs                       | Month 1    |
| P2    | Deploy IndicTrans2 indic-en; test Tamil + Kannada round-trips             | Month 2    |
| P3    | Deploy IndicTrans2 en-indic; full 5-language output                       | Month 2    |
| P4    | Add Indic field labels to data.gov.in display layer                       | Month 3    |
| P5    | Add name_ta/name_ml/name_hi/name_mr to Obj1 API label schema             | Month 3    |
| P6    | Broadcast user_language on Obj3 context bus                               | Month 3    |
| P7    | Evaluate on multilingual farmer query benchmark (100 queries × 5 langs)  | Month 4    |

---

## References

- AI4Bharat. *IndicTrans2: Towards High-Quality and Accessible Machine Translation of All 22 Scheduled Indian Languages*. 2023. https://huggingface.co/ai4bharat
- Joulin et al. *Bag of Tricks for Efficient Text Classification* (fastText). 2016.
- data.gov.in Kisan API: https://data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi
