"""BART abstractive summarization module."""
import os

os.environ.setdefault("USE_TF", "0")
os.environ.setdefault("TRANSFORMERS_NO_TF", "1")

"""
Module 7 — Abstractive Summarization
====================================
Unlike TextRank (extractive — picks existing sentences), BART generates new
fluent text that paraphrases the source. This is ABSTRACTIVE summarization.

Concept demonstrated:
- Abstractive summarization (sequence-to-sequence transformer)

Model: facebook/bart-large-cnn (Hugging Face transformers pipeline)
"""

from transformers import pipeline

# Lazy-loaded summarization pipeline
_summarizer = None


def _get_summarizer():
    """Load BART summarization pipeline once."""
    global _summarizer
    if _summarizer is None:
        print("[bart] Loading facebook/bart-large-cnn (may download on first run)...")
        _summarizer = pipeline(
            "summarization",
            model="facebook/bart-large-cnn",
        )
    return _summarizer


def generate_bart_summary(text: str, max_length: int = 150, min_length: int = 40) -> str:
    """
    Generate a human-like abstractive summary using BART.

    Parameters
    ----------
    text : str
        Source text (conversation concatenated). Truncated if very long.
    max_length : int
        Maximum tokens in generated summary.
    min_length : int
        Minimum tokens in generated summary.

    Returns
    -------
    str
        Abstractive summary text.
    """
    if not text or not text.strip():
        return ""

    # BART has input length limits; truncate roughly for classroom chats
    max_chars = 4000
    if len(text) > max_chars:
        text = text[:max_chars]
        print(f"[bart] Input truncated to {max_chars} characters for model limits.")

    summarizer = _get_summarizer()

    print("[bart] Generating abstractive summary...")
    result = summarizer(
        text,
        max_length=max_length,
        min_length=min_length,
        do_sample=False,
    )

    summary = result[0]["summary_text"].strip()

    print("\n[bart] Abstractive Summary:")
    print("-" * 60)
    print(summary)
    print("-" * 60)

    return summary


if __name__ == "__main__":
    print("=" * 60)
    print("MODULE 7 — BART Abstractive Summarization Demo")
    print("=" * 60)

    demo = (
        "The class discussed JDBC drivers and connections. "
        "Students asked about PreparedStatement and SQL injection. "
        "The teacher explained transactions, ACID, and deadlocks. "
        "They also reviewed inner joins and left joins in SQL."
    )
    generate_bart_summary(demo, max_length=80, min_length=25)
