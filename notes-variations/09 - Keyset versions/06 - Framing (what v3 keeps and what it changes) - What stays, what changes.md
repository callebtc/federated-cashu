# 09.06 · What stays, what changes

Variation 6 of slide 09 (Keyset versions) · lens: Framing: what v3 keeps and what it changes · deck `fcv-a-bls` page 40 · 3 steps · script 135 words, about 60 s

## Script

**[1]** Unchanged: the endpoints and the message shapes. BlindedMessage has amount, id and B_; BlindSignature has amount, id and C_; Proof has amount, id, secret and C. Keyset IDs stay 33 bytes as in v2. One key per amount, rotation through active and inactive keysets, and the spent set of Y values.

**[2]** Changed on v3: K is in G₂, 96 bytes; B′, C′ and C are in G₁, 48 bytes. Hashing uses hash_to_curve_G1; blinding is r·Y, unblinding r⁻¹·C′. Verification is a pairing with K; DLEQ is removed. The ID preimage is binary, length-framed, without expiry. Secrets are 33-byte points, and every input carries a witness. V4 tokens carry spend info, si, for v3 proofs. CDK federates only v3 keysets.

**[3]** A client that only parses the JSON sees the same fields, with longer values on another curve.

## Background

- **BlindedMessage, BlindSignature, Proof**: the three NUT-00 JSON objects for outputs, mint responses and inputs. Their field names do not change on v3.
- **Short keyset ID**: the first 8 bytes of the 33-byte ID, allowed in V4 tokens.
- **Double-spend protection**: the mint records Y = hash-to-curve(secret) for every spent proof and rejects a repeat. On v3, Y is a G₁ point, so v3 and pre-v3 Y values cannot collide.
- **Spend info (si)**: data a V4 token carries so the next holder of a v3 proof can spend it, for example the internal key and the condition tree. Wallets must preserve it.
- **Witness**: on v3 every input carries a BIP-340 Schnorr signature over its input digest (NUT-03, NUT-10).

## Speaker note

- The slide also lists "the short ID is the first 8 bytes" under unchanged; the script leaves it out for time. Source: NUT-00, Short keyset ID.
