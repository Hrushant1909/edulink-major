"""Keyword extraction module."""
import os

os.environ.setdefault("USE_TF", "0")
os.environ.setdefault("TRANSFORMERS_NO_TF", "1")

"""
Module 6 — Keyword Extraction
=============================
KeyBERT uses BERT embeddings to find terms/phrases that are most representative
of the document. Teachers can quickly see vocabulary students focused on.

Concept demonstrated:
- Keyword extraction / keyphrase extraction (embedding-based relevance)

Library: KeyBERT
"""

from keybert import KeyBERT

# Lazy-loaded KeyBERT model (uses same family of semantic embeddings)
_kw_model = None


def _get_keybert() -> KeyBERT:
    global _kw_model
    if _kw_model is None:
        print("[keywords] Loading KeyBERT model...")
        _kw_model = KeyBERT(model="all-MiniLM-L6-v2")
    return _kw_model


def extract_keywords(text: str, top_n: int = 10) -> list[tuple[str, float]]:
    """
    Extract top keywords and keyphrases with relevance scores.

    Parameters
    ----------
    text : str
        Full conversation or concatenated messages.
    top_n : int
        Number of keywords to return.

    Returns
    -------
    list[tuple[str, float]]
        (keyword, relevance_score) pairs sorted by score.
    """
    if not text or not text.strip():
        return []

    model = _get_keybert()

    # keyphrase_ngram_range captures multi-word terms like "sql injection"
    keywords = model.extract_keywords(
        text,
        keyphrase_ngram_range=(1, 2),
        stop_words="english",
        top_n=top_n,
        use_mmr=True,
        diversity=0.5,
    )

    print("\n[keywords] Top Keywords and Keyphrases:")
    print("-" * 60)
    for term, score in keywords:
        print(f"  {term!r:30s} | Relevance: {score:.4f}")
    print("-" * 60)

    return keywords


if __name__ == "__main__":
    print("=" * 60)
    print("MODULE 6 — Keyword Extraction Demo")
    print("=" * 60)

    sample_text = (
        "Students discussed JDBC connections, PreparedStatement, SQL joins, "
        "database transactions, ACID properties, deadlocks, and DBMS indexing."
    )
    extract_keywords(sample_text, top_n=8)
