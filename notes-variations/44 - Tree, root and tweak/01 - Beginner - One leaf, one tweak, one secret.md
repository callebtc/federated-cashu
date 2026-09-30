# 44.01 · One leaf, one tweak, one secret

Variation 1 of slide 44 (Tree, root and tweak) · lens: Beginner · deck `fcv-h-nutroot-tree` page 11 · 5 steps · script 139 words, about 60 s

## Script

**[1]** The condition: key 4 may spend from 2025-08-19. As a leaf, 49 bytes: version 00, type 02 for after, then three records, each a type, a length and a value: n = 1, key 4, and the time 1755561600.

**[2]** The leaf hash is a tagged hash, SHA-256 under the tag Cashu_NutrootLeaf, over the leaf bytes: 9ed9c0b8….

**[3]** With one leaf the root is that leaf hash. With more leaves, hashes are paired level by level until one remains.

**[4]** The tweak t is the Cashu_NutrootTweak hash over the internal key K and the root. K is 03a3e12c…, t is b3b7846b….

**[5]** The secret is P = K + t·G, where G is the generator: 02d310a4…, committing to K and the leaf. Key path: sign with (k + t) mod n, where k is K's private key. Script path: key 4, from 2025-08-19.

## Background

- **Tagged hash (BIP340)**: SHA256(SHA256(tag) ‖ SHA256(tag) ‖ message). Different tags give unrelated outputs for the same bytes, so a leaf hash can never be confused with a branch hash or a tweak.
- **Leaf bytes**: `00 02 | 02 0001 01 | 04 0021 02e493…c4cd13 | 06 0004 68a3be80`. Field 0x02 is n, field 0x04 the keys, field 0x06 the time.
- **1755561600**: Unix seconds for 2025-08-19 00:00 UTC, stored as the 4-byte big-endian value 68a3be80.
- **Merkle root**: the single hash at the top of the tree. It commits to every leaf.
- **t·G**: the point for scalar t. Adding it to K shifts the key by a known amount, so the private key shifts from k to (k + t) mod n.
- **Source**: every value is from the receiver-keyed worked example in `tests/10-tests.md` (Alice pays Carol, refundable to Alice's key 4).
