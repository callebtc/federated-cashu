# 33.05 · Components by party

Variation 5 of slide 33 (Federation components) · lens: Perspective: by party · deck `fcv-f-client-intent` page 42 · 3 steps · script 132 words, about 55 s

## Script

What each party does, with the code on the branch.

**[1]** The wallet, in cdk/src/wallet/federation.rs, sends each request to every member's public URL, checks each share against that member's public share K i, interpolates t shares with aggregate_blind_signature_shares, unblinds, and checks C against K with a pairing. Signing each v3 input's digest is specified in NUT-10, not implemented.

**[2]** Each member, in cdk-axum's federation module, runs admission checks, submits an envelope, applies operations in consensus order, and signs accepted outputs with its share k i, in blind_sign_share. It takes part in the DKG and holds a FROST share.

**[3]** The roster as a whole provides AlephBFT order and catch-up for lagging members, the thresholds t, c and q, and the FROST treasury, BDK on-chain and Bark for Lightning. A membership change is a new federation.

## Background

- **Public URL versus private plane**: wallets reach each member's `public_mint_url` with ordinary Cashu requests; members talk to each other on the private plane under `/federation/v1`.
- **Interpolation**: Lagrange interpolation at x = 0 turns t shares into the one signature under K.
- **blind_sign_share**: the member-side function that multiplies the blinded message by the member's share k_i.
- **Catch-up**: a lagging member verifies a quorum-signed checkpoint, fetches the later operations in bounded pages from peers, replays them deterministically, and serves signing routes only once its state matches.
- **t, c, q**: signing threshold, consensus threshold, payment observation quorum.

## Speaker note

- The slide's footnote says FROST crates are on bls-federation-bdk-frost. On the current bls-federation branch `crates/cdk-frost`, `cdk-bdk`, `cdk-bark`, `cdk-frost-bark` and `cdk-federation-bark` all exist; bls-federation-bdk-frost is an older branch (July) without the Bark crates. Say "on the branch" without naming bdk-frost.
- "Journal catch-up": recovery now rests on quorum-signed checkpoints (`docs/federated-cashu-checkpoint-architecture.md`), not the range-based catch-up certificates still described in `FEDERATION_NOTES.md`.
- The wallet's v3 input signing is specified in cashubtc/nuts#443, not implemented.
