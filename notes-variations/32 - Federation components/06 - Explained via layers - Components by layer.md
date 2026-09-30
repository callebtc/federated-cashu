# 32.06 · Components by layer

Variation 6 of slide 32 (Federation components) · lens: Explained via layers · deck `fcv-f-client-intent` page 43 · 5 steps · script 121 words, about 50 s

## Script

The components sorted into five layers, with the code or spec on the right.

**[1]** Protocol: keyset v3 on BLS12-381, the NUT-10 transaction transcript, and the v3 sections of NUT-03, 04, 05 and 29. The spec is nuts pull request 443, on top of the BLS keyset pull request 371.

**[2]** Cryptography: pairing verification, Shamir shares and interpolation, Pedersen DKG, and FROST producing BIP-340 signatures.

**[3]** Ordering, in cdk-axum's federation module: operation IDs, AlephBFT, catch-up and the private member plane.

**[4]** Wallet: fan-out, share checks, aggregation, and v3 input witnesses, which are specified but not implemented.

**[5]** Custody: federated BDK on-chain and federated Bark for Lightning, with t FROST signers. Two components change the protocol itself: keyset v3 for verification, and the transcript for client intent.

## Background

- **Pedersen DKG**: each member deals a Shamir sharing of its own random secret with public commitments; the sum of all dealings is the joint key, which no member learns.
- **FROST**: a two-round threshold Schnorr protocol whose output is an ordinary BIP-340 signature, valid for taproot spends.
- **Private plane**: member-to-member traffic under `/federation/v1`, separate from the wallet-facing Cashu API.
- **BDK and Bark**: an on-chain wallet library and an Ark-based Lightning wallet; the federation's versions sign only with FROST.
- **Why two protocol changes**: keyset v3 changes how signatures are verified (pairings instead of DLEQ proofs); the transcript changes what inputs must sign. Everything else is internal to the federation.

## Speaker note

- The custody row says `cdk-frost (bdk-frost branch)`; `crates/cdk-frost` and the BDK and Bark crates are on the current bls-federation branch.
- "Journal catch-up": recovery now uses quorum-signed checkpoints and suffix replay (`docs/federated-cashu-checkpoint-architecture.md`).
- The page's deck note says client intent is the only protocol change; the slide itself names two. Speak the slide.
- v3 input witnesses and the transcript are specified in cashubtc/nuts#443, not implemented.
