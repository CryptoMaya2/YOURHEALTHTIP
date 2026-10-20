# Release and browser-wallet verification

## Source and deployment identity

1. Commit the contract source. Deploy the exact bytes of `contracts/your_health_tip.py` as a fresh v3 contract in GenLayer Studio. Existing v2 storage is not migrated or erased.
2. Record the deploy transaction hash and its finalized, successful receipt. Do not substitute `ACCEPTED` for `FINALIZED`.
3. Run `npm run verify:deployment -- <address>` from that checkout. `GENLAYER_RPC_URL` optionally selects the read endpoint. The script checks committed source bytes, downloads deployed source with `getContractCode`, compares SHA-256 fingerprints, and reads version 3 from finalized state. It writes `deployments/v3-source-verification.json` only after successful verification.
4. Copy the exact contract source commit, address, deployment hash and fingerprint into `deployment.json`. Keep the frontend build commit separately; do not label an older deployment as the corrected source.
5. Set `VITE_USE_GENLAYER_CONTRACT=true`, `VITE_GENLAYER_CONTRACT_ADDRESS=<verified address>` and `VITE_GENLAYER_SOURCE_SHA256=<verified fingerprint>` on the frontend host, then rebuild. The frontend refuses an old version or different source.

## Ordinary browser-wallet demonstration

Use an ordinary injected wallet on StudioNet. Use a benign educational claim, not anyone's private medical information. Record the public application URL, browser/wallet versions, selected account, chain ID, source commit and frontend build commit.

For each mutation capture the wallet confirmation, transaction hash, complete receipt, `FINALIZED` status, `FINISHED_WITH_RETURN` execution (or Studio’s explicit `SUCCESS` leader receipt with `result.status=return` and no GenVM error) and finalized contract state. A timeout is an unknown result until its receipt is checked.

| Step | Required evidence |
| --- | --- |
| Connect wallet | Correct account and StudioNet chain; frontend identifies the verified contract |
| Submit tip | `submit_tip` hash, successful finalized receipt, `get_tip` owner matches signing account |
| Review evidence | `review_tip` hash and receipt; source URLs, quotations, justifications and verdict in finalized state |
| Challenge | `challenge_tip` hash and receipt; a new contradictory source, admission quotation/justification, active status |
| Re-review | `review_tip` hash and receipt; explicit challenger finding, resolved challenge and preserved prior review |
| Public retrieval | Open `?tip=<id>` in a second browser without connecting a wallet; retrieve review and history pages |
| Report | `flag_tip` hash and receipt; preserved reporter/reason/time and incremented count |
| Safety notice | Three distinct test wallets; notice appears and previous review evidence remains retrievable |

The details page displays transaction hashes. Successful receipts are cached in the originating browser under `yht:<chain>:<contract>:<tip>:transactions:<hash>:receipt`; this cache is convenience evidence, not an authoritative replacement for fetching the public receipt. The `Export verification record` control exports the current public tip and locally captured transaction receipts. Redact unrelated browser information from any recording.

## Failure cases

Record expected and observed results separately. Automated mocks are not proof that these occurred in the actual browser.

- Reject a wallet signature: no success message or new public record.
- Disconnect the provider or change account: cached signer invalidated, reconnect required.
- Change account while connecting the chain: stale writer rejected.
- Interrupt the RPC before sending: visible submission failure, no asserted transaction hash.
- Interrupt the RPC after sending or exceed receipt wait time: retained hash, unknown finalization, no success message. Retrying the same action rechecks its pending hash rather than sending again.
- Cause a contract revert using a duplicate report or repeated evidence URL: show failure; finalized outer status alone is insufficient.
- Observe `ACCEPTED` without `FINALIZED`: no conclusive completion.
- Load more than 25 tips; confirm later pages and direct links work. Browse more than ten history entries.
- Configure the historical v2 address or a wrong fingerprint: visible refusal, no silent local-demo fallback.

## Public safety response

Every report is an auditable allegation. Duplicate wallet reports are rejected, and three distinct wallets trigger a persistent caution banner while preserving all reviews. Distinct wallets are not proof of distinct people; coordinated reporting remains possible. A report does not itself change the medical verdict or delete a record. To request re-evaluation, submit genuinely new contradictory evidence through the challenge admission process. A successful re-review resolves that challenge and preserves both evaluations. Unsupported or unavailable challenges cannot displace a completed review. The safety notice remains visible as historical community context.

## Acceptance evidence package

Include the verified deployment manifest, exact contract source commit, frontend build commit/URL, complete browser recording, all action hashes and receipts, state snapshots after each step, failure-case results and passing CI link. Until these exist, keep `browserWalletWorkflow` marked `NOT_YET_VERIFIED`.

## Current live-validation status

The user authorized Studio source upload and testnet deployment. Studio schema validation passed. Deployment transaction `0x93e29b8a64024e4ca9d2ee3c5cfc174c97694cb677b38a64b8c12bfb22943b07` created candidate address `0x2BEF9c69823E50b3a36391a9bb006445c622d163`. Its receipt reached FINALIZED with a successful leader return; the deployed source fingerprint matches the committed source. The complete browser-wallet workflow remains unverified. GitHub publication encountered connector permissions and browser file-upload access limitations.
