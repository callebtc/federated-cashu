# 09.02 · v3 keysets: the rules, NUT by NUT

Variation 2 of slide 09 (Keyset versions) · lens: Advanced · deck `fcv-a-bls` page 36 · 3 steps · script 137 words, about 60 s

## Script

The rules for version-02 keysets, per NUT, from nuts#443.

**[1]** Keys and ID. NUT-01: public keys are compressed G₂ points, 96 bytes. NUT-02: the ID is 02 plus SHA-256 over length-framed keys, unit and fee; final_expiry is not committed; the unit is restricted to lowercase letters, digits, underscore and hyphen.

**[2]** Signing and verifying. NUT-00: the secret is a 33-byte compressed secp256k1 key, and mints reject any other form. B′, C′, C and K must be canonical, not the identity, and in the prime-order subgroup. NUT-12: no dleq field on v3.

**[3]** Spending, rotation and derivation. NUT-03: every v3 input carries a witness over its input digest, and versions mix within one swap. NUT-02: new outputs use active keysets; inactive proofs stay valid inputs. NUT-13: blinding factors are rejection-sampled, and the secret is the public key of a derived key.

## Background

- **Length framing (len32)**: each field is preceded by its length as a 4-byte big-endian integer, so different field boundaries always give different bytes.
- **final_expiry**: an optional time after which the mint may drop the keyset's spent-state records. v2 IDs commit it; v3 IDs do not.
- **Canonical, not identity, prime-order subgroup**: every point has exactly one accepted encoding; the neutral point is rejected; points with small-order components are rejected.
- **Witness over the input digest (NUT-10)**: a BIP-340 Schnorr signature over a hash that binds this input to the whole transaction. On the key path it is made by the secret's own key; on a script path by the keys of a leaf the secret commits to.
- **Active keyset**: a keyset the mint still signs new outputs with. Inactive keysets only accept inputs.
- **NUT-13 derivation**: deterministic wallets derive secrets and blinding factors from a seed. On v3 the derived value is a private key whose public key is the secret, and the blinding factor is rejection-sampled below `BLS_FR_ORDER`.

## Speaker note

- These rules are from nuts#443, the v3 specification pull request. Say "specified". The unit regex `[a-z0-9_-]+` applies to v2 and v3 IDs alike.
