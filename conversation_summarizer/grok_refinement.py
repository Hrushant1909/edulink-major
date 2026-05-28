"""Grok refinement over local NLP artifacts only."""
import json
import os
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parent / ".env")
except ImportError:
    pass

DEFAULT_GROK_URL = "https://api.x.ai/v1/chat/completions"
DEFAULT_GROK_MODEL = "grok-2-latest"


def _get_api_key() -> str:
    return (
        os.environ.get("XAI_API_KEY", "").strip()
        or os.environ.get("GROK_API_KEY", "").strip()
    )


def _build_prompt(context: dict[str, Any]) -> list[dict[str, str]]:
    system_prompt = (
        "You are an expert teacher assistant. Refine classroom chat analysis into "
        "a concise, accurate educational summary. Do not invent facts. Use only "
        "the provided NLP artifacts. Return valid JSON only."
    )

    user_prompt = {
        "task": "Refine local NLP classroom-chat analysis.",
        "rules": [
            "Do not use or request raw chat messages.",
            "Keep the summary human-like and specific to the detected topics.",
            "Ignore greetings, discipline chatter, and off-topic noise unless it affects learning.",
            "Separate learning insights from weak areas.",
            "Return exactly: summary, topics, insights, weakAreas.",
        ],
        "localNlpArtifacts": context,
        "outputSchema": {
            "summary": "2-4 sentence paragraph",
            "topics": ["short topic labels"],
            "insights": ["teacher-facing observations"],
            "weakAreas": ["topics or misconceptions needing attention"],
        },
    }

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": json.dumps(user_prompt, ensure_ascii=False)},
    ]


def refine_with_grok(context: dict[str, Any], timeout_seconds: int = 90) -> dict[str, Any] | None:
    """
    Refine local NLP artifacts with Grok/xAI.

    Raw chats are intentionally not accepted here. Callers should pass only
    derived artifacts such as initial summary, topics, repeated doubts, and
    weak areas.
    """
    api_key = _get_api_key()
    if not api_key:
        print("[grok] XAI_API_KEY/GROK_API_KEY not configured; using local fallback.")
        return None

    url = os.environ.get("GROK_API_URL", DEFAULT_GROK_URL).strip() or DEFAULT_GROK_URL
    model = os.environ.get("GROK_MODEL", DEFAULT_GROK_MODEL).strip() or DEFAULT_GROK_MODEL

    payload = {
        "model": model,
        "messages": _build_prompt(context),
        "temperature": 0.25,
        "max_tokens": 900,
        "response_format": {"type": "json_object"},
    }

    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )

    try:
        print(f"[grok] Refining NLP artifacts with model: {model}")
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            body = response.read().decode("utf-8")
        data = json.loads(body)
        content = data["choices"][0]["message"]["content"]
        refined = json.loads(content)
        print("[grok] Refinement successful.")
        return {
            "summary": str(refined.get("summary", "")).strip(),
            "topics": _as_string_list(refined.get("topics")),
            "insights": _as_string_list(refined.get("insights")),
            "weakAreas": _as_string_list(refined.get("weakAreas")),
        }
    except (urllib.error.URLError, urllib.error.HTTPError, KeyError, json.JSONDecodeError, TimeoutError) as exc:
        print(f"[grok] Refinement failed; using local fallback: {exc}")
        return None


def _as_string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]
