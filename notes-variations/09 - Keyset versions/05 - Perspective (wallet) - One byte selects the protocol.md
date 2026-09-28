# 09.05 · One byte selects the protocol

Variation 5 of slide 09 (Keyset versions) · lens: Perspective: wallet · deck `fcv-a-bls` page 39 · 4 steps · script 117 words, about 50 s

## Script

**[1]** Signatures and proofs name their keyset. The first byte of the keyset ID is the version, and it selects the protocol.

**[2]** 00 and 01 select the NUT-00 legacy protocol on secp256k1. hash_to_curve is SHA-256 try-and-increment with the tag Secp256k1_HashToCurve_Cashu_. Blinding is Y + r·G, unblinding C′ − r·K. C′ is checked with a DLEQ proof if the mint sent one. Secrets are random strings or NUT-10 JSON secrets.

**[3]** 02 selects BLS12-381. hash_to_curve_G1 uses RFC 9380 with the Cashu DST. Blinding is r·Y, unblinding r⁻¹·C′. C′ is checked with a batched pairing against K, and a dleq field is rejected. Secrets are 33-byte points, and every input carries a witness.

**[4]** In CDK, construct_proofs and blind_message_for_version branch on keyset_id.get_version().

## Background

- **Keyset ID version byte**: 00 for v1, 01 for v2, 02 for v3. It is part of every BlindedMessage, BlindSignature and Proof.
- **Try-and-increment**: hash with a counter until the result is a valid x-coordinate on secp256k1.
- **RFC 9380 with the Cashu DST**: the standard BLS12-381 G1 hash-to-curve with the tag `CASHU_BLS12_381_G1_XMD:SHA-256_SSWU_RO_`.
- **NUT-10 JSON secrets**: pre-v3 secrets carrying spending conditions as a JSON array. On v3 conditions are committed into the point secret instead.
- **`get_version()`**: returns the `KeySetVersion` enum (`Version00`, `Version01`, `Version02`) from the ID's first byte. `construct_proofs` in `crates/cashu/src/dhke.rs` unblinds with C′ − r·K or r⁻¹·C′ depending on it, and rejects a dleq field on `Version02`.
