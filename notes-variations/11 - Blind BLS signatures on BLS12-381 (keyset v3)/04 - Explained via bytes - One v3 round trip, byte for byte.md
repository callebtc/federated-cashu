# 11.04 · One v3 round trip, byte for byte

Variation 4 of slide 11 (Blind BLS signatures on BLS12-381 (keyset v3)) · lens: Explained via bytes · deck `fcv-a-bls` page 22 · 6 steps · script 124 words, about 55 s

## Script

The NUT-00 v3 test vector. The secret is the UTF-8 string test_message, r = 3, and the mint key k = 2, which NUT-00 calls a.

**[1]** Y = H(x): a compressed G₁ point, 48 bytes, starting 86. The top three bits of the first byte are flags: 0x80 compressed, 0x40 point at infinity, never valid here, 0x20 which of the two y-values. 86 begins with bits 100.

**[2]** B′ = 3·Y, 48 bytes, starting 8e.

**[3]** C′ = 2·B′, starting 8d.

**[4]** C = 3⁻¹·C′ = 2·Y, starting b7. Its bits are 101, so the y-flag is set.

**[5]** K = 2·G₂, a compressed G₂ point, 96 bytes, starting aa.

**[6]** For exactly these bytes, e(C, G₂) = e(Y, K) holds. Real v3 secrets are 33-byte points, not strings.

## Background

- **Compressed point**: only the x-coordinate is stored, plus a flag saying which of the two possible y-values is meant. The BLS12-381 field element is 381 bits, so 48 bytes leave 3 spare bits for flags.
- **Flag bits**: bit 7 (0x80) set means compressed; bit 6 (0x40) set means the point at infinity, which v3 always rejects; bit 5 (0x20) set means y is the lexicographically larger of the two candidates.
- **G₂ encoding**: a G₂ x-coordinate is a pair of field elements, so a compressed G₂ point is 2 × 48 = 96 bytes. The flags sit in its first byte too.
- **3⁻¹·C′**: multiplication by the inverse of 3 modulo the group order. It undoes the blinding: C = 3⁻¹·2·3·Y = 2·Y.
- **Test vector**: fixed inputs and outputs in the spec (`tests/00-tests.md`), so implementations can check they compute the same bytes.
- **Secret bytes on v3**: NUT-00 requires `Proof.secret` to be a 33-byte compressed secp256k1 key; the string test_message is used only to exercise the arithmetic.

## Speaker note

- General-knowledge fact, not from the spec or CDK code: the meaning of the three flag bits comes from the standard BLS12-381 compressed serialization (Zcash format), which NUT-00 references only as "the standard BLS12-381 serialisation". The slide's reading is correct; I confirmed it in the docs and parser of the `bls12_381` 0.8.0 crate that CDK depends on (`src/notes/serialization.rs`, `G1Affine::from_compressed_unchecked`). "Sign of y" on the slide means: y is the lexicographically larger of the two candidates. I checked the first bytes against the vector: Y 0x86, B′ 0x8e, C′ 0x8d (bits 100), C 0xb7, K 0xaa (bits 101).
