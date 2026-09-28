# 36 · Federation components

Original slide, deck `fcv-f-client-intent` page 37 (main deck slide 36). Same text as `notes/36 - Federation components/notes.md`.

Summary · table, no steps · script 94 words, about 40 s

## Script

Chapter one in one table, with where each mechanism lives on the bls-federation branch. Verification without k: BLS12-381 pairings and keyset v3, in nut01/bls.rs. The split signing key: Shamir shares with wallet-side interpolation. Mix-and-match: operation IDs and AlephBFT before signing, in cdk-axum's federation module. Wallet fan-out, share checks and aggregation: wallet/federation.rs. Key generation: Pedersen DKG for BLS, FROST DKG for the treasury. Custody: FROST-signed BDK and Bark treasuries, in cdk-frost. Client intent: every v3 input signs the TLV transaction transcript, specified in NUT-10.

Status: not production-ready. The review is in cdk pull request 2048.

## Background

- **cdk-axum**: the HTTP server crate of CDK; the federation's private plane routes live there.
- **cdk-frost**: the crate with the FROST ceremony, nonce handling and signing.
