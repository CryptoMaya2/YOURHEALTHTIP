"""Tests execute the actual contract source with mocked GenVM I/O; not a consensus/GenVM substitute."""
import importlib.util
import json
import sys
import types
import unittest
from unittest.mock import Mock
from pathlib import Path

class Return:
    def __init__(self, calldata):
        self.calldata = calldata

def run_nondet(leader, validator):
    answer = leader()
    if not validator(Return(answer)):
        raise ValueError('Validators disagreed')
    return answer

gl = types.SimpleNamespace(
    Contract=object,
    public=types.SimpleNamespace(write=lambda f: f, view=lambda f: f),
    message=types.SimpleNamespace(sender_address='0x' + '1' * 40),
    message_raw={'datetime': '2026-10-16T10:00:00Z'},
    vm=types.SimpleNamespace(Return=Return, run_nondet_unsafe=run_nondet),
    nondet=types.SimpleNamespace(
        web=types.SimpleNamespace(render=Mock(), get=Mock(side_effect=RuntimeError("HTTP unavailable"))),
        exec_prompt=Mock()
    )
)
stub = types.ModuleType('genlayer')
stub.gl = gl
stub.TreeMap = dict
stub.DynArray = list

spec = importlib.util.spec_from_file_location('actual_contract', Path(__file__).with_name('your_health_tip.py'))
module = importlib.util.module_from_spec(spec)
previous = sys.modules.get('genlayer')
sys.modules['genlayer'] = stub
spec.loader.exec_module(module)
if previous:
    sys.modules['genlayer'] = previous
else:
    del sys.modules['genlayer']


