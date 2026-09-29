# 37.01 · Plain secret and locked secret

Variation 1 of slide 37 (NUT-10 well-known secrets) · lens: Beginner · deck `fcv-g-json-taproot` page 3 · 5 steps · script 139 words, about 60 s

## Script

A Cashu proof has an amount, a keyset id, a secret, and C, the mint's signature on the secret. The mint checks C and that the secret is unspent.

**[1]** In a plain NUT-00 proof the secret is 32 random bytes, 64 hex characters. Whoever holds the proof can spend it.

**[2]** A locked NUT-11 proof has the same fields; its secret is a JSON text naming a rule.

**[3]** kind names the rule, here P2PK, pay to public key. nonce keeps the secret unique. data is the receiver's public key. tags hold options.

**[4]** The receiver signs the secret string; the signature goes in the witness. The mint adds a third check: a valid signature by the data key.

**[5]** The mint enforces this only if it supports the kind, listed in its NUT-06 info. Otherwise anyone holding the proof can spend it.

## Background

- **Proof (NUT-00)**: the object a wallet holds: `amount`, keyset `id`, `secret`, and `C`. On pre-v3 keysets C = k·Y, where k is the mint's private key for that amount and Y = hash_to_curve(secret) is a point on secp256k1.
- **Keyset id**: identifies the set of mint keys that signed the proof. Its first byte is the keyset version; `009a1f29…` is version `00`.
- **NUT-10 well-known secret**: the format `[kind, {nonce, data, tags}]` serialized into the `secret` string.
- **P2PK (NUT-11)**: pay to public key. The proof needs a Schnorr signature by the key in `data`.
- **Schnorr signature (BIP340)**: a 64-byte signature. NUT-11 signs the SHA-256 of the secret string.
- **Witness**: an extra proof field, itself a JSON string, here `{"signatures": [...]}`.
- **NUT-06 info**: the mint's `GET /v1/info` endpoint. Support for P2PK appears as `"11": {"supported": true}`.
- **Anyone-can-spend**: a proof that needs only its secret and a valid C, as in NUT-00.

## Speaker note

- The plain proof is the pre-v3 NUT-00 example proof (also used in CDK's `nut00` tests); the locked proof is the NUT-11 basic example. JSON secrets apply only to keysets with version byte `00` or `01`; keysets `02` and later reject any non-point secret (NUT-10).
