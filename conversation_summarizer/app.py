"""FastAPI entry point for live classroom chat summarization."""
import os
import json
import base64
import re
from collections import Counter
from typing import Any

# Avoid TensorFlow/Keras conflicts when only PyTorch models are used.
os.environ.setdefault("USE_TF", "0")
os.environ.setdefault("TRANSFORMERS_NO_TF", "1")

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ValidationError, validator

from bart_summary import generate_bart_summary
from clustering import cluster_messages
from embeddings import generate_embeddings
from insights import generate_insights, topics_from_keywords
from keywords import extract_keywords
from preprocessing import preprocess_messages
from similarity import calculate_similarity
from textrank_summary import generate_summary
from grok_refinement import refine_with_grok


class SummarizeRequest(BaseModel):
    messages: list[str] = Field(default_factory=list)

    @validator("messages", pre=True)
    @classmethod
    def validate_messages(cls, value):
        if value is None:
            return []
        if not isinstance(value, list):
            raise ValueError("messages must be a JSON array of strings")
        return [str(message) for message in value if message is not None]


class SummarizeResponse(BaseModel):
    summary: str
    topics: list[str]
    insights: list[str]
    weakAreas: list[str] = Field(default_factory=list)


app = FastAPI(
    title="Edulink Chat Summarization Service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    print("[api] 422 validation error")
    print(f"[api] Content-Type: {request.headers.get('content-type')}")
    print(f"[api] Raw body: {body.decode('utf-8', errors='replace')}")
    print(f"[api] Validation errors: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={
            "summary": "Invalid summarization request payload.",
            "topics": [],
            "insights": ["Expected JSON body: {\"messages\": [\"message1\", \"message2\"]}"],
        },
    )


def detect_curriculum_topics(messages: list[str]) -> list[str]:
    """Map chat text to broad classroom topic labels for insight generation."""
    topic_keywords = {
        "JDBC": ["jdbc", "driver", "preparedstatement", "connection"],
        "DBMS": ["dbms", "normalization", "index", "query processor", "storage"],
        "Transaction": ["transaction", "acid", "commit", "rollback", "autocommit"],
        "Deadlock": ["deadlock", "lock", "waiting", "abort"],
        "SQL": ["sql", "join", "inner join", "left join", "table"],
    }

    detected = []
    for msg in messages:
        lower = msg.lower()
        for topic, keys in topic_keywords.items():
            if any(key in lower for key in keys):
                detected.append(topic)
    return detected


def _clean_input_messages(messages: list[str]) -> list[str]:
    cleaned = []
    for message in messages:
        if message and message.strip():
            cleaned.append(message.strip())
    return cleaned


def _normalize_for_dedupe(message: str) -> str:
    text = message.lower()
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _dedupe_messages(messages: list[str]) -> tuple[list[str], list[str]]:
    seen = set()
    unique = []
    repeated = []
    for message in messages:
        key = _normalize_for_dedupe(message)
        if not key:
            continue
        if key in seen:
            repeated.append(message)
            continue
        seen.add(key)
        unique.append(message)
    return unique, repeated


def _is_noise(message: str) -> bool:
    text = _normalize_for_dedupe(message)
    if not text:
        return True

    noise_phrases = {
        "hello",
        "hi",
        "hey",
        "ok",
        "okay",
        "fine",
        "keep quiet",
        "arey",
        "guys",
        "guess",
        "helpp",
        "help guess",
        "working fine",
    }
    if text in noise_phrases:
        return True
    if len(text.split()) <= 2 and not any(term in text for term in ("doubt", "explain", "what", "why", "how")):
        return True
    return False


def _split_signal_and_noise(messages: list[str]) -> tuple[list[str], list[str]]:
    signal = []
    noise = []
    for message in messages:
        if _is_noise(message):
            noise.append(message)
        else:
            signal.append(message)
    return signal, noise


def _extract_doubts(messages: list[str]) -> list[str]:
    doubt_terms = ("doubt", "question", "explain", "not understand", "confused", "how", "why", "what")
    doubts = []
    for message in messages:
        lower = message.lower()
        if any(term in lower for term in doubt_terms):
            doubts.append(message)
    return doubts


def _humanize_topic(topic: str) -> str:
    return re.sub(r"\s+", " ", topic).strip().title()


