# YourHealthTip

Community health tips with a GenLayer intelligent contract that evaluates claims against retrieved public health evidence. React + TypeScript + Vite frontend; Python contract.

## Run and check

```sh
npm ci
npm run dev
npm run build
npm run lint
npm test
```

Python 3 is required for contract unit tests. The automated test suite contains **20 comprehensive unit and adversarial tests** executing the contract source against mocked GenVM storage, multi-validator consensus, web retrieval, and LLM equivalence interfaces.

## Verification & Architecture Enhancements

### 1. Evidence-Selection Logic (`review_tip`)
- **Guaranteed Challenger Inclusion**: Re-evaluations under active challenge strictly include the challenger's contradictory evidence URL.
- **Capacity Enforcement**: The contract accommodates up to 6 unique sources. If a tip already has 5 original sources and an active challenge, supplying an extra primary review URL would exceed capacity; the contract explicitly validates and rejects overflow requests with a clear `ValueError` instead of silently dropping the challenger's evidence.
- **Adversarial Test**: `test_evidence_selection_adversarial_five_sources_and_challenger` validates 5 original sources, an active challenger URL, and an overflow review URL.

### 2. Strengthened Validator Equivalence & Material Citation Grounding
- **Structured Findings**: Each source evaluated returns a structured finding (`supports`, `contradicts`, `insufficient`, or `irrelevant`) and a direct verbatim quotation excerpt from the retrieved text.
- **Verifiable Excerpt Grounding**: `evaluate()` verifies that cited excerpts are genuine substrings of the retrieved page text. Hallucinated quotes are scrubbed, and verdicts claiming consistency without verified supporting excerpts are automatically adjusted to `undetermined`.
- **Equivalence Beyond Labels**: Independent validators verify leader-cited excerpts against their independently fetched web text. If the leader fabricated excerpts, or if material findings conflict (e.g. leader claiming support while validator found contradiction), consensus fails.
- **Adversarial Tests**: `test_validator_rejects_hallucinated_excerpt_not_in_evidence` and `test_validator_disagreement_on_conflicting_material_findings`.

### 3. Public Reporting Mechanism (`flag_tip`) & Safety Response
- **Meaningful Report Preservation**: Every report preserves the submitter's wallet address (`gl.message.sender_address`), report reason (3–3000 chars), and timestamp.
- **Duplicate Protection**: Rejects repeat reports from the same wallet on the same tip.
- **Transparent Safety Notice**: When a tip receives 3 or more independent community reports, an on-chain `safety_alert` and `safety_notice` are activated and displayed prominently in the frontend.
- **Audit Preservation**: Historical consensus reviews, sources, and challenges are strictly preserved for auditability and never deleted.
- **Tests**: `test_reporting_preserves_details_and_prevents_duplicate` and `test_safety_alert_triggered_at_threshold_preserving_history`.

### 4. Challenge Lifecycle & State Bounding
- **Deduplication**: Rejects repeat challenges citing an already-adjudicated evidence URL, an identical reason, or a source already evaluated in the current review.
- **Bounded Storage**: Caps active/resolved challenge records and review history to prevent state bloat as usage increases.
- **Test**: `test_frivolous_or_identical_repeat_challenge_rejected`.

### 5. Automatic Evidence Selection & Topical Relevance
- **Broad Health Fallback**: Category `'general'` falls back to WHO Noncommunicable Diseases & Healthy Lifestyle Overview (`https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases`) rather than an unrelated physical-activity sheet.
- **Relevance Enforcement**: The adjudicator prompt enforces topical relevance. If sources discuss general health but do not address the specific assertion, findings are marked `irrelevant`/`insufficient` and produce an `undetermined` outcome.
- **Tests**: `test_general_category_uses_ncd_overview` and `test_unrelated_evidence_produces_undetermined`.

### 6. Scalability & Sharing Links
- **Paginated Reads**: Contract introduces `get_tips_paged(offset, limit)` and `get_tip_ids_paged(offset, limit)`, enabling single-call bulk retrieval and eliminating N+1 sequential RPC round-trips.
- **Tip-Specific Sharing Links**: Deep linking supported via `?tip=<id>` and `#/tip/<id>`. Selecting any tip updates browser URL history and supports "Copy Share Link" to share direct tip links across browsers.
- **Test**: `test_paginated_reads`.

### 7. Browser Wallet Robustness
- **Signature Declines**: User-rejected signature requests (MetaMask code 4001) are handled gracefully without application crash.
- **Disconnections & Account Switches**: Injected provider listeners automatically sync wallet state.
- **Pending & Timeout Protection**: Transactions awaiting consensus are tracked with explicit transaction hashes. The UI never represents an unfinalized or provisional transaction as completed.

## Deployment Details

- **StudioNet Contract**: `0x282EfF036702383110b4644f1f02b20062C631Bd` (Chain ID: 61999)
- **Reviewed Deployment Commit**: `56ef4070051e7201d9b57a0d27ef977a55a155e3`
- **Contract Source SHA-256**: `2fe34edacc80253669ff932f323ae3c1e8cfaf8ae8d11dc316eda648ab66a308`
- **Deployment Record**: `deployment.json`
- **Contract Tests**: 20 passing tests (`python -m unittest discover -s contracts -v`)
