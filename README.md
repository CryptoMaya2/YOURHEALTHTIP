# YourHealthTip

Community health tip frontend built with React, TypeScript and Vite, with a Python GenLayer intelligent contract in `contracts/your_health_tip.py`.

## Run locally

```sh
npm ci
npm run dev
```

Validation: `npm run build` and `npm run lint`.

## Service modes

Copy `.env.example` to `.env.local`. With `VITE_USE_GENLAYER_CONTRACT=false` (the default), submissions and sample tips use browser storage.

Set `VITE_USE_GENLAYER_CONTRACT=true` and `VITE_GENLAYER_CONTRACT_ADDRESS` to a deployed 20-byte hex contract address to select the GenLayer adapter. `VITE_GENLAYER_RPC_URL` optionally overrides the Studio network endpoint. Restart Vite after environment changes.

When GenLayer mode is selected, configuration and connection failures are displayed with a retry action. The app does not silently fall back to local demo data. Never put wallet private keys into `VITE_` variables: these are included in the public browser bundle.

## Integration status

The adapter reads tips and defines submission/challenge calls. This is **not yet a complete live integration**:

- A wallet account/provider must be connected before signing write transactions; the existing adapter does not configure one.
- The frontend still needs an action to call `review_tip`, wait for successful consensus, and refresh the result.
- The contract currently asks the model for public health evidence evaluation; it does not fetch source pages. Source names in an answer must not be presented as proof that those pages were retrieved.
- On-chain moderation reports are not implemented; the adapter rejects these instead of reporting a false success.
- Ownership filtering, actual transaction references, review/challenge history, and timestamps need implementation before release.

Deploy and test in GenLayer Studio before enabling this mode on a public deployment. The existing standalone simulation scripts do not prove GenVM execution or network consensus.