def _filter_topics(topics: list[str]) -> list[str]:
    blocked_terms = {
        "hello",
        "hi",
        "mam",
        "maam",
        "sir",
        "arey",
        "working",
        "fine",
        "quiet",
        "group",
        "asked",
        "doubt",
        "guys",
        "guess",
    }
    filtered = []
    for topic in topics:
        words = set(_normalize_for_dedupe(topic).split())
        if not words or words.issubset(blocked_terms):
            continue
        if words & blocked_terms and len(words) <= 2:
            continue
        if topic not in filtered:
            filtered.append(topic)
    return filtered


def _build_local_insights(
    topics: list[str],
    doubts: list[str],
    repeated_messages: list[str],
    noise_messages: list[str],
) -> tuple[list[str], list[str]]:
    readable_topics = [_humanize_topic(topic) for topic in topics[:5]]
    insights = []
    weak_areas = []

    if readable_topics:
        insights.append("The main academic discussion focused on " + ", ".join(readable_topics) + ".")

    if doubts:
        insights.append(f"Students raised {len(doubts)} doubt/question-style message(s), so the teacher should revisit those concepts.")
        for doubt in doubts[:3]:
            weak_areas.append(_summarize_weak_area(doubt))

    if repeated_messages:
        insights.append(f"{len(repeated_messages)} repeated message(s) were removed before summarization.")

    if noise_messages:
        insights.append(f"{len(noise_messages)} greeting/off-topic/noise message(s) were ignored for academic summarization.")

    if not insights:
        insights.append("The discussion was short, so only limited learning signals were available.")

    weak_areas = [area for area in dict.fromkeys(weak_areas) if area]
    if not weak_areas and readable_topics:
        weak_areas = readable_topics[:2]

    return insights, weak_areas


def _summarize_weak_area(message: str) -> str:
    text = message
    patterns = [
        r"\bhello\b",
        r"\bhi\b",
        r"\bmam\b",
        r"\bmaam\b",
        r"\bsir\b",
        r"\bguys\b",
        r"\bplease\b",
        r"\bplz\b",
        r"\bi\s+have\s+doubt\s+(regarding|about|on|to)?\b",
        r"\bi\s+want\s+to\s+know\s+more\s+(about|on)?\b",
        r"\bquestion\b",
        r"\bdoubt\b",
        r"\bregarding\b",
        r"\babout\b",
        r"\bhow\s+it\s+works?\b",
        r"\blike\b",
    ]
    for pattern in patterns:
        text = re.sub(pattern, " ", text, flags=re.I)
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    words = [
        word
        for word in re.sub(r"\s+", " ", text).strip().split()
        if word.lower() not in {"a", "an", "the", "to", "of", "also", "i", "more"}
    ]
    text = " ".join(words)
    if not text:
        return "Clarify the student doubt"
    return _humanize_topic(" ".join(text.split()[:6]))


def _fallback_summary(topics: list[str], doubts: list[str], initial_summary: str) -> str:
    readable_topics = [_humanize_topic(topic) for topic in topics[:4]]
    if readable_topics and doubts:
        return (
            f"The discussion mainly focused on {', '.join(readable_topics)}. "
            f"Students asked for clarification on {len(doubts)} concept-related doubt(s), "
            "so the next class should address those questions with examples."
        )
    if readable_topics:
        return f"The class discussion centered on {', '.join(readable_topics)}. {initial_summary}".strip()
    return initial_summary or "The chat did not contain enough academic content for a detailed summary."


def _split_insights(report: str) -> list[str]:
    if not report:
        return []

    lines = []
    for line in report.splitlines():
        line = line.strip()
        if not line or set(line) == {"="}:
            continue
        lines.append(line.replace("->", "-"))
    return lines[:8]


