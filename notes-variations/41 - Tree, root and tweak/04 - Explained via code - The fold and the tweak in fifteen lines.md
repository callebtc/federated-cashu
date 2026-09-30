# 41.04 · The fold and the tweak in fifteen lines

Variation 4 of slide 41 (Tree, root and tweak) · lens: Explained via code · deck `fcv-h-nutroot-tree` page 14 · 6 steps · script 139 words, about 60 s

## Script

Python that reproduces the vector, with a trace on the right.

**[1]** th is the BIP340 tagged hash: the tag's SHA-256, twice as a prefix, then SHA-256 over the message. For Cashu_NutrootLeaf the tag hash is e19ba80c….

**[2]** Level 0 is the sorted list of leaf hashes: h₀, h₂, h₁.

**[3]** While more than one hash remains, the level is cut into groups of two. The last group holds only h₁.

**[4]** A group of two becomes a branch hash, smaller value first; a group of one is kept unchanged. Level 1 is the branch 8f58855d… and the promoted h₁.

**[5]** The loop ends with one hash, the root 3d4fbecf….

**[6]** The tweak is the Cashu_NutrootTweak hash over K and the root, read as a big-endian integer mod n: ea08208d…. P = K + t·G is point arithmetic. The result is 022d17fd…, the vector secret.

## Background

- **`sorted(...)` on bytes**: Python compares byte strings lexicographically, which is the ascending order the spec requires.
- **`level[i:i+2]`**: slices the list into consecutive groups of two; an odd-length list leaves a final group of one.
- **`min(p) + max(p)`**: concatenates the smaller hash and then the larger, the sorted pair the branch hash takes.
- **`int.from_bytes(..., "big") % n`**: reads the 32-byte digest as an unsigned big-endian integer and reduces it modulo the curve order n.
- **Point arithmetic**: K + t·G is elliptic-curve addition and scalar multiplication on secp256k1; the listing assumes a library for it.
- **Precondition**: `sha256` must return the 32-byte digest (for example `hashlib.sha256(x).digest()`), and `tree`, `K` and `n` must be bound.

## Speaker note

- An equivalent script was rerun for these notes: it reproduces root `3d4fbecf…` and, with K `03a3e12c…`, the vector secret. The trace values h₂ `8f38ddf9…`, branch `8f58855d…` and t `ea08208d…` are derived, not printed in the vectors.
