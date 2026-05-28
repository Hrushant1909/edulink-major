"""Sentence embeddings module."""
import os

os.environ.setdefault("USE_TF", "0")
os.environ.setdefault("TRANSFORMERS_NO_TF", "1")

"""
Module 2 — Sentence Embeddings
==============================
Semantic embeddings map text into dense vectors so that similar meanings
lie close together in vector space. This is the foundation for semantic
similarity, TextRank graphs, and topic clustering.

Concept demonstrated:
- Semantic embeddings (Sentence-BERT / transformer encoders)

Model: all-MiniLM-L6-v2 (SentenceTransformer)
"""

import numpy as np
from sentence_transformers import SentenceTransformer

# Global model loaded once for efficiency (384-dimensional vectors)
_MODEL_NAME = "all-MiniLM-L6-v2"
_model = None


def _get_model() -> SentenceTransformer:
    """Lazy-load the SentenceTransformer model."""
    global _model
    if _model is None:
        print(f"[embeddings] Loading model: {_MODEL_NAME}")
        _model = SentenceTransformer(_MODEL_NAME)
    return _model


def generate_embeddings(messages: list[str]) -> np.ndarray:
    """
    Convert a list of messages into semantic embedding vectors.

    Each message becomes a fixed-size vector capturing meaning (not just
    word overlap). These vectors power similarity, TextRank, and clustering.

    Parameters
    ----------
    messages : list[str]
        Preprocessed or raw sentences/messages.

    Returns
    -------
    np.ndarray
        Shape (num_messages, embedding_dim) — semantic vector matrix.
    """
    if not messages:
        return np.array([])

    model = _get_model()

    # encode() produces one semantic vector per input sentence
    embeddings = model.encode(
        messages,
        convert_to_numpy=True,
        show_progress_bar=False,
    )

    print(f"[embeddings] Generated semantic vectors for {len(messages)} messages")
    print(f"[embeddings] Embedding shape: {embeddings.shape}")
    print(
        f"[embeddings] Each row is a {embeddings.shape[1]}-dim semantic embedding "
        f"(all-MiniLM-L6-v2)"
    )

    return embeddings


if __name__ == "__main__":
    print("=" * 60)
    print("MODULE 2 — Sentence Embeddings Demo")
    print("=" * 60)

    demo_messages = [
        "jdbc connects java to relational databases",
        "deadlock occurs when transactions wait for each other",
        "inner join returns matching rows from two tables",
    ]
    vectors = generate_embeddings(demo_messages)
    print(f"\nFirst embedding (first 5 values): {vectors[0][:5]}")
