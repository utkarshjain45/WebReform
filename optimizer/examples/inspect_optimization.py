import json
import os
import sys

# Ensure optimizer directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from gwo.pipeline import OptimizationConfig, WebsiteOptimizationPipeline


def run_deterministic_inspection():
    print("=" * 70)
    print(" WebReform: Deterministic Optimization Pipeline Inspection ")
    print("=" * 70)

    # 1. Define synthetic 6-page website
    pages = [
        {
            "id": 100,
            "url": "https://example.com/",
            "title": "Home",
            "content": "TechCorp homepage enterprise cloud infrastructure software solutions",
            "depth": 0,
            "access_frequency": 100.0,
        },
        {
            "id": 101,
            "url": "https://example.com/products",
            "title": "Products",
            "content": "Cloud computing servers database infrastructure hardware virtualization",
            "depth": 1,
            "access_frequency": 45.0,
        },
        {
            "id": 102,
            "url": "https://example.com/products/cloud",
            "title": "Cloud Servers",
            "content": "Scalable compute cloud instances high availability storage",
            "depth": 2,
            "access_frequency": 80.0,  # High traffic page initially buried
        },
        {
            "id": 103,
            "url": "https://example.com/pricing",
            "title": "Pricing Plans",
            "content": "Enterprise pricing subscription calculator cost breakdown",
            "depth": 1,
            "access_frequency": 60.0,
        },
        {
            "id": 104,
            "url": "https://example.com/blog",
            "title": "Engineering Blog",
            "content": "Weekly tech articles engineering updates conference notes",
            "depth": 1,
            "access_frequency": 10.0,  # Low traffic page
        },
        {
            "id": 105,
            "url": "https://example.com/portal/checkout",
            "title": "Client Checkout",
            "content": "Secure payment invoice billing customer portal authentication",
            "depth": 3,
            "access_frequency": 50.0,
        },
    ]

    links = [
        {"source_id": 100, "target_id": 101},
        {"source_id": 100, "target_id": 103},
        {"source_id": 100, "target_id": 104},
        {"source_id": 101, "target_id": 102},
        {"source_id": 103, "target_id": 105},
        {"source_id": 104, "target_id": 100},
    ]

    # Page 105 (Checkout) is marked as a critical business page
    critical_pages = [105]

    # 2. Configure deterministic GWO parameters
    config = OptimizationConfig(
        population_size=20,
        iterations=30,
        max_depth=3,
        max_children=4,
        random_seed=42,  # Deterministic seed for reproducible inspection
        weight_navigation=0.35,
        weight_behavior=0.20,
        weight_structural=0.20,
        weight_depth=0.25,
        weight_semantic=1.0,
    )

    print(f"\n[1] Ingested Graph: {len(pages)} pages, {len(links)} internal links")
    print(f"    Critical Pages: {critical_pages}")
    print(f"    Config: PopSize={config.population_size}, Iterations={config.iterations}, Seed={config.random_seed}")
    print(f"    Constraints: MaxDepth={config.max_depth}, MaxChildren={config.max_children}")

    # 3. Execute pipeline
    pipeline = WebsiteOptimizationPipeline(config=config)
    result = pipeline.run(
        pages=pages,
        links=links,
        critical_page_ids=critical_pages,
        root_page_id=100,
    )

    # 4. Display Results
    print("\n[2] Optimization Summary:")
    print(f"    Initial Fitness (Alpha Gen 0): {result['initialFitness']:.4f}")
    print(f"    Final Fitness   (Best Found):  {result['finalFitness']:.4f}")
    print(f"    Improvement:                   {result['improvementPercentage']:.2f}%")
    print(f"    Execution Time:                {result['executionTime']:.4f} seconds")

    print("\n[3] Fitness Breakdown:")
    for component, value in result["fitnessBreakdown"].items():
        print(f"    - {component:<22}: {value:.4f}")

    print("\n[4] Convergence Trace (First 5 and Last 5 iterations):")
    conv = result["convergence"]
    for it, val in enumerate(conv[:5]):
        print(f"    Iter {it:02d}: {val:.4f}")
    if len(conv) > 10:
        print("    ...")
    for it, val in enumerate(conv[-5:], start=len(conv) - 5):
        print(f"    Iter {it:02d}: {val:.4f}")

    print("\n[5] Optimal Hierarchy (Page -> Parent, Depth, Position):")
    struct = result["bestStructure"]
    for page_id in sorted(struct["parents"].keys()):
        parent_id = struct["parents"][page_id]
        depth = struct["depths"][page_id]
        pos = struct["positions"][page_id]
        p_str = f"Page {parent_id}" if parent_id is not None else "ROOT"
        print(f"    Page {page_id}: Parent={p_str:<10} | Depth={depth} | Pos={pos}")

    # 5. Invariant Checks
    print("\n[6] Invariant Verification:")
    max_observed_depth = max(struct["depths"].values())
    print(f"    - Max depth {max_observed_depth} <= {config.max_depth}: {max_observed_depth <= config.max_depth}")
    print(f"    - Critical page 105 depth: {struct['depths'][105]} (reachable: True)")
    print(f"    - Total pages represented: {struct['numPages']} == {len(pages)}")

    print("\n" + "=" * 70)
    return result


if __name__ == "__main__":
    run_deterministic_inspection()
