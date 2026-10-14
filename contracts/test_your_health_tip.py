"""
Unit Test Suite for YourHealthTip GenLayer Intelligent Contract
Tests submission, duplicate IDs, input validations, review consensus simulation,
retrieval, and community challenges.
"""
import unittest
import json

# Standalone simulation classes mimicking GenLayer storage types for testing
class MockTreeMap(dict):
    pass

class MockDynArray(list):
    pass

# Import or define contract logic for testing
from your_health_tip import (
    YourHealthTip, 
    HealthTipData, 
    ReviewRecordData, 
    ChallengeRecordData
)

class TestYourHealthTipContract(unittest.TestCase):
    def setUp(self):
        # Instantiate fresh contract state
        self.contract = YourHealthTip()
        self.contract.tips = MockTreeMap()
        self.contract.tip_ids = MockDynArray()
        self.contract.total_tips = 0

    def test_submit_valid_tip(self):
        tip_id = self.contract.submit_tip(
            tip_id="tip-001",
            title="10-Minute Walk After Meals",
            content="Light walking after meals helps skeletal muscles absorb glucose and blunts spikes.",
            category="physical-activity",
            submitter="HealthTester",
            region="Global"
        )
        self.assertEqual(tip_id, "tip-001")
        self.assertEqual(self.contract.get_tip_count(), 1)
        self.assertIn("tip-001", self.contract.get_all_tip_ids())

        # Verify initial status is pending
        tip_json = json.loads(self.contract.get_tip("tip-001"))
        self.assertEqual(tip_json["status"], "pending")
        self.assertFalse(tip_json["has_review"])

    def test_duplicate_tip_id_raises_error(self):
        self.contract.submit_tip(
            tip_id="tip-002",
            title="20-Second Handwashing",
            content="Washing hands thoroughly with soap removes pathogens.",
            category="hygiene",
            submitter="Tester"
        )
        with self.assertRaises(ValueError) as ctx:
            self.contract.submit_tip(
                tip_id="tip-002",
                title="Duplicate Tip ID Attempt",
                content="This should fail because ID tip-002 already exists.",
                category="hygiene",
                submitter="Tester"
            )
        self.assertIn("already exists", str(ctx.exception))

    def test_invalid_category_raises_error(self):
        with self.assertRaises(ValueError) as ctx:
            self.contract.submit_tip(
                tip_id="tip-003",
                title="Invalid Category Tip",
                content="This tip has an invalid category not recognized by guidelines.",
                category="cryptocurrency-diet",
                submitter="Tester"
            )
        self.assertIn("Invalid category", str(ctx.exception))

    def test_empty_or_short_fields_raise_error(self):
        with self.assertRaises(ValueError):
            self.contract.submit_tip("", "Valid Title Here", "Valid content long enough to pass.", "nutrition", "Tester")

        with self.assertRaises(ValueError):
            self.contract.submit_tip("tip-004", "Tiny", "Valid content long enough to pass.", "nutrition", "Tester")

        with self.assertRaises(ValueError):
            self.contract.submit_tip("tip-005", "Valid Title", "Too short", "nutrition", "Tester")

    def test_challenge_unreviewed_tip_fails(self):
        self.contract.submit_tip(
            tip_id="tip-006",
            title="Consistent Sleep Schedules",
            content="Going to bed and waking up at consistent times anchors circadian rhythm.",
            category="sleep",
            submitter="Tester"
        )
        with self.assertRaises(ValueError) as ctx:
            self.contract.challenge_tip(
                tip_id="tip-006",
                challenger="Challenger",
                reason="This should fail because it has not been reviewed yet."
            )
        self.assertIn("still pending review", str(ctx.exception))

    def test_challenge_reviewed_tip_succeeds(self):
        # Setup tip and directly simulate finalized review
        self.contract.submit_tip(
            tip_id="tip-007",
            title="High Water Drinking Thermogenesis",
            content="Drinking 5 liters of ice water burns 1000 calories guaranteed.",
            category="nutrition",
            submitter="Tester"
        )
        
        # Simulate completed review
        target = self.contract.tips["tip-007"]
        target.has_review = True
        target.status = "evidence-consistent"
        target.review = ReviewRecordData(
            status="evidence-consistent",
            confidence=85,
            reasoning="Initial review concluded consistency.",
            sources_consulted="General Guidelines",
            reviewed_at="Timestamp",
            evaluator="GenLayer Validator"
        )
        self.contract.tips["tip-007"] = target

        # Challenge the reviewed tip
        challenge_status = self.contract.challenge_tip(
            tip_id="tip-007",
            challenger="Physiologist Bob",
            reason="Water warming burns less than 35 calories per liter; 1000 calories is physiological impossibility.",
            evidence_url="https://academic.oup.com/jcem/article/88/12/6015/2661518"
        )
        self.assertEqual(challenge_status, "under-challenge")

        # Verify state
        tip_json = json.loads(self.contract.get_tip("tip-007"))
        self.assertEqual(tip_json["status"], "under-challenge")
        self.assertTrue(tip_json["has_challenge"])
        self.assertEqual(tip_json["challenge"]["challenger"], "Physiologist Bob")
        self.assertIn("physiological impossibility", tip_json["challenge"]["reason"])

if __name__ == "__main__":
    unittest.main()
