# 50.03 · Climbing from leaf to secret

Variation 3 of slide 50 (Script path verification) · lens: Graphical · deck `fcv-i-nutroot-spend` page 13 · 5 steps · script 112 words, about 50 s

## Script

The commitment check for the hashlock leaf of the spec's three-leaf tree, from the leaf at the bottom to the secret at the top.

**[1]** The revealed hashlock leaf hashes to 8f38ddf9…. Check 1 passes: the path holds 2 hashes, at most 3 are allowed.

**[2]** The first sibling from the path, h₀, 23e8ff16…, enters from the side. Branch over the sorted pair gives 8f58855d….

**[3]** The second sibling, h₁, 9ed9c0b8…, gives the root, 3d4fbecf….

**[4]** The internal key K, 03a3…, and the root give the tweak t, ea08208d…. The verifier computes K + t·G.

**[5]** The result equals the secret, 022d17fd…. Check 2 passes. Only now does the verifier parse the leaf and evaluate its condition.

## Background

- **Leaf hash**: tagged_hash("Cashu_NutrootLeaf", leaf bytes).
- **Branch**: tagged_hash("Cashu_NutrootBranch", smaller ‖ larger); the pair is sorted, so no left/right flag is needed.
- **The three-leaf fold**: the sorted leaf hashes are 23e8… (threshold, h₀), 8f38… (hashlock, h₂), 9ed9… (after, h₁). h₀ and h₂ pair; h₁ is promoted unchanged. The hashlock leaf's path is therefore [h₀, h₁].
- **Tweak**: t = tagged_hash("Cashu_NutrootTweak", K ‖ root) mod n.
- **h₁ = 9ed9c0b8…**: the after leaf's hash, the same value as the root of the one-leaf refund example.

## Speaker note

- 8f38ddf9… (hashlock leaf hash), 8f58855d… (first branch) and ea08208d… (tweak) are not printed in the spec vectors; they are computed from the vector's leaves and K. I recomputed them and they reproduce the vector's root 3d4fbecf… and secret 022d17fd….
