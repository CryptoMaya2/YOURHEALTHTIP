"""Tests execute the actual contract source with mocked GenVM I/O; not a consensus/GenVM substitute."""
import importlib.util
import json
import sys
import types
import unittest
from unittest.mock import Mock
from pathlib import Path

class Return:
    def __init__(self, calldata): self.calldata = calldata

def run_nondet(leader, validator):
    answer = leader()
    if not validator(Return(answer)):
        raise ValueError('Validators disagreed')
    return answer

gl = types.SimpleNamespace(Contract=object, public=types.SimpleNamespace(write=lambda f:f,view=lambda f:f),
    message=types.SimpleNamespace(sender_address='0x'+'1'*40),message_raw={'datetime':'2026-10-16T10:00:00Z'},
    vm=types.SimpleNamespace(Return=Return,run_nondet_unsafe=run_nondet),
    nondet=types.SimpleNamespace(web=types.SimpleNamespace(render=Mock()),exec_prompt=Mock()))
stub=types.ModuleType('genlayer'); stub.gl=gl; stub.TreeMap=dict; stub.DynArray=list
spec=importlib.util.spec_from_file_location('actual_contract',Path(__file__).with_name('your_health_tip.py'))
module=importlib.util.module_from_spec(spec)
previous=sys.modules.get('genlayer');sys.modules['genlayer']=stub
spec.loader.exec_module(module)
if previous: sys.modules['genlayer']=previous
else: del sys.modules['genlayer']

class ContractTests(unittest.TestCase):
    def setUp(self):
        self.c=module.YourHealthTip();self.c.tips={};self.c.tip_ids=[]
        gl.nondet.web.render.reset_mock(side_effect=True,return_value=True)
        gl.nondet.web.render.return_value='Relevant public health evidence. '*30
        gl.nondet.exec_prompt.reset_mock(side_effect=True,return_value=True)
        gl.nondet.exec_prompt.return_value=json.dumps(dict(status='evidence-consistent',confidence=80,reasoning='The source supports this claim.'))
    def submit(self, **kwargs):
        args=dict(tip_id='tip1',title='Example health tip',content='General healthy living claim for evaluation.',category='general',submitter='Spoofed owner')
        args.update(kwargs);return self.c.submit_tip(**args)
    def tip(self):return json.loads(self.c.get_tip('tip1'))
    def test_owner_comes_from_sender(self):
        self.submit();self.assertEqual(self.tip()['submitter'],str(gl.message.sender_address))
        self.assertEqual(self.tip()['submitted_at'],gl.message_raw['datetime'])
    def test_duplicate_rejected(self):
        self.submit()
        with self.assertRaises(ValueError):self.submit()
    def test_sources_restrict_private_and_spoofed_hosts(self):
        for url in ['http://www.who.int/a','https://127.0.0.1/a','https://who.int.evil.com','https://who.int@evil.com','https://who.int:443/a','https://who.int\\evil.com']:
            with self.subTest(url=url), self.assertRaises(ValueError):self.submit(sources_json=json.dumps([url]))
    def test_review_fetches_independently(self):
        self.submit();self.c.review_tip('tip1');self.assertEqual(gl.nondet.web.render.call_count,2)
        self.assertEqual(len(self.tip()['reviews']),1)
        self.assertTrue(self.tip()['review']['sources'][0]['url'].startswith('https://www.who.int/'))
    def test_missing_evidence_is_undetermined(self):
        self.submit();gl.nondet.web.render.side_effect=RuntimeError('offline')
        self.assertEqual(self.c.review_tip('tip1'),'undetermined');gl.nondet.exec_prompt.assert_not_called()
    def test_disagreement_does_not_write_review(self):
        self.submit();gl.nondet.exec_prompt.side_effect=[json.dumps(dict(status=s,confidence=80,reasoning='Result')) for s in ['evidence-consistent','evidence-inconsistent']]
        with self.assertRaisesRegex(ValueError,'disagreed'):self.c.review_tip('tip1')
        self.assertEqual(self.tip()['status'],'pending');self.assertEqual(self.tip()['reviews'],[])
    def test_challenge_lifecycle_preserves_original_review(self):
        self.submit();self.c.review_tip('tip1');original=self.tip()['review']
        self.c.challenge_tip('tip1','Spoof','Contradicting evidence should be considered.','https://www.cdc.gov/test')
        self.assertEqual(self.tip()['review'],original)
        self.assertEqual(self.tip()['status'],'under-challenge')
        with self.assertRaises(ValueError): self.c.challenge_tip('tip1','','Another duplicate challenge reason.')
        self.c.review_tip('tip1');self.assertEqual(len(self.tip()['reviews']),2)
        self.assertEqual(self.tip()['challenges'][0]['status'],'resolved')
        self.assertEqual(self.tip()['challenges'][0]['challenger'],str(gl.message.sender_address))
    def test_pending_challenge_rejected(self):
        self.submit()
        with self.assertRaises(ValueError):self.c.challenge_tip('tip1','','This should not be allowed yet.')
    def test_review_cannot_overwrite_resolved_tip(self):
        self.submit();self.c.review_tip('tip1')
        with self.assertRaises(ValueError):self.c.review_tip('tip1')
    def test_malformed_model_output_does_not_save(self):
        self.submit();gl.nondet.exec_prompt.return_value='{"status":"evidence-consistent","confidence":999,"reasoning":"test"}'
        with self.assertRaises(ValueError):self.c.review_tip('tip1')
        self.assertEqual(self.tip()['status'],'pending')
    def test_report_records_count(self):
        self.submit();self.c.flag_tip('tip1','Potential harmful claim');self.assertEqual(self.tip()['flag_count'],1)

if __name__=='__main__':unittest.main()
