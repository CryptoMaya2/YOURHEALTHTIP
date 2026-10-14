/**
 * Behavioral & Structural Test Suite for YourHealthTip Intelligent Contract
 * Simulates GenLayer GenVM storage and execution semantics to validate all contract rules.
 */

interface ReviewRecord {
  status: 'pending' | 'evidence-consistent' | 'evidence-inconsistent' | 'under-challenge' | 'undetermined';
  confidence: number;
  reasoning: string;
  sources_consulted: string;
  reviewed_at: string;
  evaluator: string;
}

interface ChallengeRecord {
  challenger: string;
  reason: string;
  evidence_url: string;
  created_at: string;
  status: 'none' | 'active' | 'resolved';
}

interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string;
  submitter: string;
  region: string;
  submitted_at: string;
  status: string;
  has_review: boolean;
  review: ReviewRecord;
  has_challenge: boolean;
  challenge: ChallengeRecord;
}

class SimulatedContract {
  public tips: Map<string, HealthTip> = new Map();
  public tip_ids: string[] = [];
  public total_tips: number = 0;

  submit_tip(tip_id: string, title: string, content: string, category: string, submitter: string, region: string = 'Global'): string {
    const clean_id = tip_id.trim();
    if (!clean_id) throw new Error("Tip ID cannot be empty.");
    if (this.tips.has(clean_id)) throw new Error(`Tip ID '${clean_id}' already exists in registry.`);
    if (!title || title.trim().length < 5) throw new Error("Tip title must be at least 5 characters.");
    if (!content || content.trim().length < 20) throw new Error("Tip content must be at least 20 characters.");

    const valid_categories = new Set(["nutrition", "sleep", "physical-activity", "mental-wellbeing", "hygiene", "general"]);
    const clean_cat = category.trim().toLowerCase();
    if (!valid_categories.has(clean_cat)) {
      throw new Error(`Invalid category '${category}'.`);
    }

    const default_review: ReviewRecord = {
      status: 'pending',
      confidence: 0,
      reasoning: "Queued for GenLayer validator multi-source evidence evaluation.",
      sources_consulted: "",
      reviewed_at: "",
      evaluator: "Awaiting Consensus"
    };

    const default_challenge: ChallengeRecord = {
      challenger: "",
      reason: "",
      evidence_url: "",
      created_at: "",
      status: 'none'
    };

    const new_tip: HealthTip = {
      id: clean_id,
      title: title.trim(),
      content: content.trim(),
      category: clean_cat,
      submitter: submitter.trim() || "Anonymous",
      region: region.trim() || "Global",
      submitted_at: "Recorded On-Chain",
      status: "pending",
      has_review: false,
      review: default_review,
      has_challenge: false,
      challenge: default_challenge
    };

    this.tips.set(clean_id, new_tip);
    this.tip_ids.push(clean_id);
    this.total_tips += 1;
    return clean_id;
  }

  record_simulated_review(tip_id: string, status: ReviewRecord['status'], confidence: number, reasoning: string, sources: string): string {
    const clean_id = tip_id.trim();
    const tip = this.tips.get(clean_id);
    if (!tip) throw new Error(`Tip ID '${clean_id}' not found.`);

    tip.has_review = true;
    tip.status = status;
    tip.review = {
      status,
      confidence,
      reasoning,
      sources_consulted: sources,
      reviewed_at: "Finalized On-Chain",
      evaluator: "GenLayer Intelligent Contract (Validator Consensus)"
    };
    return status;
  }

  challenge_tip(tip_id: string, challenger: string, reason: string, evidence_url: string = ""): string {
    const clean_id = tip_id.trim();
    const tip = this.tips.get(clean_id);
    if (!tip) throw new Error(`Tip ID '${clean_id}' not found.`);
    if (!tip.has_review) throw new Error(`Tip '${clean_id}' is still pending review and cannot be challenged.`);
    if (!reason || reason.trim().length < 15) throw new Error("Challenge rationale must be at least 15 characters.");

    tip.has_challenge = true;
    tip.status = "under-challenge";
    tip.review.status = "under-challenge";
    tip.challenge = {
      challenger: challenger.trim() || "Community Challenger",
      reason: reason.trim(),
      evidence_url: evidence_url.trim(),
      created_at: "Recorded On-Chain",
      status: 'active'
    };
    return "under-challenge";
  }

