# 08.04 · The pairing check in nut01/bls.rs

Variation 4 of slide 08 (Pairing check, expanded) · lens: Explained via code · deck `fcv-a-bls` page 30 · 4 steps · script 117 words, about 50 s

## Script

Excerpts from `nut01/bls.rs` in the cashu crate, branch bls-federation.

**[1]** `verify_pairing`, one proof: hash the secret to y, compute the pairing of the signature with the G₂ generator and the pairing of y with the mint key, and compare both results in G_T.

**[2]** `batch_verify_pairing` first derives the weights from a SHA-256 transcript over every signature, key and secret.

**[3]** It forms one weighted sum of the Cᵢ, and for each distinct mint key one sum of weighted Yᵢ.

**[4]** It negates the signature sum, so the product of all terms must be 1: one term for minus Σ wᵢ·Cᵢ with G₂, one per key. One multi-Miller loop computes all terms, then one final exponentiation, compared with the identity of G_T.

## Background

- **Miller loop and final exponentiation**: a pairing is computed in two stages. The Miller loop runs over the curve points; the final exponentiation raises the result to a fixed large power. `pairing()` does both, so one proof checked alone costs two of each.
- **Multi-Miller loop**: computes the Miller loop for several point pairs and multiplies the results, so one final exponentiation serves all of them.
- **Negation trick**: e(−P, Q) = e(P, Q)⁻¹. Moving the signature term to the other side turns "left = right" into "product = 1".
- **`G2Prepared`**: a G₂ point with precomputed values for the Miller loop.
- **Grouping by key**: the code keys a map by the 96-byte compressed key, so proofs of the same amount share one pairing term.
- **`derive_batch_weights`**: builds the transcript `Cashu_BLS_Batch_v1` ‖ (C ‖ K ‖ u32 length ‖ secret) per proof, hashes it, and rejection-samples one weight per proof.
