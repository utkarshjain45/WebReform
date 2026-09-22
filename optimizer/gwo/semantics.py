"""Pluggable semantic relevance module for website page content similarity."""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from gwo.encoding import WebsiteStructure


class SemanticSimilarityProvider(ABC):
    """Abstract base class for computing semantic similarity between web pages."""

    @abstractmethod
    def get_similarity(self, page_u: int, page_v: int) -> float:
        """Returns pairwise semantic similarity between page_u and page_v in [0.0, 1.0]."""
        pass

    @abstractmethod
    def compute_hierarchy_relevance(self, structure: WebsiteStructure) -> float:
        """Computes aggregate semantic relevance of a candidate website hierarchy in [0.0, 1.0]."""
        pass


class TfidfSemanticProvider(SemanticSimilarityProvider):
    """Computes textual semantic similarity using TF-IDF tokenization and cosine similarity."""

    def __init__(self, page_contents: Dict[int, str], num_pages: int):
        self.num_pages = num_pages
        self.similarity_matrix = np.eye(num_pages, dtype=np.float64)

        # Collect text corpus in order of page index 0 to num_pages - 1
        corpus = [page_contents.get(i, "") for i in range(num_pages)]

        # Check if corpus contains any non-empty meaningful text
        has_text = any(len(text.strip()) > 0 for text in corpus)
        if has_text:
            try:
                vectorizer = TfidfVectorizer(stop_words="english", max_features=1000)
                tfidf_matrix = vectorizer.fit_transform(corpus)
                cos_sim = cosine_similarity(tfidf_matrix)
                # Ensure bounded within [0.0, 1.0]
                self.similarity_matrix = np.clip(cos_sim, 0.0, 1.0)
            except ValueError:
                # Fallback if vocabulary is completely empty (e.g. all stop words)
                self.similarity_matrix = np.eye(num_pages, dtype=np.float64)

    def get_similarity(self, page_u: int, page_v: int) -> float:
        if 0 <= page_u < self.num_pages and 0 <= page_v < self.num_pages:
            return float(self.similarity_matrix[page_u, page_v])
        return 0.0

    def compute_hierarchy_relevance(self, structure: WebsiteStructure) -> float:
        """Calculates the mean semantic similarity between parents and their assigned child pages."""
        if structure.num_pages <= 1:
            return 1.0

        similarities: List[float] = []
        for child in range(1, structure.num_pages):
            parent = structure.parents.get(child)
            if parent is not None:
                sim = self.get_similarity(parent, child)
                similarities.append(sim)

        return float(np.mean(similarities)) if similarities else 1.0


class DefaultSemanticProvider(SemanticSimilarityProvider):
    """Neutral fallback provider returning baseline similarity when textual content is unprovided."""

    def __init__(self, num_pages: int, default_similarity: float = 0.5):
        self.num_pages = num_pages
        self.default_similarity = default_similarity

    def get_similarity(self, page_u: int, page_v: int) -> float:
        return 1.0 if page_u == page_v else self.default_similarity

    def compute_hierarchy_relevance(self, structure: WebsiteStructure) -> float:
        return self.default_similarity
