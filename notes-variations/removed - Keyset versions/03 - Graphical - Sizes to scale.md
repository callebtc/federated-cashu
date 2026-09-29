# removed.03 · Sizes to scale

Variation 3 of slide removed (Keyset versions) · lens: Graphical · deck `fcv-a-bls` page 37 · 3 steps · script 107 words, about 45 s

## Script

**[1]** Keyset IDs, drawn to scale; the bar at the bottom is 16 bytes. A v1 ID is 8 bytes: the version byte 00 and 7 bytes of hash. v2 and v3 IDs are 33 bytes: a version byte and a 32-byte SHA-256. The dark first segment is the version byte.

**[2]** The public key per amount: 33 bytes on secp256k1, 96 bytes for a compressed G₂ point. This is the largest increase.

**[3]** The signature C per proof: 33 bytes on secp256k1, 48 bytes for a compressed G₁ point. Each proof's signature grows by 15 bytes. Each key grows by 63 bytes, but keys are fetched once per keyset.

## Background

- **Compressed secp256k1 point**: 1 prefix byte (02 or 03) plus the 32-byte x-coordinate, 33 bytes.
- **Compressed G₁ point (BLS12-381)**: the 381-bit x-coordinate with flag bits in the top bits, 48 bytes.
- **Compressed G₂ point**: an x-coordinate made of two field elements, 96 bytes.
- **Why the keys are in G₂**: the key is published once per amount per keyset; the signature travels with every proof. Placing signatures in the smaller group keeps tokens small.
- **Short keyset ID**: V4 tokens may carry only the first 8 bytes of a 33-byte ID.
