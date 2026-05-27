"""
Module 8 — Academic Insight Generation
======================================
Rule-based analytics on detected topics help teachers see what students
discussed most and which topics may need more attention (low frequency).

Uses frequency analysis (collections.Counter) — simple but interpretable
for academic demos alongside neural NLP modules.

Concept demonstrated:
- Educational insight generation (frequency analysis, weak topic detection)
"""

from collections import Counter


def generate_insights(topics: list[str]) -> str:
    """
    Build a teacher-facing insight report from topic labels or keywords.

    Parameters
    ----------
    topics : list[str]
        Topic names extracted from chat (e.g., from keywords or manual tags).

    Returns
    -------
    str
        Formatted insight report.
    """
    if not topics:
        return "No topics available for insight generation."

    counts = Counter(topics)
    total = sum(counts.values())

    lines = []
    lines.append("=" * 60)
    lines.append("ACADEMIC INSIGHTS FOR TEACHERS")
    lines.append("=" * 60)

    lines.append("\nMost Discussed Topics:")
    for topic, freq in counts.most_common():
        lines.append(f"  {topic} -> {freq}")

    # Weak topics: below average frequency (may need re-teaching)
    if len(counts) > 1:
        avg_freq = total / len(counts)
        weak = [t for t, f in counts.items() if f < avg_freq]
        lines.append("\nWeak / Less Discussed Topics (below average frequency):")
        if weak:
            for topic in sorted(weak):
                lines.append(f"  {topic} -> {counts[topic]} (consider revisiting in class)")
        else:
            lines.append("  None — discussion was evenly distributed.")

    lines.append("\nFrequency Analysis Summary:")
    lines.append(f"  Total topic mentions: {total}")
    lines.append(f"  Unique topics: {len(counts)}")
    lines.append(f"  Most frequent: {counts.most_common(1)[0][0]}")

    report = "\n".join(lines)

    print("\n[insights] Generated Report:")
    print(report)

    return report


def topics_from_keywords(keyword_tuples: list[tuple[str, float]], threshold: float = 0.3) -> list[str]:
    """
    Convert KeyBERT output into topic strings for insight generation.

    Maps multi-word keyphrases to simplified topic labels for counting.
    """
    topics = []
    for phrase, score in keyword_tuples:
        if score >= threshold:
            # Normalize: use first significant word as topic bucket
            topic = phrase.split()[0].upper() if phrase else phrase
            topics.append(topic)
    return topics


if __name__ == "__main__":
    print("=" * 60)
    print("MODULE 8 — Insight Generation Demo")
    print("=" * 60)

    demo_topics = [
        "JDBC", "JDBC", "JDBC", "JDBC", "JDBC",
        "JDBC", "JDBC", "JDBC", "JDBC", "JDBC",
        "Deadlock", "Deadlock", "Deadlock", "Deadlock", "Deadlock",
        "SQL", "SQL", "SQL",
        "DBMS", "DBMS",
        "Transaction",
    ]
    generate_insights(demo_topics)
