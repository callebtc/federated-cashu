# 13.06 · Verifying a swap with eight inputs

Variation 6 of slide 13 (Pairing check, expanded) · lens: Framing: cost · deck `fcv-a-bls` page 32 · 4 steps · script 120 words, about 50 s

## Script

**[1]** A swap with eight inputs: amounts 1, 1, 2, 2, 4, 8, 8 and 16. Five distinct amounts, so five keys.

**[2]** Eight separate checks with verify_pairing: two pairings each, so 16 Miller loops and 16 final exponentiations.

**[3]** One batch with batch_verify_pairing: one Miller loop for the signature sum with G₂, and one per key, K₁ to K₁₆. Six Miller loops, one final exponentiation. The batch adds 16 scalar multiplications in G₁ for the weights; the eight hash_to_curve_G1 calls are needed either way.

**[4]** Federation members batch from eight proofs up, FEDERATION_BLS_PROOF_BATCH_MIN, and check smaller requests one by one. On the wire each v3 proof carries a 48-byte C, against 33 bytes on secp256k1. Each 96-byte K is fetched once per keyset.

## Background

- **Miller loop**: the first stage of a pairing computation, one per pair of points.
- **Final exponentiation**: the second stage, raising the Miller loop result to a fixed large power. It is shared when Miller loop results are multiplied first.
- **Why six Miller loops**: the batch equation has one term for the weighted signature sum against G₂ and one term per distinct key, here K₁, K₂, K₄, K₈, K₁₆.
- **Scalar multiplications**: each proof contributes wᵢ·Cᵢ and wᵢ·Yᵢ, two multiplications per proof, sixteen for eight proofs.
- **`FEDERATION_BLS_PROOF_BATCH_MIN`**: a constant, 8, in `crates/cdk/src/mint/federation/configuration_and_admission.rs`; `verify_proofs` checks fewer proofs one by one.

## Speaker note

- The counts are operation counts derived from the code (`pairing()` is one Miller loop plus one final exponentiation; the batch has one term plus one per distinct key). They are not measured timings; do not quote speedups.
