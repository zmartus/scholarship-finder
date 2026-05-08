from scraper.sources.uf_sfa import UFStudentFinancialAffairs


def test_uf_yields_items():
    items = UFStudentFinancialAffairs().run()
    # Real corpus should have a meaningful set, not the old 2-row stub.
    assert len(items) >= 15
    for item in items:
        assert item.source == "uf_sfa"
        assert item.scope in {"school", "local", "state", "national"}
        assert item.external_id  # non-empty
        assert item.name


def test_uf_external_ids_unique():
    items = UFStudentFinancialAffairs().run()
    ids = [i.external_id for i in items]
    assert len(ids) == len(set(ids)), "external_id collisions"


def test_uf_corpus_includes_known_anchors():
    items = UFStudentFinancialAffairs().run()
    names = {i.name for i in items}
    # If any of these go missing, we know the source got truncated.
    assert any("Machen Florida Opportunity" in n for n in names)
    assert any("Presidential" in n for n in names)
    assert any("Stamps Scholars" in n for n in names)
    # State-wide programs (Bright Futures, Benacquisto, FSAG) live in
    # the florida_state source — see test_florida_state.py.
