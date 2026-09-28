# 34.01 · Three hashes before one signature

Variation 1 of slide 34 (Per-input signing digest) · lens: Beginner · deck `fcv-f-client-intent` page 20 · 4 steps · script 133 words, about 55 s

## Script

Three hashes come before the one signature an input makes. The values are from the NUT-10 swap vector.

**[1]** First, SHA-256 over the whole 333-byte transcript. SHA-256 maps any bytes to 32 bytes, and changing any byte changes the result. This is the transaction digest, 7d478315.

**[2]** Second, SHA-256 over this input's own 145-byte record: the input ID, 44002fef.

**[3]** Third, a tagged hash of the two together. A tagged hash is SHA-256 with a fixed label hashed in front, here Cashu_TransactionInput, so the result cannot match a hash made for another purpose. This is the input digest, 867091ad.

**[4]** The owner signs it with k, the private key whose public key K is the proof's secret. The 64-byte BIP-340 signature goes in the witness. Changing any byte of the transaction changes lines 1, 3 and 4.

## Background

- **SHA-256**: a hash function producing 32 bytes. Finding two inputs with the same output, or an input for a given output, is infeasible.
- **Tagged hash (BIP-340)**: `SHA256(SHA256(tag) ‖ SHA256(tag) ‖ message)`. Different tags give unrelated outputs for the same message, so a value computed for one purpose cannot serve another.
- **‖**: byte concatenation.
- **k and K**: K = k·G on secp256k1, G the fixed generator. On a v3 keyset the proof's secret is K; only the owner knows k.
- **BIP-340 signature**: the Schnorr signature scheme of taproot, 64 bytes, verified against a 32-byte x-only public key.
- **Why line 2 does not change**: the input's own record is independent of the outputs; only the transaction digest, and everything derived from it, changes.

## Speaker note

- Specified in cashubtc/nuts#443; not implemented on the federation branches.
