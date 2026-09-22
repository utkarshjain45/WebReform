"""Unit tests for discrete website structure encoding and decoding."""

import numpy as np
import pytest

from gwo.encoding import StructureEncoder, WebsiteStructure


def test_structure_encoder_dimension():
    num_pages = 5
    encoder = StructureEncoder(num_pages=num_pages)
    # Dimension should be 2 * (N - 1) = 2 * 4 = 8
    assert encoder.dimension == 8


def test_structure_encoder_invalid_pages():
    with pytest.raises(ValueError):
        StructureEncoder(num_pages=1)


def test_decode_valid_continuous_vector():
    num_pages = 4
    encoder = StructureEncoder(num_pages=num_pages)
    # 2 * 3 = 6 components
    pos = np.array([0.1, 0.5, 0.9, 0.2, 0.8, 0.4])

    structure = encoder.decode(pos)

    assert isinstance(structure, WebsiteStructure)
    assert structure.num_pages == 4
    assert structure.parents[0] is None
    assert structure.depths[0] == 0

    # Ensure all nodes 1..3 have valid parents in [0, 3] and not self
    for i in range(1, 4):
        p = structure.parents[i]
        assert p is not None
        assert 0 <= p < 4
        assert p != i


def test_encode_and_decode_consistency():
    num_pages = 4
    parents = {0: None, 1: 0, 2: 1, 3: 0}
    positions = {0: 0, 1: 0, 2: 0, 3: 1}

    original = WebsiteStructure(num_pages=num_pages, parents=parents, positions=positions)
    encoder = StructureEncoder(num_pages=num_pages)

    encoded_vec = encoder.encode(original)
    assert len(encoded_vec) == 6
    assert np.all(encoded_vec >= 0.0) and np.all(encoded_vec <= 1.0)

    decoded = encoder.decode(encoded_vec)
    assert decoded.parents == original.parents
