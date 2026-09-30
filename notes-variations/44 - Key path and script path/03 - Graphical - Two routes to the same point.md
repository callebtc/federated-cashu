# 44.03 · Two routes to the same point

Variation 3 of slide 44 (Key path and script path) · lens: Graphical · deck `fcv-i-nutroot-spend` page 5 · 4 steps · script 121 words, about 50 s

## Script

Both routes on this figure end at the same point: P, the proof's secret.

**[1]** The key path is the upper route. One signature by p′, which is k plus t, verified against P. Nothing else is sent.

**[2]** The script path starts at the revealed leaf. Its hash is combined with the sibling hashes h₀ and h₁ to recompute the root. The siblings arrive as bare 32-byte hashes.

**[3]** The internal key K and the root give the tweak t. K + t·G must reproduce P; otherwise the witness is rejected.

**[4]** What each route reveals. The key path shows no tree at all. The script path reveals the exercised leaf and K. h₀ and h₁ stay opaque hashes: the other leaves remain private.

## Background

- **Opaque hash**: a sibling appears only as its 32-byte hash. The hash proves that something is committed at that position, not what it is.
- **Recomputing the root**: at each level, branch = tagged_hash("Cashu_NutrootBranch", smaller ‖ larger). Sorting the pair means the path needs no left/right flags.
- **Tweak**: t = tagged_hash("Cashu_NutrootTweak", K ‖ root) mod n.
- **p′ = k + t**: the private key of P, reduced mod n. Only the holder of k can compute it.
- **The figure is schematic**: h₀ and h₁ join the root in one node. In the three-leaf vector they join at two successive levels.
