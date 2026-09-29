# 51.05 · Sweeping, from the receiver's side

Variation 5 of slide 51 (Spend info and receive-time checks) · lens: Perspective: receiver · deck `fcv-i-nutroot-spend` page 31 · 4 steps · script 138 words, about 60 s

## Script

**[1]** The sender sends the token with spend info. Each shape leaves the receiver exposed until it sweeps. Bearer k: the sender holds the same scalar, and k may be p′ of a hidden tree. Receiver-keyed E: E is wallet data, not seed-derivable, so the seed alone cannot recover the proof. A disclosed tree without a key: the key-path holder can spend at any time, unless K is a NUMS offset.

**[2]** The receiver runs check 1, reconstruct, and check 2, spendable and within policy.

**[3]** Then it swaps at the mint and receives signatures on new outputs.

**[4]** After the swap the secrets are seed-derived: recoverable through NUT-09 and NUT-13, and nobody else holds a path. All three exposures are closed. To pass value on, the receiver sweeps first, then sends; a derived key is never re-gifted as a bearer k.

## Background

- **Swap (NUT-03)**: proofs in, new blinded outputs out; the mint signs the outputs.
- **NUT-09 restore**: a wallet that re-derives its blinded messages from the seed can ask the mint to return the signatures again.
- **Why E is not seed-derivable**: E is the sender's one-time key, so it exists only in the received token data.
- **Hidden tree behind k**: p′ = k₀ + t verifies exactly like a bare key, so a receiver cannot detect the tree.
- **Re-gift ban**: the first sender knows the blinding scalar, so a derived key passed on as k would reveal the receiver's static key.