def run_summarization_pipeline(messages: list[str]) -> dict[str, Any]:
    raw_messages = _clean_input_messages(messages)
    if not raw_messages:
        return {
            "summary": "No messages available for summarization.",
            "topics": [],
            "insights": [],
            "weakAreas": [],
        }

    print(f"[api] Summarizing {len(raw_messages)} live chat messages")

    unique_messages, repeated_messages = _dedupe_messages(raw_messages)
    signal_messages, noise_messages = _split_signal_and_noise(unique_messages)
    academic_messages = signal_messages or unique_messages
    doubts = _extract_doubts(academic_messages)

    print(
        "[api] NLP filtering: "
        f"unique={len(unique_messages)}, signal={len(signal_messages)}, "
        f"noise={len(noise_messages)}, repeated={len(repeated_messages)}, doubts={len(doubts)}"
    )

    cleaned_messages = preprocess_messages(academic_messages)
    messages_for_nlp = cleaned_messages if cleaned_messages else academic_messages
    full_text = " ".join(academic_messages)

    # Keep the existing research pipeline dynamic: no file reads, no saved outputs.
    generate_embeddings(messages_for_nlp)
    calculate_similarity(messages_for_nlp)

    textrank_summary = generate_summary(
        academic_messages,
        top_n=min(4, max(1, len(academic_messages))),
    )

    keyword_results = extract_keywords(full_text, top_n=8)
    keyword_topics = _filter_topics([term for term, _ in keyword_results[:8]])
    curriculum_topics = detect_curriculum_topics(academic_messages)
    topics = _filter_topics(list(dict.fromkeys(keyword_topics + curriculum_topics)))[:8]

    num_clusters = min(3, len(messages_for_nlp))
    if num_clusters > 1:
        cluster_messages(messages_for_nlp, num_clusters=num_clusters)

    topic_labels = curriculum_topics.copy()
    topic_labels.extend(topics_from_keywords(keyword_results, threshold=0.2))
    insights_report = generate_insights(topic_labels)

    initial_summary = textrank_summary
    if len(academic_messages) >= 3 and len(full_text) >= 120:
        try:
            bart_summary = generate_bart_summary(full_text)
            if bart_summary:
                initial_summary = bart_summary
        except Exception as exc:
            print(f"[api] BART summary failed, using TextRank fallback: {exc}")

    local_insights, weak_areas = _build_local_insights(
        topics=topics,
        doubts=doubts,
        repeated_messages=repeated_messages,
        noise_messages=noise_messages,
    )

    local_result = {
        "summary": _fallback_summary(topics, doubts, initial_summary),
        "topics": topics,
        "insights": local_insights + [
            line for line in _split_insights(insights_report)
            if not line.lower().startswith(("academic insights", "most discussed", "weak /", "frequency analysis"))
        ][:3],
        "weakAreas": weak_areas,
    }

    grok_context = {
        "initialSummary": initial_summary,
        "detectedTopics": topics,
        "repeatedMessageCount": len(repeated_messages),
        "noiseMessageCount": len(noise_messages),
        "repeatedDoubts": doubts[:6],
        "weakAreas": weak_areas,
        "localInsights": local_insights,
    }
    refined = refine_with_grok(grok_context)
    if refined and refined.get("summary"):
        return {
            "summary": refined["summary"],
            "topics": refined.get("topics") or local_result["topics"],
            "insights": refined.get("insights") or local_result["insights"],
            "weakAreas": refined.get("weakAreas") or local_result["weakAreas"],
        }

    return local_result


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/summarize", response_model=SummarizeResponse)
async def summarize(http_request: Request) -> SummarizeResponse:
    try:
        raw_body = await http_request.body()
        print("[api] Incoming /summarize request")
        print(f"[api] Content-Type: {http_request.headers.get('content-type')}")
        print(f"[api] Raw body length: {len(raw_body)}")
        print(f"[api] Raw body preview: {raw_body[:700].decode('utf-8', errors='replace')}")

        if not raw_body.strip():
            fallback_payload = http_request.headers.get("x-edulink-messages-base64")
            if fallback_payload:
                decoded_body = base64.b64decode(fallback_payload).decode("utf-8")
                print(f"[api] Body empty; using Base64 fallback header length: {len(fallback_payload)}")
                print(f"[api] Fallback payload preview: {decoded_body[:700]}")
                payload = json.loads(decoded_body)
                request = SummarizeRequest.parse_obj(payload)
            else:
                request = SummarizeRequest(messages=[])
        else:
            payload = json.loads(raw_body.decode("utf-8"))
            request = SummarizeRequest.parse_obj(payload)

        print(f"[api] Message count received: {len(request.messages)}")
        if request.messages:
            print(f"[api] First message preview: {request.messages[0][:120]}")

        result = run_summarization_pipeline(request.messages)
        print(f"[api] Summary response ready. Topics: {len(result['topics'])}, Insights: {len(result['insights'])}")
        return SummarizeResponse(**result)
    except json.JSONDecodeError as exc:
        print(f"[api] Invalid JSON body: {exc}")
        raise HTTPException(status_code=400, detail="Request body must be valid JSON") from exc
    except ValidationError as exc:
        print(f"[api] Request schema validation failed: {exc.errors()}")
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        print(f"[api] Summarization failed: {exc}")
        raise HTTPException(status_code=500, detail="Summarization failed") from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