class ContractTests(unittest.TestCase):
    def setUp(self):
        self.c = module.YourHealthTip()
        self.c.tips = {}
        self.c.tip_ids = []
        self.c.reported_wallets = {}
        self.c.challenge_keys = {}
        self.c.history = {}
        original_challenge = self.c.challenge_tip
        def challenge(*args, **kwargs):
            old_side_effect = gl.nondet.exec_prompt.side_effect
            old_return = gl.nondet.exec_prompt.return_value
            def prompt(value):
                if value.startswith('Challenge admission:'):
                    return json.dumps(dict(relevant=True, contradictory=True,
                        excerpt='physical activity prevents disease and supports well-being.',
                        justification='This is new material contradictory evidence concerning this claim.'))
                return old_return
            gl.nondet.exec_prompt.side_effect = prompt
            try:
                return original_challenge(*args, **kwargs)
            finally:
                gl.nondet.exec_prompt.side_effect = old_side_effect
                gl.nondet.exec_prompt.return_value = old_return
        self.c.challenge_tip = challenge
        gl.message.sender_address = '0x' + '1' * 40
        gl.nondet.web.render.reset_mock(side_effect=True, return_value=True)
        gl.nondet.web.get.reset_mock(side_effect=True, return_value=True)
        gl.nondet.web.get.side_effect = RuntimeError('HTTP unavailable')
        self.default_text = 'Relevant public health evidence states that physical activity prevents disease and supports well-being. ' * 10
        gl.nondet.web.render.return_value = self.default_text
        gl.nondet.exec_prompt.reset_mock(side_effect=True, return_value=True)
        gl.nondet.exec_prompt.return_value = json.dumps({
            'status': 'evidence-consistent',
            'confidence': 80,
            'reasoning': 'The source supports this claim.',
            'sources': [{
                'url': 'https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases',
                'finding': 'supports',
                'justification': 'This passage addresses the specific assertion in the health claim.', 'excerpt': 'physical activity prevents disease and supports well-being.'
            }]
        })

    def submit(self, **kwargs):
        args = dict(
            tip_id='tip1',
            title='Example health tip',
            content='General healthy living claim for evaluation.',
            category='general',
            submitter='Spoofed owner'
        )
        args.update(kwargs)
        return self.c.submit_tip(**args)

    def tip(self, tip_id='tip1'):
        return json.loads(self.c.get_tip(tip_id))

    def test_owner_comes_from_sender(self):
        self.submit()
        self.assertEqual(self.tip()['submitter'], str(gl.message.sender_address))
        self.assertEqual(self.tip()['submitted_at'], gl.message_raw['datetime'])

    def test_duplicate_rejected(self):
        self.submit()
        with self.assertRaises(ValueError):
            self.submit()

    def test_sources_restrict_private_and_spoofed_hosts(self):
        for url in ['http://www.who.int/a', 'https://127.0.0.1/a', 'https://who.int.evil.com',
                    'https://who.int@evil.com', 'https://who.int:443/a', 'https://who.int\\evil.com']:
            with self.subTest(url=url), self.assertRaises(ValueError):
                self.submit(sources_json=json.dumps([url]))

    def test_review_fetches_independently(self):
        self.submit()
        self.c.review_tip('tip1')
        self.assertEqual(gl.nondet.web.render.call_count, 2)
        self.assertEqual(len(self.tip()['reviews']), 1)
        self.assertTrue(self.tip()['review']['sources'][0]['url'].startswith('https://www.who.int/'))

    def test_http_fallback_after_render_failure(self):
        self.submit()
        gl.nondet.web.render.side_effect = RuntimeError('renderer unavailable')
        gl.nondet.web.get.side_effect = None
        gl.nondet.web.get.return_value = types.SimpleNamespace(
            status=200,
            body=('<main>Public health evidence states that physical activity prevents disease and supports well-being. ' * 10 + '</main>').encode()
        )
        self.assertEqual(self.c.review_tip('tip1'), 'evidence-consistent')
        self.assertEqual(sum(1 for call in gl.nondet.web.get.call_args_list if '?term=' not in call.args[0]), 2)

    def test_missing_evidence_is_undetermined(self):
        self.submit()
        gl.nondet.web.render.side_effect = RuntimeError('offline')
        self.assertEqual(self.c.review_tip('tip1'), 'undetermined')
        gl.nondet.exec_prompt.assert_not_called()

    def test_disagreement_does_not_write_review(self):
        self.submit()
        gl.nondet.exec_prompt.side_effect = [
            json.dumps({'status': s, 'confidence': 80, 'reasoning': 'Result',
                        'sources': [{'url': 'https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases',
                                     'finding': 'supports' if s == 'evidence-consistent' else 'contradicts',
                                     'justification': 'This passage addresses the specific assertion in the health claim.', 'excerpt': 'physical activity prevents disease and supports well-being.'}]})
            for s in ['evidence-consistent', 'evidence-inconsistent']
        ]
        with self.assertRaisesRegex(ValueError, 'disagreed'):
            self.c.review_tip('tip1')
        self.assertEqual(self.tip()['status'], 'pending')
        self.assertEqual(self.tip()['reviews'], [])

    def test_challenge_lifecycle_preserves_original_review(self):
        self.submit()
        self.c.review_tip('tip1')
        original = self.tip()['review']

        gl.nondet.exec_prompt.return_value = json.dumps({
            'status': 'evidence-consistent',
            'confidence': 85,
            'reasoning': 'Re-evaluation confirmed.',
            'sources': [{
                'url': 'https://www.cdc.gov/sleep/about/index.html',
                'finding': 'supports',
                'justification': 'This passage addresses the specific assertion in the health claim.', 'excerpt': 'physical activity prevents disease and supports well-being.'
            }]
        })
        self.c.challenge_tip('tip1', 'Spoof', 'Contradicting evidence should be considered.', 'https://www.cdc.gov/sleep/about/index.html')
        self.assertEqual(self.tip()['review'], original)
        self.assertEqual(self.tip()['status'], 'under-challenge')

        with self.assertRaises(ValueError):
            self.c.challenge_tip('tip1', '', 'Another duplicate challenge reason.')

        self.c.review_tip('tip1')
        self.assertEqual(len(self.tip()['reviews']), 2)
        self.assertEqual(self.tip()['challenges'][0]['status'], 'resolved')
        self.assertEqual(self.tip()['challenges'][0]['challenger'], str(gl.message.sender_address))

    def test_pending_challenge_rejected(self):
        self.submit()
        with self.assertRaises(ValueError):
            self.c.challenge_tip('tip1', '', 'This should not be allowed yet.')

    def test_review_cannot_overwrite_resolved_tip(self):
        self.submit()
        self.c.review_tip('tip1')
        with self.assertRaises(ValueError):
            self.c.review_tip('tip1')

    def test_malformed_model_output_does_not_save(self):
        self.submit()
        gl.nondet.exec_prompt.return_value = '{"status":"evidence-consistent","confidence":999,"reasoning":"test"}'
        with self.assertRaises(ValueError):
            self.c.review_tip('tip1')
        self.assertEqual(self.tip()['status'], 'pending')

    # Requirement 1: Adversarial test for 5 original sources, challenger URL, and additional review URL
    def test_evidence_selection_adversarial_five_sources_and_challenger(self):
        five_sources = [
            f'https://www.cdc.gov/source{i}' for i in range(1, 6)
        ]
        self.submit(tip_id='tip_adv', sources_json=json.dumps(five_sources))
        
        # Initial review
        gl.nondet.exec_prompt.return_value = json.dumps({
            'status': 'evidence-consistent',
            'confidence': 75,
            'reasoning': 'All five sources reviewed.',
            'sources': [{'url': u, 'finding': 'supports', 'justification': 'This passage addresses the specific assertion in the health claim.', 'excerpt': 'physical activity prevents disease and supports well-being.'} for u in five_sources]
        })
        self.c.review_tip('tip_adv')
        
        # Active challenge with a distinct challenger reference
        challenger_url = 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet'
        gl.message.sender_address = '0x' + '2' * 40
        self.c.challenge_tip('tip_adv', 'Challenger', 'New contradictory nutritional evidence.', challenger_url)
        
        # Attempting to add another distinct primary_source_url exceeds the 6-source limit:
        # 5 original sources + 1 challenger url + 1 primary review url = 7 sources > 6!
        # The contract must explicitly reject this review request rather than dropping challenger evidence!
        distinct_review_url = 'https://www.who.int/news-room/fact-sheets/detail/physical-activity'
        with self.assertRaisesRegex(ValueError, 'Cannot accommodate additional review URL'):
            self.c.review_tip('tip_adv', primary_source_url=distinct_review_url)

        # In a valid re-review without extra overflow source, challenger evidence is guaranteed to be included
        gl.nondet.exec_prompt.return_value = json.dumps({
            'status': 'evidence-consistent',
            'confidence': 80,
            'reasoning': 'Re-reviewed with challenger reference included.',
            'sources': [{'url': u, 'finding': 'supports', 'justification': 'This passage addresses the specific assertion in the health claim.', 'excerpt': 'physical activity prevents disease and supports well-being.'} for u in five_sources + [challenger_url]]
        })
        self.c.review_tip('tip_adv')
        tip_data = self.tip('tip_adv')
        reviewed_urls = [s['url'] for s in tip_data['review']['sources']]
        self.assertIn(challenger_url, reviewed_urls, 'Accepted challenger evidence must be included in re-evaluation!')
        self.assertEqual(tip_data['challenge']['status'], 'resolved')

    # Requirement 2: Adversarial tests for validator equivalence and material citation verification
    def test_validator_rejects_hallucinated_excerpt_not_in_evidence(self):
        self.submit()
        # Leader provides an excerpt that does NOT exist in the retrieved page text
        hallucinated_output = json.dumps({
            'status': 'evidence-consistent',
            'confidence': 80,
            'reasoning': 'The source supports this claim.',
            'sources': [{
                'url': 'https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases',
                'finding': 'supports',
                'excerpt': 'FABRICATED PASSAGE THAT DOES NOT EXIST ANYWHERE IN RETRIEVED TEXT'
            }]
        })
        gl.nondet.exec_prompt.return_value = hallucinated_output
        # Because leader excerpt cannot be verified in the fetched text, evaluate() resets excerpt to ''
        # and downgrades status to undetermined because no verified excerpt exists
        result = self.c.review_tip('tip1')
        self.assertEqual(result, 'undetermined')
        self.assertEqual(self.tip()['review']['sources'][0]['excerpt'], '')

    def test_validator_disagreement_on_conflicting_material_findings(self):
        self.submit()
        # Leader claims evidence-consistent with valid supporting excerpt
        leader_output = json.dumps({
            'status': 'evidence-consistent',
            'confidence': 80,
            'reasoning': 'Found strong support.',
            'sources': [{
                'url': 'https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases',
                'finding': 'supports',
                'justification': 'This passage addresses the specific assertion in the health claim.', 'excerpt': 'physical activity prevents disease and supports well-being.'
            }]
        })
        # Independent validator finds contradiction
        validator_output = json.dumps({
            'status': 'evidence-consistent',  # Label maliciously matches!
            'confidence': 80,
            'reasoning': 'Found conflict.',
            'sources': [{
                'url': 'https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases',
                'finding': 'contradicts',  # Material finding contradicts leader!
                'justification': 'This passage addresses the specific assertion in the health claim.', 'excerpt': 'physical activity prevents disease and supports well-being.'
            }]
        })
        gl.nondet.exec_prompt.side_effect = [leader_output, validator_output]
        with self.assertRaisesRegex(ValueError, 'disagreed'):
            self.c.review_tip('tip1')

    # Requirement 3: Meaningful reporting, duplicate prevention, and safety response
    def test_reporting_preserves_details_and_prevents_duplicate(self):
        self.submit()
        gl.message.sender_address = '0x' + '3' * 40
        self.assertTrue(self.c.flag_tip('tip1', 'First report: harmful medical claim'))
        self.assertEqual(self.tip()['flag_count'], 1)
        self.assertEqual(len(self.tip()['reports']), 1)
        self.assertEqual(self.tip()['reports'][0]['reporter'], '0x' + '3' * 40)
        self.assertEqual(self.tip()['reports'][0]['reason'], 'First report: harmful medical claim')

        # Duplicate report by same wallet is rejected
        with self.assertRaisesRegex(ValueError, 'already reported'):
            self.c.flag_tip('tip1', 'Duplicate attempt by same reporter')

    def test_safety_alert_triggered_at_threshold_preserving_history(self):
        self.submit()
        # Initial review to establish history
        self.c.review_tip('tip1')
        original_review = self.tip()['review']

        # 3 distinct wallets report the tip
        for i in range(1, 4):
            gl.message.sender_address = f'0x{i:040x}'
            self.c.flag_tip('tip1', f'Safety concern from wallet {i}')

        tip_data = self.tip()
        self.assertEqual(tip_data['flag_count'], 3)
        self.assertTrue(tip_data['safety_alert'])
        self.assertIn('Community Safety Alert', tip_data['safety_notice'])
        # Historical review evidence remains completely preserved
        self.assertEqual(tip_data['review'], original_review)
        self.assertEqual(len(tip_data['reviews']), 1)

    # Requirement 4: Challenge lifecycle restrictions against identical / frivolous repeat challenges
    def test_frivolous_or_identical_repeat_challenge_rejected(self):
        self.submit()
        self.c.review_tip('tip1')
        
        challenge_url = 'https://www.cdc.gov/clean-hands/about/index.html'
        gl.message.sender_address = '0x' + '5' * 40
        self.c.challenge_tip('tip1', 'Challenger', 'This guidance is contradicted by CDC hygiene data.', challenge_url)
        
        # Resolve the challenge with re-review
        gl.nondet.exec_prompt.return_value = json.dumps({
            'status': 'evidence-consistent',
            'confidence': 85,
            'reasoning': 'Confirmed valid after review.',
            'sources': [{
                'url': challenge_url,
                'finding': 'supports',
                'justification': 'This passage addresses the specific assertion in the health claim.', 'excerpt': 'physical activity prevents disease and supports well-being.'
            }]
        })
        self.c.review_tip('tip1')
        
        # Attempt 1: Repeat challenge with identical evidence URL is rejected
        gl.message.sender_address = '0x' + '6' * 40
        with self.assertRaisesRegex(ValueError, 'already adjudicated|already evaluated'):
            self.c.challenge_tip('tip1', 'Challenger 2', 'Different reason text but same url.', challenge_url)

        # Attempt 2: Repeat challenge with identical reason is rejected
        new_url = 'https://www.cdc.gov/sleep/about/index.html'
        with self.assertRaisesRegex(ValueError, 'identical challenge reason'):
            self.c.challenge_tip('tip1', 'Challenger 3', 'This guidance is contradicted by CDC hygiene data.', new_url)

    # Requirement 5: Automatic evidence selection & relevance check
    def test_general_category_uses_ncd_overview(self):
        self.submit(tip_id='tip_gen', category='general')
        self.c.review_tip('tip_gen')
        tip_data = self.tip('tip_gen')
        source_url = tip_data['review']['sources'][0]['url']
        self.assertEqual(source_url, 'https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases')

    def test_unrelated_evidence_produces_undetermined(self):
        self.submit(tip_id='tip_unrelated', content='Specific claim about magnesium and migraine frequency.')
        # Prompt returned undetermined with low confidence because evidence is unrelated
        gl.nondet.exec_prompt.return_value = json.dumps({
            'status': 'undetermined',
            'confidence': 15,
            'reasoning': 'Retrieved text discusses general healthy living but lacks specific data regarding magnesium and migraines.',
            'sources': [{
                'url': 'https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases',
                'finding': 'irrelevant',
                'excerpt': ''
            }]
        })
        status = self.c.review_tip('tip_unrelated')
        self.assertEqual(status, 'undetermined')
        self.assertLessEqual(self.tip('tip_unrelated')['review']['confidence'], 40)

    # Requirement 7: Scalability of record retrieval (paginated reads)
    def test_paginated_reads(self):
        for i in range(5):
            self.c.submit_tip(tip_id=f'page_tip_{i}', title=f'Tip Title {i}', content='Long enough content for health claim verification.', category='sleep')
        
        all_ids = self.c.get_all_tip_ids()
        self.assertEqual(len(all_ids), 5)
        
        paged_ids = self.c.get_tip_ids_paged(offset=1, limit=3)
        self.assertEqual(paged_ids, all_ids[1:4])
        
        paged_tips_json = self.c.get_tips_paged(offset=2, limit=2)
        paged_tips = json.loads(paged_tips_json)
        self.assertEqual(len(paged_tips), 2)
        self.assertEqual(paged_tips[0]['id'], all_ids[2])
        self.assertEqual(paged_tips[1]['id'], all_ids[3])


if __name__ == '__main__':
    unittest.main()
