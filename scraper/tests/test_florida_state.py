from scraper.sources.florida_state import FloridaState
from scraper.sources.nationals import Nationals


def test_florida_state_has_bright_futures_tiers():
    items = FloridaState().run()
    names = {i.name for i in items}
    assert any("Academic Scholars" in n for n in names)
    assert any("Medallion" in n for n in names)
    assert any("Gold Seal Vocational" in n for n in names)
    assert any("Benacquisto" in n for n in names)


def test_florida_state_all_state_scope():
    for item in FloridaState().run():
        assert item.scope == "state"
        assert item.college_slug is None  # portable across all FL public schools


def test_nationals_has_anchors():
    items = Nationals().run()
    names = {i.name for i in items}
    assert any("Coca-Cola" in n for n in names)
    assert any("Hispanic Scholarship Fund" in n for n in names)
    assert any("Gates Scholarship" in n for n in names)
    assert any("QuestBridge" in n for n in names)


def test_nationals_all_national_scope():
    for item in Nationals().run():
        assert item.scope == "national"
        assert item.college_slug is None


def test_external_ids_unique_across_sources():
    """No two sources should claim the same (source, external_id) pair."""
    from scraper.sources import all_sources
    seen: set[tuple[str, str]] = set()
    for src in all_sources():
        for it in src.run():
            key = (it.source, it.external_id)
            assert key not in seen, f"duplicate {key}"
            seen.add(key)
