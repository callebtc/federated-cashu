# 54.01 · Same pipeline, different constants

Variation 1 of slide 54 (Nutroot compared with BIP341) · lens: Beginner · deck `fcv-j-nutroot-use` page 20 · 6 steps · script 140 words, about 60 s

## Script

**[1]** Leaf. BIP341: a tapscript, opcodes run on a stack. Nutroot: a record, a type byte then fields such as n, keys, time or hash.

**[2]** Leaf hash. Both are tagged hashes. BIP341: tag TapLeaf over version 0xc0, the script length and the script. Nutroot: tag Cashu_NutrootLeaf over the leaf bytes.

**[3]** Root. BIP341: the builder picks the shape, depth up to 128. Nutroot: sort, pair, promote an odd hash, at most 8 leaves.

**[4]** Tweak t. BIP341 hashes the 32-byte x-coordinate of P with the root and fails if t reaches n, the curve order. Nutroot hashes the 33-byte K with the root and reduces mod n.

**[5]** Key. BIP341 publishes x(Q), 32 bytes. Nutroot's secret is K + t·G, all 33 bytes.

**[6]** The vector: one after leaf, 49 bytes, so the root is its leaf hash; then the tweak, and the secret 02d310a4….

## Background

- **Tapscript (BIP342)**: Bitcoin's script language for taproot leaves; opcodes executed on a stack.
- **Nutroot leaf**: a declarative record, version byte, type byte, then type-length-value fields; nothing is executed.
- **Tagged hash**: SHA-256(SHA-256(tag) ‖ SHA-256(tag) ‖ message). Different tags give unrelated hashes for the same message.
- **Merkle root**: leaves are hashed, pairs are hashed level by level until one hash remains; with one leaf the root is that leaf's hash.
- **Tweak**: t·G added to the internal key; G is the generator point. The owner of K's private key k can sign for K + t·G with k + t.
- **Curve order n**: the number of points in the secp256k1 group; scalars are numbers mod n. BIP341 rejects a tweak hash at or above n; nutroot reduces it.
- **x(Q)**: a key written by its x-coordinate only, 32 bytes, y implied even. Nutroot keeps the parity byte: 33 bytes.
- **Vector**: tests/10-tests.md receiver-keyed proof with a refund leaf: root 9ed9c0b8…, t = b3b7846b…, secret 02d310a4…9ef8f828.
