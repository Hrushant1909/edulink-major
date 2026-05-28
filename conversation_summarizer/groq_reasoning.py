"""
Module 9 — Groq LLM Reasoning (Post-Pipeline)
=============================================
After classical NLP modules finish (preprocessing, embeddings, TextRank,
clustering, keywords, BART), this module sends structured results to Groq
for teacher-oriented reasoning: misconceptions, gaps, and next steps.

Concept demonstrated:
- LLM-based reasoning on top of NLP pipeline outputs (RAG-style context)

Requires: GROQ_API_KEY in environment or .env file (never commit the key).
"""

import os
from pathlib import Path

# Load .env from project root if python-dotenv is installed
try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parent / ".env")
except ImportError:
    pass

# Default Groq chat model (fast; good for classroom insight reasoning)
DEFAULT_MODEL = "llama-3.3-70b-versatile"


def _get_client():
    """Create Groq client using API key from environment."""
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        raise ValueError(
            "GROQ_API_KEY not set. Add it to conversation_summarizer/.env or "
            "set the environment variable before running."
        )

    from groq import Groq

    return Groq(api_key=api_key)


def _build_context(
    messages: list[str],
    textrank_summary: str,
    bart_summary: str,
    keyword_results: list[tuple[str, float]],
    insights_report: str,
    cluster_labels: list[int] | None = None,
) -> str:
    """Pack NLP pipeline outputs into a single prompt context for the LLM."""
    lines = [
        "=== CLASSROOM CHAT (sample) ===",
        *messages[:15],
        f"... ({len(messages)} messages total)" if len(messages) > 15 else "",
        "",
        "=== EXTRACTIVE SUMMARY (TextRank + PageRank) ===",
        textrank_summary,
        "",
        "=== ABSTRACTIVE SUMMARY (BART) ===",
        bart_summary,
        "",
        "=== TOP KEYWORDS (KeyBERT) ===",
    ]
    for term, score in keyword_results[:12]:
        lines.append(f"  - {term}: {score:.4f}")

    lines.extend(["", "=== FREQUENCY INSIGHTS ===", insights_report])

    if cluster_labels and len(cluster_labels) == len(messages):
        lines.append("\n=== CLUSTER ASSIGNMENTS ===")
        for msg, label in zip(messages, cluster_labels):
            lines.append(f"  Cluster {label}: {msg[:80]}")

    return "\n".join(lines)


def generate_groq_reasoning(
    messages: list[str],
    textrank_summary: str,
    bart_summary: str,
    keyword_results: list[tuple[str, float]],
    insights_report: str,
    cluster_labels: list[int] | None = None,
    model: str = DEFAULT_MODEL,
) -> str:
    """
    Call Groq API to reason over completed NLP pipeline results.

    Parameters
    ----------
    messages : list[str]
        Original classroom chat lines.
    textrank_summary : str
        TextRank extractive summary.
    bart_summary : str
        BART abstractive summary.
    keyword_results : list[tuple[str, float]]
        KeyBERT (keyword, score) pairs.
    insights_report : str
        Rule-based frequency insights.
    cluster_labels : list[int], optional
        K-Means cluster id per message.
    model : str
        Groq model id.

    Returns
    -------
    str
        Teacher-facing reasoning report from Groq.
    """
    context = _build_context(
        messages,
        textrank_summary,
        bart_summary,
        keyword_results,
        insights_report,
        cluster_labels,
    )

    system_prompt = (
        "You are an expert DBMS/JDBC instructor analyzing a classroom group chat. "
        "You receive outputs from an NLP pipeline: TextRank extractive summary, "
        "BART abstractive summary, KeyBERT keywords, topic frequency insights, "
        "and optional cluster labels. "
        "Write clear, actionable reasoning for the teacher. Be concise and academic."
    )

    user_prompt = f"""Based on the NLP analysis below, provide:

1. **Discussion overview** — What did students focus on?
2. **Conceptual strengths** — What do students seem to understand?
3. **Knowledge gaps & misconceptions** — What needs clarification?
4. **Teaching recommendations** — 3–5 concrete next steps for the next class.
5. **Assessment ideas** — Short quiz or lab topics aligned with the chat.

NLP PIPELINE OUTPUTS:
{context}
"""

    print(f"[groq] Calling Groq model: {model}")
    client = _get_client()

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
        max_tokens=1200,
    )

    reasoning = response.choices[0].message.content.strip()

    print("\n[groq] Teacher reasoning report:")
    print("-" * 60)
    print(reasoning)
    print("-" * 60)

    return reasoning


if __name__ == "__main__":
    print("=" * 60)
    print("MODULE 9 — Groq Reasoning Demo")
    print("=" * 60)

    demo_context = generate_groq_reasoning(
        messages=["Student: What is JDBC?", "Teacher: JDBC connects Java to SQL databases."],
        textrank_summary="JDBC connects Java applications to databases.",
        bart_summary="The class discussed JDBC basics.",
        keyword_results=[("jdbc", 0.9), ("database", 0.7)],
        insights_report="Most Discussed Topics:\n  JDBC -> 2",
    )
    print(demo_context[:200], "...")
