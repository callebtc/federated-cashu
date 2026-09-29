# 37.04 · The P2PK secret, byte by byte

Variation 4 of slide 37 (NUT-10 well-known secrets) · lens: Explained via bytes · deck `fcv-g-json-taproot` page 6 · 5 steps · script 140 words, about 60 s

## Script

Proof.secret is 195 bytes of UTF-8.

**[1]** By field: 4 bytes of kind, 64 of nonce, 66 of data, 26 of tags. The other 35 bytes are JSON syntax: brackets, braces, quotes, colons and commas.

**[2]** Inside the proof JSON the same string takes 213 characters: 16 backslashes, one before each quote, plus two enclosing quotes.

**[3]** Computing Y: NUT-00 hashes a domain separator and the 195 bytes into msg_hash, 68be7c63…. It then hashes msg_hash with a counter and takes the first result that is a valid x-coordinate. Counter 0 gives no point; counter 1 gives Y = 02561ea0….

**[4]** The signature covers SHA-256 of the same 195 bytes, 6eebbc3a…. The spec's signature verifies under BIP340 against the x-coordinate of the data key.

**[5]** 130 of the 195 bytes are hex digits. They encode only 65 binary bytes: the 32-byte nonce and the 33-byte key.

## Background

- **UTF-8**: every character in this secret is ASCII, one byte each, so characters and bytes coincide.
- **Domain separator**: the fixed prefix `Secp256k1_HashToCurve_Cashu_` hashed before the message, so this hash cannot coincide with SHA-256 uses elsewhere.
- **hash_to_curve counter**: for counter 0, 1, …: `h = SHA256(msg_hash ‖ counter as 4 bytes little-endian)`; if `02 ‖ h` is a valid compressed point, that point is Y. About half of all 32-byte values are valid x-coordinates, so small counters are typical.
- **BIP340 x-only verification**: BIP340 keys are 32-byte x-coordinates. The data key `0249098a…` is used as `49098aa8…`, its x-coordinate.
- **Hex encoding**: two characters per byte, so hex doubles the size of binary values.

## Speaker note

- Y, msg_hash and the SHA-256 digest were computed for the slide from the NUT-11 example secret; NUT-11 gives only the secret and the signature. Recomputed here: all values match, and the spec signature verifies over SHA-256 of the 195 bytes.
