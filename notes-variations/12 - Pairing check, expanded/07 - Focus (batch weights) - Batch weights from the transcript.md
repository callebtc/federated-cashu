# 12.07 · Batch weights from the transcript

Variation 7 of slide 12 (Pairing check, expanded) · lens: Focus: batch weights · deck `fcv-a-bls` page 33 · 5 steps · script 137 words, about 60 s

## Script

**[1]** The transcript from the NUT-00 batch test vector, 340 bytes: the tag Cashu_BLS_Batch_v1, 18 bytes, then per proof C, 48 bytes, K, 96 bytes, a 4-byte length and the 13-byte secret batch_proof_1 or batch_proof_2.

**[2]** The challenge is SHA-256 of the transcript, starting 539b5df3.

**[3]** Weight w₁, index 0: h = SHA-256 of challenge, index and counter, both 32-bit big-endian. h is accepted only if 0 < h < BLS_FR_ORDER, about 0.45·2²⁵⁶, so about 55% of hashes are rejected. Counters 0 to 3 fail; counter 4 is accepted. Rejection sampling MUST be used, because reducing mod the order would bias the weights.

**[4]** w₂, index 1, is accepted at counter 0.

**[5]** The check is e(w₁·C₁ + w₂·C₂, G₂) = e(w₁·Y₁ + w₂·Y₂, K). One key, so two Miller loops. The weights are public, and fixed only after every Cᵢ is.

## Background

- **Transcript**: the exact byte string that is hashed. Length-prefixing each secret keeps field boundaries unambiguous.
- **Challenge**: one 32-byte SHA-256 value that depends on every C, K and secret in the batch.
- **u32_BE**: a 4-byte big-endian unsigned integer. Index i separates the weights of different proofs; the counter ctr is raised until a valid scalar appears.
- **BLS_FR_ORDER**: the order of G₁, G₂ and the scalar field, 0x73eda753…00000001, about 0.45·2²⁵⁶. A random 256-bit number is below it with probability about 0.45.
- **Rejection sampling**: discard values that are zero or not below the order, and hash again. The accepted weights are uniform over the non-zero scalars.
- **Public weights**: anyone can recompute them. Security comes from their order of computation: they are derived from the Cᵢ, so no Cᵢ can be chosen with knowledge of its weight.

## Speaker note

- From the spec vector (`tests/00-tests.md`): the inputs, the challenge, the final weights, and "weight_1 accepts at ctr = 4, weight_2 at ctr = 0". Computed for the slide, not in the spec: the 340-byte length and the rejected hash prefixes for counters 0 to 3. I recomputed all of them and they match.
- "About 55%" is computed from BLS_FR_ORDER / 2²⁵⁶ ≈ 0.4528.
