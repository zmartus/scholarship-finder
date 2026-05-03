from scraper.sources.uf_sfa import UFStudentFinancialAffairs


def test_uf_stub_yields_items():
    items = UFStudentFinancialAffairs().run()
    assert len(items) >= 1
    for item in items:
        assert item.source == "uf_sfa"
        assert item.scope == "school"
        assert item.college_slug == "university-of-florida"
        assert item.external_id.startswith("uf_sfa-")
