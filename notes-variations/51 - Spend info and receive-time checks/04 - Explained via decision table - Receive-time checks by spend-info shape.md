# 51.04 · Receive-time checks by spend-info shape

Variation 4 of slide 51 (Spend info and receive-time checks) · lens: Explained via decision table · deck `fcv-i-nutroot-spend` page 30 · 3 steps · script 133 words, about 55 s

## Script

**[1]** No spend info: a seed key, nothing to reconstruct, check 2 decides, nobody else can spend. Bearer k: k·G, or its empty tweak, must equal the secret; the sender can still spend, plus any tree hidden behind k. E alone: the derived key, or its empty tweak, must equal the secret; nobody else can spend, but E is not seed-derivable.

**[2]** With a tree, every leaf must parse and K + t·G must equal the secret. With E, leaf key holders can spend under their conditions. With a disclosed K, the key-path holder can spend at any time. With K, u and a tree, K − u·G must also equal H, so only leaf key holders can spend.

**[3]** A tree without a key source, or k with E, rejects. A permuted tree is equivalent.

## Background

- **Seed key**: a key derived from the wallet seed (NUT-13); the proof is recoverable from the seed.
- **Empty tweak**: covers the aggregated form of a key without a tree.
- **Hidden tree behind k**: a bearer k may be p′ = k₀ + t of a tweaked secret; k·G then equals the secret and check 1 passes.
- **Key-path holder**: whoever holds the private key of K.
- **Leaf key holders**: the owners of keys listed in the leaves, spending under each leaf's conditions.
- **The V4 vectors**: k gives 02e6e7cf…; E gives 03a3e12c…; E or K with the refund tree gives 02d310a4…; K, u and tree give 0251a4f3….

## Speaker note

- The table shows the vector shapes. NUT-10 also accepts k with a tree (K = k·G, then the tree must reconstruct) and E with K and a tree (K SHOULD accompany E and must match the derived key). The "anything else" row should be read as its check-1 cell says: a tree without a key source, or k with E. The script avoids "anything else".
