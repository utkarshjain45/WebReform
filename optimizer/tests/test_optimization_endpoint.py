"""Integration test for the FastAPI POST /optimization/run endpoint."""

from fastapi.testclient import TestClient
from app.main import app


def test_optimization_endpoint():
    client = TestClient(app)

    payload = {
        "pages": [
            {"id": 1, "url": "https://example.com/", "title": "Home", "depth": 0, "access_frequency": 100.0},
            {"id": 2, "url": "https://example.com/about", "title": "About", "depth": 1, "access_frequency": 40.0},
            {"id": 3, "url": "https://example.com/products", "title": "Products", "depth": 1, "access_frequency": 80.0},
            {"id": 4, "url": "https://example.com/contact", "title": "Contact", "depth": 1, "access_frequency": 30.0},
        ],
        "links": [
            {"source_id": 1, "target_id": 2},
            {"source_id": 1, "target_id": 3},
            {"source_id": 1, "target_id": 4},
            {"source_id": 3, "target_id": 2},
        ],
        "population_size": 8,
        "iterations": 10,
        "max_depth": 3,
        "max_children": 4,
        "random_seed": 42,
        "root_page_id": 1,
    }

    # Test root route
    response = client.post("/optimization/run", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "bestStructure" in data
    assert "initialFitness" in data
    assert "finalFitness" in data
    assert "convergence" in data
    assert "fitnessBreakdown" in data
    assert len(data["convergence"]) == 11

    # Test api_v1 route
    response_v1 = client.post("/api/v1/optimization/run", json=payload)
    assert response_v1.status_code == 200
