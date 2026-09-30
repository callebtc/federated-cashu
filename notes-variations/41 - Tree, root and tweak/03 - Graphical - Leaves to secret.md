# 41.03 · Leaves to secret

Variation 3 of slide 41 (Tree, root and tweak) · lens: Graphical · deck `fcv-h-nutroot-tree` page 13 · 6 steps · script 123 words, about 55 s

## Script

The three-leaf vector from the spec, from leaves to secret, left to right.

**[1]** Three leaves: threshold, 42 bytes; after, 49 bytes; hashlock, 77 bytes.

**[2]** Each leaf is hashed under the Cashu_NutrootLeaf tag: h₀ 23e8ff16…, h₁ 9ed9c0b8…, h₂ 8f38ddf9….

**[3]** The hashes are sorted by byte value. h₂ is smaller than h₁, so the order becomes h₀, h₂, h₁. The crossing arrows are that reordering.

**[4]** Neighbours pair under the Cashu_NutrootBranch tag: h₀ and h₂ form the branch 8f58855d…. h₁ has no partner and is promoted unchanged, drawn dashed.

**[5]** The branch and h₁ pair into the root, 3d4fbecf….

**[6]** The internal key K, 03a3e12c…, and the root give the tweak t, ea08208d…. The secret is P = K + t·G, 022d17fd…, the value in the spec vector.

## Background

- **Leaf hash**: tagged_hash("Cashu_NutrootLeaf", leaf bytes), 32 bytes.
- **Sorting**: the 32-byte hashes are compared as byte strings, first byte first. 23… < 8f… < 9e….
- **Branch**: tagged_hash("Cashu_NutrootBranch", min(h1, h2) ‖ max(h1, h2)); the smaller hash goes first.
- **Promotion**: an unpaired last hash moves to the next level as it is, without being hashed again.
- **Tweak and secret**: t = tagged_hash("Cashu_NutrootTweak", K ‖ root) mod n; P = K + t·G.

## Speaker note

- h₂ `8f38ddf9…`, the branch `8f58855d…` and t `ea08208d…` are not printed in the spec vectors; they were derived from the vector leaves and K. Recomputed with the NUT-10 tags: they reproduce the vector root `3d4fbecf…` and secret `022d17fd…`.
