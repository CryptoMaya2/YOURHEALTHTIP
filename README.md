# YourHealthTip

Community health-claim evaluations using GenLayer evidence retrieval and validator consensus. React, TypeScript and Vite frontend; Python Intelligent Contract.

## Verification status

The corrected v3 contract is finalized on StudioNet at `0x2BEF9c69823E50b3a36391a9bb006445c622d163`, with matching deployed/source SHA-256 fingerprints. The exact reviewed contract source commit is `d069948e645b5391c08bd8d2a761e88d010904cc`. The historical v2 contract address is not a deployment of this source. `deployment.json` records the finalized deployment and verified fingerprint; no browser-wallet workflow is claimed complete without receipts. See [the release verification procedure](docs/RELEASE_VERIFICATION.md).

## Run and test

Requires Node 24 and Python 3.12 or newer.

```sh
npm ci
npm test
npm run lint
npm run build
cp .env.example .env.local
npm run dev
```

Set `VITE_USE_GENLAYER_CONTRACT=false` only for an explicitly labelled local demonstration. For live operation, deploy v3, verify its source, and configure the contract address and SHA-256 from the verified manifest. Missing configuration, old versions and source mismatches fail visibly rather than switching to simulated data.

## Corrections

- Re-reviews include all original sources and the active challenger reference. Requests exceeding six unique references are rejected. Unavailable or omitted challenger findings cannot resolve a challenge.
- Review sources preserve a finding, a verified quotation and a source-specific justification. Independent validators retrieve evidence, recompute evaluations and compare each source's interpretation and require overlapping material citation passages. Mixed material evidence and missing required evidence force `undetermined`; confidence is capped at 40 for that outcome.
- Claim-specific PubMed article discovery is attempted when no explicit reference is provided. Article pages, not search snippets, are evaluated. If discovery fails, category references are a fallback requiring the same explicit relevance checks. No keyword or citation system guarantees clinical correctness.
- Reports preserve sender, reason and timestamp. A permanent wallet index prevents repeats after the recent-report summary is trimmed. Three distinct wallets trigger a visible safety notice; this is a community signal, not proof of misinformation or independent human identities. Reviews remain accessible.
- Challenges require a new reference and validator-backed admission of relevant contradictory material or a material limitation of the previous review. Identical canonical URLs and reasons are rejected. There is no lifetime cap that can permanently exclude legitimate new evidence.
- Complete reviews, challenges and reports are stored separately and retrieved through bounded history pages. Tip records retain recent summaries; `get_history_paged` retrieves older records. Storage grows with accepted activity, while each read and write is bounded.
- The feed has a load-more control, and `?tip=<id>` links retrieve a selected record directly.
- Transactions succeed in the interface only with a `FINALIZED` receipt and successful execution (`FINISHED_WITH_RETURN`, or Studio’s explicit successful leader return with no GenVM error). Pending hashes are retained and rechecked rather than blindly resubmitted. Signature rejection, RPC failure, execution reverts, account changes and provider disconnects have explicit handling. Contract reads request `LATEST_FINAL` through the installed SDK.
- Frontend connection checks both contract version 3 and the SHA-256 of `getContractCode()` against configuration.

## Tests and limitations

`npm test` runs 36 contract unit/adversarial tests and 16 wallet/transaction tests. Contract tests execute the source with mocked GenVM storage, retrieval and model responses; wallet tests use a mocked provider. They do not establish GenVM deployment compatibility, actual validator consensus or browser-wallet end-to-end success. GitHub Actions repeats tests, lint and production build.

GitHub publication, hosted frontend configuration and ordinary browser-wallet recording remain required before resubmission. Historical deployment claims are retained in `deployments/v2-reported.json` as owner-reported history, not evidence for v3.
