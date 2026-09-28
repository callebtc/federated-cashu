# 56.04 · The hash preimages, byte by byte

Variation 4 of slide 56 (Nutroot compared with BIP341) · lens: Explained via bytes · deck `fcv-j-nutroot-use` page 23 · 4 steps · script 137 words, about 60 s

## Script

**[1]** The leaf hash preimage. BIP341: the TapLeaf tag hash twice, then version 0xc0, a compact_size length, and the script. Nutroot: the Cashu_NutrootLeaf tag hash twice, then the leaf as is: version 00, type 02 after, the n record, the keys record with key 4, the time record. 49 bytes. There is no 0xc0 and no length prefix; the leaf starts with its own version byte.

**[2]** The branch has the same shape in both: tag prefix, then 64 bytes, the smaller hash first. Only the tag differs.

**[3]** The tweak. BIP341 hashes 32 bytes of x(P) and the root, 64 bytes. Nutroot hashes all 33 bytes of K and the root, 65 bytes.

**[4]** The result: t = b3b7846b…, and K + t·G = 02d310a4…, 33 bytes. BIP341 outputs x(Q), 32 bytes, and keeps the parity for the control block.

## Background

- **Tagged hash**: SHA-256(SHA-256(tag) ‖ SHA-256(tag) ‖ message). The two 32-byte tag hashes form a 64-byte prefix; the slide shows their first bytes.
- **Tag hash values**: SHA-256 of TapLeaf aeea8fdc…, TapBranch 1941a1f2…, TapTweak e80fe163…; of Cashu_NutrootLeaf e19ba80c…, Cashu_NutrootBranch f54194fd…, Cashu_NutrootTweak cc14d687…. The nutroot ones are listed in tests/10-tests.md.
- **compact_size**: Bitcoin's variable-length integer, here the script length.
- **TLV record**: type (1 byte), length (2 bytes), value: 02 0001 01 is n = 1; 04 0021 is a 33-byte keys field; 06 0004 68a3be80 is time 1755561600.
- **Preimage**: the exact byte string fed into a hash.
- **Parity in the control block**: BIP341 publishes only x(Q), so a script-path spend must state whether Q has even or odd y. Nutroot's 33-byte secret already carries it.
