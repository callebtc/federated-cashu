# 39.07 · Tagged hashes: TapLeaf, TapBranch, TapTweak

Variation 7 of slide 39 (Three tags, one output key) · lens: Focus: tagged hashes · deck `fcv-g-json-taproot` page 25 · 5 steps · script 134 words, about 55 s

## Script

**[1]** A BIP340 tagged hash is SHA-256 over two copies of SHA-256 of the tag, then the message. The prefix is 64 bytes, exactly one SHA-256 block, so an implementation can precompute the hash state after that block once per tag.

**[2]** TapLeaf. SHA-256 of the tag string is aeea8fdc…. The message is the leaf version, the compact-size length and the script: 36 bytes for a 34-byte script.

**[3]** TapBranch, tag hash 1941a1f2…. The message is the two 32-byte child hashes, smaller first: 64 bytes.

**[4]** TapTweak, tag hash e80fe163…. The message is the 32-byte x(P), then the 32-byte root if there are scripts: 64 bytes, or 32 without scripts.

**[5]** Different tags give different prefixes, so a hash from one context cannot be reinterpreted as a value in another. Nutroot uses its own tags in the same structure.

## Background

- **SHA-256 block**: SHA-256 processes input in 64-byte blocks. The internal state after the first block (the midstate) depends only on the tag, so it can be computed once.
- **Domain separation**: giving each use of a hash function its own fixed prefix, so the same bytes hashed in two contexts give unrelated results. Without it, a 64-byte leaf message and a branch message could produce the same hash.
- **Message sizes**: TapLeaf 1 + 1 + 34 = 36 bytes here; TapBranch 32 + 32; TapTweak 32 + 32, or 32 for a key-path-only output.
- **Nutroot tags (NUT-10)**: `Cashu_NutrootLeaf`, `Cashu_NutrootBranch`, `Cashu_NutrootTweak`.

## Speaker note

- The three tag digests were computed for the slide. Recomputed here: `aeea8fdc…be78e9ee`, `1941a1f2…f516a015`, `e80fe163…af57c5e9` are correct.
