"""
Module 5 — Topic Clustering
===========================
K-Means groups messages in embedding space so semantically similar discussions
(e.g., JDBC vs. deadlocks) form separate clusters. Useful for teachers to see
which themes dominated the classroom chat.

Concept demonstrated:
- Clustering (unsupervised grouping via K-Means on semantic embeddings)

Libraries: scikit-learn, sentence embeddings
"""

import numpy as np
from sklearn.cluster import KMeans

from embeddings import generate_embeddings


def cluster_messages(messages: list[str], num_clusters: int = 2) -> list[int]:
    """
    Group messages into semantic clusters using K-Means.

    Parameters
    ----------
    messages : list[str]
        Chat messages or sentences.
    num_clusters : int
        Number of topic groups (K in K-Means).

    Returns
    -------
    list[int]
        Cluster label per message (same order as input).
    """
    if not messages:
        return []

    num_clusters = min(num_clusters, len(messages))

    print(f"[clustering] Embedding {len(messages)} messages for K-Means...")
    embeddings = generate_embeddings(messages)

    print(f"[clustering] Running K-Means with K={num_clusters}")
    kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(embeddings)

    print("\n[clustering] Semantic Topic Groups:")
    print("-" * 60)
    for msg, label in zip(messages, labels):
        preview = msg[:65].replace("\n", " ")
        print(f"  Cluster {label} | {preview}")
    print("-" * 60)

    return labels.tolist()


if __name__ == "__main__":
    print("=" * 60)
    print("MODULE 5 — Topic Clustering Demo")
    print("=" * 60)

    demo = [
        "jdbc driver loads connection to mysql database",
        "preparedstatement avoids sql injection in jdbc",
        "deadlock detection aborts one waiting transaction",
        "two phase locking can prevent deadlock cycles",
        "inner join combines employee and department tables",
    ]
    cluster_messages(demo, num_clusters=2)
