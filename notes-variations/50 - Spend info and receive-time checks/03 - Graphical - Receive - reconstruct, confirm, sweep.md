# 50.03 · Receive: reconstruct, confirm, sweep

Variation 3 of slide 50 (Spend info and receive-time checks) · lens: Graphical · deck `fcv-i-nutroot-spend` page 29 · 4 steps · script 121 words, about 50 s

## Script

A token arrives with its spend info.

**[1]** Reconstruction takes the internal key from one of three sources: k·G from a bearer k, the key derived from E, or a disclosed K. With the tree it computes K + t·G and compares the result with P.

**[2]** If they match, the proof moves on. If not, it is rejected. A match proves that no leaf is hidden.

**[3]** The second check: the wallet holds the key path or keys for a leaf, and every disclosed leaf passes its acceptance policy. Otherwise reject.

**[4]** Then the receiver swaps the proof at the mint for new proofs with seed-derived secrets. After the swap, no one else holds a spend path, and the seed alone recovers the value.

## Background

- **Key sources**: bearer k gives K = k·G; receiver-keyed E gives the key derived with the receiver's static key at NUT-28 slot 0; otherwise K is disclosed directly.
- **Without a tree**: check 1 requires K, or its empty tweak, to equal the secret.
- **Acceptance policy**: the receiver's own rules for leaves, for example a minimum refund horizon.
- **Sweep**: a swap (NUT-03) of received proofs for new proofs with the receiver's own seed-derived secrets.
- **Seed-derived (NUT-13)**: secrets derived from the wallet seed, restorable from the seed through NUT-09.
