# removed.04 · Deriving k, u and leaf keys from the seed (NUT-13)

Variation 4 of slide removed (Three forms of internal key) · lens: Explained via bytes · deck `fcv-i-nutroot-spend` page 22 · 4 steps · script 140 words, about 60 s

## Script

NUT-13 derives v3 keys with HMAC-SHA256, keyed by the seed.

**[1]** The message: the tag Cashu_KDF_HMAC_SHA256, 21 bytes; a 4-byte length, 33; the 33-byte keyset id; the 8-byte proof counter; one type byte; a 4-byte attempt number. 71 bytes, 75 with the leaf-key suffix.

**[2]** Type 0x00 derives the internal private key k; the secret is K = k·G. Counter 0 of the test seed gives 47196dc0… and K = 02e6e7cf…, the NUT-10 bearer vector. Type 0x01 is the blinding factor, not a key, sampled below the BLS12-381 order.

**[3]** Type 0x02 derives the NUMS offset u on the proof's counter: 4af68649…, giving K = 0308ca9e…, the script-only token vector.

**[4]** Type 0x03 derives own leaf keys, index i appended; i = 0 gives 8aac8b31…. They are matched to the tree by value. Each key comes straight from the seed: the hardening NUT-10 requires.

## Background

- **HMAC-SHA256**: a keyed hash. With the seed as key, outputs cannot be predicted or linked without the seed.
- **Rejection sampling**: if the digest is 0 or not below the group order, the attempt number increases and the hash is recomputed. This avoids the bias of reducing mod the order.
- **SECP256K1_N and BLS_FR_ORDER**: the scalar orders of secp256k1 (keys) and BLS12-381 (blinding factors).
- **Proof counter**: per keyset; one counter value is one proof allocation. Types 0x00 to 0x03 share it.
- **Why this counts as hardened**: there is no public derivation. Learning one key reveals nothing about any other.
- **Matching by value**: leaf order is not committed, so i is not a position; a wallet derives candidates i = 0, 1, 2… and compares them with the tree's keys.
- **Test seed**: the UTF-8 string "nut13 v3 test seed". NUT-13 defines no derivation type for aggregated keys.
