import json
import types
import unittest
import test_your_health_tip as fixtures
gl = fixtures.gl
module = fixtures.module

URL = module.DEFAULT_SOURCES['general']
QUOTE = 'physical activity prevents disease and supports well-being.'
WHY = 'This passage specifically addresses the material assertion in this claim.'

def result(sources, status='evidence-consistent', confidence=90):
    return json.dumps(dict(status=status, confidence=confidence, reasoning=WHY, sources=sources))

def source(url=URL, finding='supports', excerpt=QUOTE):
    return dict(url=url, finding=finding, excerpt=excerpt, justification=WHY)

class RegressionTests(unittest.TestCase):
    def setUp(self):
        self.f = fixtures.ContractTests()
        self.f.setUp()
        self.c = self.f.c
        self.f.submit()

    def test_report_deduplication_survives_summary_eviction(self):
        for i in range(55):
            gl.message.sender_address = f'0x{i:040x}'
            self.c.flag_tip('tip1', f'Report reason {i}')
        gl.message.sender_address = f'0x{0:040x}'
        with self.assertRaisesRegex(ValueError, 'already reported'):
            self.c.flag_tip('tip1', 'Repeating my report')
        tip = self.f.tip()
        self.assertEqual(tip['flag_count'], 55)
        self.assertEqual(len(tip['reports']), 50)
        self.assertEqual(json.loads(self.c.get_history_paged('tip1', 'reports', 0, 1))[0]['reason'], 'Report reason 0')

    def test_per_source_conflict_rejected_even_when_final_labels_match(self):
        second = 'https://www.cdc.gov/another-source'
        self.c.tips['tip1'] = json.dumps(dict(self.f.tip(), supporting_sources=[URL, second]))
        gl.nondet.exec_prompt.side_effect = [
            result([source(), source(second, 'insufficient', '')]),
            result([source(URL, 'insufficient', ''), source(second)])]
        with self.assertRaisesRegex(ValueError, 'disagreed'):
            self.c.review_tip('tip1')
        self.assertIsNone(self.f.tip()['review'])

    def test_same_labels_with_different_material_passages_rejected(self):
        unrelated = 'General administrative publication information with no clinical support for the specific claim.'
        gl.nondet.web.render.return_value = (QUOTE + ' ' + unrelated) * 4
        gl.nondet.exec_prompt.side_effect = [result([source(excerpt=unrelated)]), result([source()])]
        with self.assertRaisesRegex(ValueError, 'disagreed'):
            self.c.review_tip('tip1')

    def test_mixed_material_evidence_forces_undetermined(self):
        other = 'https://www.cdc.gov/contradiction'
        self.c.tips['tip1'] = json.dumps(dict(self.f.tip(), supporting_sources=[URL, other]))
        gl.nondet.exec_prompt.return_value = result([source(), source(other, 'contradicts')])
        self.assertEqual(self.c.review_tip('tip1'), 'undetermined')
        self.assertLessEqual(self.f.tip()['review']['confidence'], 40)

    def test_missing_source_specific_justification_cannot_support_verdict(self):
        bad = source(); bad['justification'] = ''
        gl.nondet.exec_prompt.return_value = result([bad])
        self.assertEqual(self.c.review_tip('tip1'), 'undetermined')

    def test_trivial_excerpt_cannot_ground_confident_verdict(self):
        gl.nondet.exec_prompt.return_value = result([source(excerpt='health')])
        self.assertEqual(self.c.review_tip('tip1'), 'undetermined')

    def test_undetermined_confidence_always_capped(self):
        gl.nondet.exec_prompt.return_value = result([source(finding='irrelevant', excerpt='')], 'undetermined', 99)
        self.c.review_tip('tip1')
        self.assertLessEqual(self.f.tip()['review']['confidence'], 40)

    def test_duplicate_source_findings_rejected(self):
        gl.nondet.exec_prompt.return_value = result([source(), source()])
        with self.assertRaisesRegex(ValueError, 'Duplicate source'):
            self.c.review_tip('tip1')

    def test_empty_and_unavailable_challenges_do_not_reopen(self):
        self.c.review_tip('tip1')
        with self.assertRaisesRegex(ValueError, 'URL is required'):
            self.c.challenge_tip('tip1', '', 'A differently worded unsupported objection')
        gl.nondet.web.render.side_effect = RuntimeError('unavailable')
        with self.assertRaises(RuntimeError):
            self.c.challenge_tip('tip1', '', 'A differently worded unsupported objection', 'https://www.cdc.gov/new')
        self.assertEqual(self.f.tip()['status'], 'evidence-consistent')
        self.assertEqual(self.f.tip()['challenges'], [])

    def test_irrelevant_challenge_rejected_by_admission(self):
        self.c.review_tip('tip1')
        # Call actual contract method to avoid the fixture's mocked successful admission helper.
        gl.nondet.exec_prompt.return_value = json.dumps(dict(relevant=False, contradictory=False, excerpt=QUOTE, justification=WHY))
        with self.assertRaisesRegex(ValueError, 'relevant, verifiable'):
            module.YourHealthTip.challenge_tip(self.c, 'tip1', '', 'Unrelated evidence should be rejected', 'https://www.cdc.gov/new')
        self.assertEqual(self.f.tip()['challenges'], [])

    def test_new_legitimate_evidence_after_ten_challenges_and_history_preserved(self):
        self.c.review_tip('tip1')
        for i in range(17):
            url = f'https://www.cdc.gov/new-evidence-{i}'
            self.c.challenge_tip('tip1', '', f'New material contradictory finding number {i}', url)
            gl.nondet.exec_prompt.return_value = result([source(url)])
            self.c.review_tip('tip1')
        tip = self.f.tip()
        self.assertEqual(tip['challenge_count'], 17)
        self.assertEqual(tip['review_count'], 18)
        self.assertEqual(len(tip['reviews']), 10)
        old = json.loads(self.c.get_history_paged('tip1', 'challenges', 0, 2))
        self.assertEqual(len(old), 2)
        self.assertEqual(old[0]['status'], 'resolved')
        self.assertEqual(len(json.loads(self.c.get_history_paged('tip1', 'reviews', 0, 25))), 18)

    def test_tracking_query_cannot_bypass_duplicate_challenge(self):
        self.c.review_tip('tip1')
        url = 'https://www.cdc.gov/new-evidence'
        self.c.challenge_tip('tip1', '', 'New material evidence challenges this claim', url)
        gl.nondet.exec_prompt.return_value = result([source(url)])
        self.c.review_tip('tip1')
        with self.assertRaisesRegex(ValueError, 'already adjudicated'):
            self.c.challenge_tip('tip1', '', 'A different objection using the same evidence', url + '/?utm_source=spam#new')

    def test_unretrievable_challenger_stays_active(self):
        self.c.review_tip('tip1')
        url = 'https://www.cdc.gov/new-evidence'
        self.c.challenge_tip('tip1', '', 'New material evidence challenges this claim', url)
        before = self.f.tip()
        gl.nondet.web.render.side_effect = RuntimeError('offline')
        with self.assertRaisesRegex(ValueError, 'challenge remains active'):
            self.c.review_tip('tip1')
        self.assertEqual(self.f.tip(), before)

    def test_omitted_challenger_findings_cannot_resolve(self):
        self.c.review_tip('tip1')
        self.c.challenge_tip('tip1', '', 'New material evidence challenges this claim', 'https://www.cdc.gov/new-evidence')
        before = self.f.tip()
        with self.assertRaisesRegex(ValueError, 'explicitly justify'):
            self.c.review_tip('tip1')
        self.assertEqual(self.f.tip(), before)

    def test_claim_specific_pubmed_discovery_retrieves_articles_not_search_snippets(self):
        article = 'https://pubmed.ncbi.nlm.nih.gov/12345678/'
        gl.nondet.web.get.side_effect = None
        gl.nondet.web.get.return_value = types.SimpleNamespace(status=200, body=b'<a href="/12345678/">Study</a>')
        gl.nondet.exec_prompt.return_value = result([source(article)])
        self.c.review_tip('tip1')
        self.assertIn('?term=', gl.nondet.web.get.call_args_list[0].args[0])
        self.assertEqual(gl.nondet.web.render.call_args_list[0].args[0], article)
        self.assertEqual(self.f.tip()['review']['sources'][0]['url'], article)

    def test_history_page_bounds_and_invalid_kind(self):
        with self.assertRaises(ValueError):
            self.c.get_history_paged('tip1', 'private')
        self.assertEqual(json.loads(self.c.get_history_paged('tip1', 'reports', 100, 10)), [])

if __name__ == '__main__':
    unittest.main()
