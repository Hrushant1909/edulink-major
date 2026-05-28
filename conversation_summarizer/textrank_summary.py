"""
Module 4 — Graph-Based TextRank Summarization
=============================================
TextRank (Mihalcea & Tarau, 2004 — "TextRank: Bringing Order into Texts")
applies PageRank on a graph of sentences: nodes = sentences, edges = similarity.

This is EXTRACTIVE summarization: selected sentences come verbatim from the chat.

Concepts demonstrated:
- TextRank algorithm
- PageRank (random walk importance on a graph)
- Graph-based summarization
- Extractive summarization
- Semantic embeddings + cosine similarity as edge weights

Libraries: networkx, sklearn, sentence-transformers
"""

import numpy as np
import networkx as nx
from sklearn.metrics.pairwise import cosine_similarity

from embeddings import generate_embeddings


def _build_similarity_graph(sim_matrix: np.ndarray, threshold: float = 0.0) -> nx.Graph:
    """
    Create an undirected weighted graph from a similarity matrix.

    In TextRank, each sentence is a node; edge weight = semantic similarity.
    """
    n = sim_matrix.shape[0]
    graph = nx.Graph()

    for i in range(n):
        graph.add_node(i)

    for i in range(n):
        for j in range(i + 1, n):
            weight = float(sim_matrix[i, j])
            if weight > threshold:
                graph.add_edge(i, j, weight=weight)

    return graph


def generate_summary(messages: list[str], top_n: int = 3) -> str:
    """
    TextRank extractive summarization pipeline.

    Implementation steps (per TextRank paper):
    1. Convert sentences into embeddings
    2. Generate similarity matrix
    3. Create graph from similarity matrix
    4. Apply PageRank
    5. Rank sentences by PageRank score
    6. Select top-ranked sentences
    7. Return extractive summary (original order preserved)

    Parameters
    ----------
    messages : list[str]
        Sentences to summarize (use original text, not only cleaned tokens).
    top_n : int
        Number of top sentences to include in the summary.

    Returns
    -------
    str
        Multi-sentence extractive summary.
    """
    if not messages:
        return ""

    top_n = min(top_n, len(messages))

    print("\n[textrank] Step 1: Convert sentences into semantic embeddings")
    embeddings = generate_embeddings(messages)

    print("[textrank] Step 2: Generate similarity matrix (adjacency weights)")
    sim_matrix = cosine_similarity(embeddings)

    print("[textrank] Step 3: Build sentence similarity graph (TextRank graph)")
    graph = _build_similarity_graph(sim_matrix)

    print("[textrank] Step 4: Apply PageRank on the graph")
    # PageRank: importance score via random walk (same idea as web PageRank)
    scores = nx.pagerank(graph, weight="weight")

    print("[textrank] Step 5–6: Rank sentences and select top-N")
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    print("\n[textrank] Sentence Rankings (PageRank scores):")
    for rank, (sent_idx, score) in enumerate(ranked, start=1):
        preview = messages[sent_idx][:70].replace("\n", " ")
        print(f"  Rank {rank} | Score {score:.4f} | [{sent_idx}] {preview}...")

    top_indices = sorted([idx for idx, _ in ranked[:top_n]])
    summary_sentences = [messages[i] for i in top_indices]
    summary = " ".join(summary_sentences)

    print("\n[textrank] Step 7: Final Extractive Summary (TextRank):")
    print("-" * 60)
    print(summary)
    print("-" * 60)

    return summary


if __name__ == "__main__":
    print("=" * 60)
    print("MODULE 4 — TextRank Summarization Demo")
    print("=" * 60)

    demo_messages = [
        "JDBC connects Java programs to relational databases using drivers.",
        "PreparedStatement prevents SQL injection in JDBC applications.",
        "A deadlock occurs when transactions wait for each other's locks.",
        "Inner joins return only rows that match in both SQL tables.",
        "ACID properties ensure reliable database transactions.",
    ]
    generate_summary(demo_messages, top_n=2)
