# 48.07 · Thresholds count keys, not signatures

Variation 7 of slide 48 (Script path verification) · lens: Focus: counting distinct keys · deck `fcv-i-nutroot-spend` page 17 · 4 steps · script 136 words, about 60 s

## Script

The NUT-10 two-of-two leaf, 75 bytes: type 01 threshold, n = 2, keys 3 and 4.

**[1]** Keys 3 and 4 each sign once. Two distinct keys meet n = 2. Satisfied.

**[2]** Key 3 signs twice. BIP-340 signatures are non-deterministic, so one key can produce two different valid signatures. Counting signatures would let key 3 meet n alone. The verifier counts distinct keys: one, fewer than two. Rejected.

**[3]** Three entries: key 3, key 4, and key 3 again. The witness may not hold more signatures than the leaf lists keys, and three exceeds two. Rejected, although two distinct keys signed.

**[4]** A leaf listing 02‖x and 03‖x: keys sharing an x-coordinate verify the same signature, so one signer would count twice. Leaf validation rejects such a leaf as malformed. NUT-11 uses the same counting rule for pre-v3 multisig.

## Background

- **Leaf bytes**: `00 01 | 02 0001 02 | 04 0042 <key 3><key 4>`. 0x42 = 66 bytes, two 33-byte keys.
- **Why signatures are non-deterministic**: a Schnorr signature depends on a nonce the signer chooses; each nonce gives a different valid signature. BIP-340 mixes in auxiliary randomness; the vectors fix it to zero bytes for reproducibility.
- **Signature-count bound**: signatures MUST NOT outnumber listed keys. It bounds verifier work and rules out padding with extra entries.
- **Shared x-coordinate**: 02‖x and 03‖x differ only in y parity; BIP-340 verifies against x only.
- **NUT-11**: pre-v3 P2PK; it also requires a minimum number of unique public keys with valid signatures.

## Speaker note

- NUT-10 states the shared-x rule under leaf validation, "enforced when building and when verifying a disclosed tree"; the four mint verification steps do not list it separately.
