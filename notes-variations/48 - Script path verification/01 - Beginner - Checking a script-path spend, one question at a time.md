# 48.01 · Checking a script-path spend, one question at a time

Variation 1 of slide 48 (Script path verification) · lens: Beginner · deck `fcv-i-nutroot-spend` page 11 · 4 steps · script 140 words, about 60 s

## Script

Four checks, applied to Alice's refund witness from the NUT-10 vectors. The right column defines the words.

**[1]** Check one: the path is short enough. The path lists sibling hashes on the way to the root. Alice's is empty; at most three are allowed.

**[2]** Check two: the witness rebuilds the secret. With one leaf, the root is the leaf's hash, 9ed9c0b8…. The tweak t is a hash of K and the root, b3b7846b…. K plus t times G, the generator point, is 02d310a4…, the proof's secret.

**[3]** Check three: the leaf can be read. Version 0, type after, n = 1, key 4, time 1755561600. Every part is known and in order.

**[4]** Check four: the condition is met. The mint's clock is at or past 2025-08-19. Key 4 signed this input's digest. That is one distinct signing key, and n is 1.

## Background

- **Leaf**: one condition, serialized as bytes: version, type, then fields.
- **Root**: one hash that commits to every leaf of the tree. With one leaf, the root is the leaf hash.
- **Tweak t**: tagged_hash("Cashu_NutrootTweak", K ‖ root), read as a number mod n.
- **t times G**: the generator point G added to itself t times. Adding it to K gives a point, compared byte for byte with the secret.
- **Order of the checks**: the leaf is trusted only after check two proves it is part of the tree committed in the secret.
- **n**: the number of distinct listed keys that must sign.
- **Input digest**: the message this input signs, derived from the transaction; each input has its own.
