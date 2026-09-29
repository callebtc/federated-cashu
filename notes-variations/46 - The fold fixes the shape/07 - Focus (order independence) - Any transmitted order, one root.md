# 46.07 · Any transmitted order, one root

Variation 7 of slide 46 (The fold fixes the shape) · lens: Focus: order independence · deck `fcv-h-nutroot-tree` page 34 · 4 steps · script 102 words, about 45 s

## Script

**[1]** Three transmitted orders of the same three leaves: threshold, after, hashlock; then hashlock, threshold, after; then after, hashlock, threshold.

**[2]** Hashing and sorting removes the order. Every list becomes h₀, h₂, h₁: 23e8ff16…, 8f38ddf9…, 9ed9c0b8….

**[3]** The same fold gives the same root, 3d4fbecf…. A permuted list must be treated as equivalent, and nothing may be derived from a leaf's position.

**[4]** The path for the hashlock leaf is a plain list: 23e8ff16…, then 9ed9c0b8…. At each level the verifier hashes the pair as branch of min and max. Because every pair is hashed lower value first, the path needs no left or right flags.

## Background

- **Transmitted order**: the order of leaves in spend info or a request. It has no meaning for the root.
- **Left/right flags**: in a merkle tree that hashes pairs in position order, a proof must say on which side each sibling goes. Sorted pairing makes the order implicit. BIP341's TapBranch also sorts its two children.
- **branch(min, max)**: tagged_hash("Cashu_NutrootBranch", min(a, b) ‖ max(a, b)).
- **Nothing derived from position**: NUT-28 receivers match blinded keys by value, never by a leaf's place in the list.
- **Path for the hashlock leaf**: the vector's `path_for_index_2`, `[h₀, h₁]`.
