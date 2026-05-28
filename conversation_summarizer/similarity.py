"""
Module 3 — Semantic Similarity
==============================
Given sentence embeddings, cosine similarity measures how aligned two
meanings are (1 = identical direction, 0 = unrelated). The similarity
matrix is the adjacency information used later in graph-based TextRank.

Concept demonstrated:
- Semantic similarity (cosine similarity on embedding vectors)

Library: scikit-learn
"""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from embeddings import generate_embeddings


def calculate_similarity(messages: list[str]) -> np.ndarray:
    """
    Build a pairwise semantic similarity matrix for all messages.

    Steps:
    1. Generate sentence embeddings (semantic vectors)
    2. Compute cosine similarity between every pair of vectors

    Parameters
    ----------
    messages : list[str]
        List of sentences or chat messages.

    Returns
    -------
    np.ndarray
        Square matrix of shape (n, n) where entry [i,j] is similarity
        between message i and message j.
    """
    if not messages:
        return np.array([])

    print("[similarity] Computing embeddings for similarity matrix...")
    embeddings = generate_embeddings(messages)

    # Cosine similarity: dot product of normalized vectors
    sim_matrix = cosine_similarity(embeddings)

    print(f"[similarity] Similarity matrix shape: {sim_matrix.shape}")
    print("\n[similarity] Semantic Similarity Matrix:")
    print(np.round(sim_matrix, 3))

    # Demonstrate sentence relationships for the first message
    if len(messages) > 1:
        print("\n[similarity] Sentence relationships (vs. message 0):")
        for idx, score in enumerate(sim_matrix[0]):
            print(f"  Message 0 <-> Message {idx}: {score:.3f} — '{messages[idx][:50]}...'")

    return sim_matrix


if __name__ == "__main__":
    print("=" * 60)
    print("MODULE 3 — Semantic Similarity Demo")
    print("=" * 60)

    demo = [
        "jdbc driver connects java application to database",
        "jdbc api executes sql on relational database",
        "deadlock happens when transactions block each other",
    ]
    calculate_similarity(demo)
