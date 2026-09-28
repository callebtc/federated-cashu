# 09 · Keyset versions

Original slide, deck `fcv-a-bls` page 34 (main deck slide 09). Same text as `notes/09 - Keyset versions/notes.md`.

1.1 BLS blind signatures · table, no steps · script 124 words, about 55 s

## Script

v3 is a keyset version, not a token format. v1 and v2 keysets use secp256k1, with IDs starting 00 and 01. v3 keysets use BLS12-381, with an ID starting 02 followed by 32 bytes: a SHA-256 over the length-framed amounts and 96-byte keys, the unit, and the fee. Expiry is not part of the v3 ID.

Public keys grow from 33 to 96 bytes. Blinding changes from adding r·G to multiplying by r. Verification moves from the mint, or a wallet holding a DLEQ proof, to any party with K. DLEQ proofs are rejected on v3. Only v3 supports threshold issuance.

Existing secp keysets stay active. An operator moves to v3 explicitly, with rotate-next-keyset --keyset-version v3. The token formats V3 and V4 are unrelated.

## Background

- **Keyset**: the set of mint public keys, one per amount denomination (1, 2, 4, 8, … sats). Each token is signed by the key of its amount. The keyset ID lets wallets know which keys signed a token.
- **Length framing (len32)**: each field is prefixed with its length as a 4-byte integer before hashing. Different field boundaries then always give different bytes, so two keysets cannot produce the same ID by shifting bytes between fields.
- **Keyset rotation**: the mint starts signing with a new keyset while old keysets remain valid for redemption.
- **Token V3 / V4 (NUT-00)**: two serialization formats for sending tokens (`cashuA…` base64 JSON and `cashuB…` CBOR). They are independent of the keyset version.