  get_tip(tip_id: string): string {
    const clean_id = tip_id.trim();
    const tip = this.tips.get(clean_id);
    if (!tip) throw new Error(`Tip ID '${clean_id}' not found.`);
    return JSON.stringify(tip);
  }

  get_review_record(tip_id: string): string {
    const clean_id = tip_id.trim();
    const tip = this.tips.get(clean_id);
    if (!tip) throw new Error(`Tip ID '${clean_id}' not found.`);
    if (!tip.has_review) return JSON.stringify({ status: "pending", has_review: false });
    return JSON.stringify({ ...tip.review, has_review: true });
  }
}

// Execute Test Suite
function runTests() {
  console.log("=== GenLayer Intelligent Contract Validation Suite ===\n");
  const contract = new SimulatedContract();
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // Test 1: Submit valid tip
  try {
    const id = contract.submit_tip(
      "tip-001",
      "Morning Natural Light Exposure",
      "Outdoor daylight within 60 minutes of waking anchors circadian rhythms.",
      "sleep",
      "Dr. Elena",
      "Global"
    );
    assert(id === "tip-001" && contract.total_tips === 1, "1. Submit valid tip");
  } catch (e: any) {
    assert(false, `1. Submit valid tip failed: ${e.message}`);
  }

  // Test 2: Duplicate ID rejection
  try {
    contract.submit_tip(
      "tip-001",
      "Duplicate Tip",
      "This should fail duplicate check.",
      "sleep",
      "Hacker"
    );
    assert(false, "2. Reject duplicate tip ID");
  } catch (e: any) {
    assert(e.message.includes("already exists"), "2. Reject duplicate tip ID");
  }

  // Test 3: Reject invalid categories
  try {
    contract.submit_tip("tip-002", "Valid Title Here", "Valid content long enough to pass.", "crypto-diet", "User");
    assert(false, "3. Reject invalid category");
  } catch (e: any) {
    assert(e.message.includes("Invalid category"), "3. Reject invalid category");
  }

  // Test 4: Input length validation
  try {
    contract.submit_tip("tip-003", "Tiny", "Short", "nutrition", "User");
    assert(false, "4. Reject short inputs");
  } catch (e: any) {
    assert(e.message.includes("must be at least"), "4. Reject short inputs");
  }

  // Test 5: Retrieval before review
  try {
    const tipData = JSON.parse(contract.get_tip("tip-001"));
    const reviewData = JSON.parse(contract.get_review_record("tip-001"));
    assert(tipData.status === "pending" && reviewData.has_review === false, "5. Retrieval in pending state");
  } catch (e: any) {
    assert(false, `5. Retrieval failed: ${e.message}`);
  }

  // Test 6: Challenge unreviewed tip rejected
  try {
    contract.challenge_tip("tip-001", "Challenger", "Should fail because pending.");
    assert(false, "6. Reject challenge on unreviewed tip");
  } catch (e: any) {
    assert(e.message.includes("still pending review"), "6. Reject challenge on unreviewed tip");
  }

  // Test 7: Review consensus simulation
  try {
    contract.record_simulated_review(
      "tip-001",
      "evidence-consistent",
      92,
      "Peer-reviewed sleep medicine consensus confirms melanopsin cell activation.",
      "NCBI (PMC6751071), CDC Healthy Sleep Practices"
    );
    const review = JSON.parse(contract.get_review_record("tip-001"));
    assert(review.status === "evidence-consistent" && review.confidence === 92, "7. Record review consensus");
  } catch (e: any) {
    assert(false, `7. Review record failed: ${e.message}`);
  }

  // Test 8: Challenge reviewed tip
  try {
    contract.challenge_tip(
      "tip-001",
      "Dr. Alex K.",
      "Light intensity lux levels may vary drastically depending on seasonal high latitudes.",
      "https://ncbi.nlm.nih.gov/pmc/articles/example"
    );
    const updatedTip = JSON.parse(contract.get_tip("tip-001"));
    assert(
      updatedTip.status === "under-challenge" &&
      updatedTip.has_challenge === true &&
      updatedTip.challenge.challenger === "Dr. Alex K.",
      "8. Challenge transition to 'under-challenge'"
    );
  } catch (e: any) {
    assert(false, `8. Challenge failed: ${e.message}`);
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runTests();
