"""
Module 1 — NLP Preprocessing
============================
Educational classroom chats contain informal text: emojis, URLs, mixed casing,
and filler words. Preprocessing standardizes raw messages so downstream NLP
modules (embeddings, TextRank, clustering) work on clean, meaningful tokens.

Concepts demonstrated:
- NLP preprocessing (normalization, tokenization, lemmatization)
- Stopword removal (removing high-frequency low-information words)
- Lemmatization (reducing words to dictionary root forms)

Libraries: nltk, spacy, regex
"""

import re
import string

import nltk
import spacy
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

# ---------------------------------------------------------------------------
# Download required NLTK data (safe to run multiple times)
# ---------------------------------------------------------------------------
for resource in ("punkt", "punkt_tab", "stopwords", "wordnet", "omw-1.4"):
    try:
        nltk.download(resource, quiet=True)
    except Exception:
        pass

# Load spaCy English model for lemmatization (falls back to NLTK if missing)
try:
    _NLP = spacy.load("en_core_web_sm", disable=["parser", "ner"])
except OSError:
    _NLP = None
    print(
        "[preprocessing] spaCy model 'en_core_web_sm' not found. "
        "Run: python -m spacy download en_core_web_sm"
    )

# Emoji pattern (covers most common Unicode emoji ranges)
_EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"
    "\U0001F300-\U0001F5FF"
    "\U0001F680-\U0001F6FF"
    "\U0001F1E0-\U0001F1FF"
    "\U00002702-\U000027B0"
    "\U000024C2-\U0001F251"
    "]+",
    flags=re.UNICODE,
)

# URL pattern
_URL_PATTERN = re.compile(
    r"https?://\S+|www\.\S+",
    flags=re.IGNORECASE,
)

_STOPWORDS = set(stopwords.words("english"))
_LEMMATIZER = WordNetLemmatizer()


def clean_message(message: str) -> str:
    """
    Apply a full NLP preprocessing pipeline to a single chat message.

    Steps:
    1. Lowercase conversion — case normalization
    2. Emoji removal — strip non-linguistic symbols
    3. URL removal — remove web links
    4. Punctuation removal — keep only word characters and spaces
    5. Tokenization — split into words
    6. Stopword removal — drop common filler words
    7. Lemmatization — map tokens to base forms

    Parameters
    ----------
    message : str
        Raw chat message (may include speaker prefix like "Student1:").

    Returns
    -------
    str
        Space-joined cleaned tokens ready for NLP analysis.
    """
    if not message or not message.strip():
        return ""

    text = message.strip()

    # Step 1: Lowercase conversion
    text = text.lower()

    # Step 2: Emoji removal
    text = _EMOJI_PATTERN.sub(" ", text)

    # Step 3: URL removal
    text = _URL_PATTERN.sub(" ", text)

    # Step 4: Punctuation removal (keep letters, digits, spaces)
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\s+", " ", text).strip()

    # Step 5: Tokenization
    tokens = word_tokenize(text)

    # Step 6: Stopword removal (also drop very short tokens)
    tokens = [t for t in tokens if t.isalpha() and t not in _STOPWORDS and len(t) > 1]

    # Step 7: Lemmatization
    if _NLP is not None:
        doc = _NLP(" ".join(tokens))
        lemmas = [token.lemma_ for token in doc]
    else:
        lemmas = [_LEMMATIZER.lemmatize(t) for t in tokens]

    return " ".join(lemmas)


def preprocess_messages(messages: list[str]) -> list[str]:
    """Clean a list of messages; empty results are filtered out."""
    cleaned = [clean_message(m) for m in messages]
    return [m for m in cleaned if m]


if __name__ == "__main__":
    print("=" * 60)
    print("MODULE 1 — NLP Preprocessing Demo")
    print("=" * 60)

    # ASCII-safe demo (Windows consoles may not display emoji)
    sample = (
        "Student1: Hey! Check https://example.com/dbms - "
        "What are JDBC drivers and SQL JOINs???"
    )
    print("\nOriginal message:")
    print(sample)
    print("\nCleaned message:")
    print(clean_message(sample))
