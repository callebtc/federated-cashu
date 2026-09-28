# 46.05 · Two parties, two parts of the tree

Variation 5 of slide 46 (Tree, root and tweak) · lens: Perspective: receiver and mint · deck `fcv-h-nutroot-tree` page 15 · 4 steps · script 139 words, about 60 s

## Script

Two parties see two parts of the same three-leaf tree.

**[1]** The receiver gets spend info: the internal key K and every leaf in full, here threshold, hashlock and after.

**[2]** It folds the whole tree: threshold and hashlock into a branch, the after hash promoted, then root, tweak and K + t·G. This is check 1. It equals the secret, so the disclosure is complete; a hidden leaf would change the root.

**[3]** The mint sees only a script-path witness for the hashlock leaf: the leaf, K, and the path h₀, h₁. h₀ is the threshold leaf's hash, h₁ the after leaf's hash. Both are opaque.

**[4]** The mint computes three hashes, the leaf hash, the branch with h₀ and the root with h₁, then the tweak, and compares K + t·G with the secret. The threshold and after leaves remain hashes.

## Background

- **Check 1**: receive-time verification. The spend info must reconstruct the secret: every leaf parses, and K + t·G over the recomputed root equals the secret.
- **Why a match proves completeness**: the secret commits to the root and the root commits to every leaf. An extra hidden leaf would give a different root, tweak and secret.
- **Opaque hash**: a 32-byte hash that proves a sibling exists without revealing its content.
- **Path [h₀, h₁]**: the vector's `path_for_index_2`, `23e8ff16…` and `9ed9c0b8…`. Each entry is paired with the running hash in sorted order.
- **Script-path check order**: path length at most 3, commitment recomputed, leaf parsed, leaf evaluated (preimage and signatures for a hashlock).
