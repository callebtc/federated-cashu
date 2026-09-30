# 41 · Tree, root and tweak

2.3 Nutroot secrets · 6 steps · script 126 words, about 55 s

## Script

The worked three-leaf vector from the spec.

**[1]** Three condition leaves, serialized as TLV records, in transmitted order: a threshold leaf, an after leaf and a hashlock leaf.

**[2]** Each leaf hash is a tagged hash with the tag Cashu_NutrootLeaf over the leaf bytes.

**[3]** Sort the leaf hashes ascending: h₀, then h₂, then h₁.

**[4]** Pair neighbours on each level with the tag Cashu_NutrootBranch, over the smaller hash then the larger. h₀ and h₂ form a branch. The unpaired h₁ is promoted unchanged.

**[5]** One hash remains: the merkle root, 3d4f….

**[6]** Tweak the internal key K: t is the Cashu_NutrootTweak hash over K and the root, taken modulo the curve order n, never rejected. The secret is P = K + t·G, 022d17fd…. These values reproduce the spec's test vector.

## Background

- **Leaf order does not matter**: the fold sorts the hashes, so the root commits to the set of leaves, not their transmitted order.
- **Promoted**: an unpaired hash moves up to the next level unchanged, without being hashed again.
- **Curve order n**: the number of points in the secp256k1 group. Scalars are numbers modulo n.
- **"Never rejected"**: BIP341 rejects a tweak hash that is at or above n. Nutroot reduces it modulo n instead. The case has negligible probability, but the rule removes a failure path.
- **K ‖ root**: the tweak hashes the full 33-byte compressed K, not the 32-byte x-coordinate as in BIP341.
