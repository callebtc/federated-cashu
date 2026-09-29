# removed.04 · The tagged hash, byte by byte

Variation 4 of slide removed (Per-input signing digest) · lens: Explained via bytes · deck `fcv-f-client-intent` page 23 · 5 steps · script 108 words, about 45 s

## Script

The input digest is one SHA-256 over exactly 128 bytes. The tag is Cashu_TransactionInput, 22 ASCII bytes.

**[1]** Bytes 0 to 63: SHA-256 of the tag, 4996fee5, written twice. Prefixing the tag hash twice is the BIP-340 tagged-hash construction.

**[2]** Bytes 64 to 95: the transaction digest of the swap, 7d478315.

**[3]** Bytes 96 to 127: the input ID, 44002fef.

**[4]** One SHA-256 over those 128 bytes gives the input digest, 867091ad.

**[5]** The signer is k, 47196dc0, the private key of this vector's secret. The BIP-340 signature is 64 bytes, a46a08f9 through a56509a2. The verifier checks it against the x-coordinate of the secret, e6e7cfa7: the 33-byte compressed key without its 02 prefix.

## Background

- **Tagged hash**: `SHA256(SHA256(tag) ‖ SHA256(tag) ‖ message)`. The two tag hashes fill exactly one 64-byte SHA-256 block, so implementations can precompute that block once per tag.
- **Offsets 0x00, 0x20, 0x40, 0x60**: 0, 32, 64 and 96 in decimal; each row is 32 bytes.
- **k**: the NUT-13 V3 counter-0 key, also the bearer key of the NUT-10 V4 token vector. k·G is the secret 02e6e7cf…a29b.
- **x-only check**: BIP-340 verifies against a 32-byte x-coordinate; the compressed key's first byte only states the parity of y.

## Speaker note

- All values are from the NUT-10 swap vector and rechecked (the 128-byte message hashes to 867091ad…, the signature verifies). Specified in cashubtc/nuts#443; not implemented on the federation branches.
