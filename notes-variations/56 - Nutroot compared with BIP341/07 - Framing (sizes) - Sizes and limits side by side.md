# 56.07 · Sizes and limits side by side

Variation 7 of slide 56 (Nutroot compared with BIP341) · lens: Framing: sizes · deck `fcv-j-nutroot-use` page 26 · 3 steps · script 137 words, about 60 s

## Script

**[1]** Committed key: a 32-byte x-only output key, against a 33-byte compressed secret. Tweak preimage: 64 bytes against 65. Key-path witness: a 64-byte signature, 65 with a non-default sighash, against 147 characters of JSON holding one 64-byte signature. Merkle path: up to 128 hashes against up to 3.

**[2]** Tree: depth up to 128 with a chosen shape, against at most 8 leaves with a fixed shape. Control block: 33 + 32m bytes, at most 4129, against K plus at most 96 bytes of path, hex in JSON. Leaf: a script under version 0xc0, against at most 513 bytes.

**[3]** Nutroot script-path witnesses in compact JSON: 350 characters for one after leaf, 533 for the 2-of-2 threshold leaf, 617 for the hashlock in the three-leaf tree. Mints may reject a witness over 4096 characters; every valid witness fits below that.

## Background

- **Sighash byte**: BIP341 appends a 65th byte to the signature when a sighash type other than the default is used.
- **4129 bytes**: 33 + 32 × 128, the largest BIP341 control block.
- **96 bytes of path**: 3 sibling hashes of 32 bytes, the longest path in an 8-leaf nutroot tree.
- **513-byte leaf**: version byte plus a body of at most 512 bytes.
- **Compact JSON**: no whitespace; hex strings count two characters per byte. 350 = one 49-byte leaf, K, an empty path, one signature.
- **4096-character bound**: mints MAY reject longer witnesses; the spec states every valid witness has a compact encoding below it.

## Speaker note

- 350, 533 and 617 are computed, not spec values (the slide says so). Recomputed: 147, 350 and 533 match; 617 assumes a 32-byte preimage, since the vector's hash a1a1…a1a1 has no stated preimage.
