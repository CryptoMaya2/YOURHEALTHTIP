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

Python 3 is required for contract unit tests. Tests execute the actual Python source with mocked GenVM storage, web and LLM interfaces. They do not establish GenVM compatibility or live network consensus.

## Deploy v2 before enabling network mode

This branch changes contract storage and requires a **fresh deployment**. Existing v1 deployments are not compatible. The frontend checks `get_version() == '2'` before using a deployment.

1. Load `contracts/your_health_tip.py` into GenLayer Studio and deploy it with no constructor arguments.
2. Copy `.env.example` to `.env.local`. Set `VITE_GENLAYER_CONTRACT_ADDRESS` to the deployed v2 address and `VITE_USE_GENLAYER_CONTRACT=true`.
3. Restart Vite. Connect a browser wallet such as MetaMask. The SDK requests the Studio network before signing.
4. Submit a tip, open My Submissions, open the tip and select Review evidence. Submission and review are separate transactions.
5. Check the source URLs, reasoning and status. File a challenge and select Review challenge to re-evaluate. Earlier reviews and challenge records remain visible.
6. Test rejected signatures, account changes, missing sources, RPC failure, contract reverts and consensus disagreement before merging or enabling the public site.

The default flag is false: demo tips stay in browser storage. Explicitly selecting network mode never falls back to demo data. Never put private keys in `VITE_` variables; all frontend environment values are public.

## Evidence and history

The contract accepts up to five HTTPS URLs from exact WHO, CDC, NHS, PubMed and PMC hosts. Without supplied URLs it uses a category-specific public health page. It retrieves page text inside the nondeterministic evaluation. Each validator independently retrieves evidence and evaluates the claim; status, confidence tolerance and fetched URL lists must agree. Insufficient evidence is undetermined. Source names alone cannot establish support.

Ownership uses the actual transaction sender, not a typed contributor name. Dates come from transaction context. Challenges preserve the previous review; successful re-review resolves the active challenge and appends a review. Reports increment a public count; there is no automated moderation team or removal promise.

Submitted and accepted transaction hashes are cached in the submitting browser, scoped to chain and contract. They are not a globally indexed transaction history. Accepted transactions can still be appealed before finalization. A pending hash after timeout is not proof of success: inspect its receipt and refresh before resubmitting.

## Release status

Wallet connection, signed adapter calls, review controls, source retrieval, ownership filtering, report counts and review/challenge history are implemented. Live schema validation, fresh deployment, browser-wallet signing and end-to-end network consensus must still be verified. Keep `main` unchanged until those checks pass.
