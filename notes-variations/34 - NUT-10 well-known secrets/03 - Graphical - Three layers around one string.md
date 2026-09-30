# 34.03 · Three layers around one string

Variation 3 of slide 34 (NUT-10 well-known secrets) · lens: Graphical · deck `fcv-g-json-taproot` page 5 · 5 steps · script 132 words, about 55 s

## Script

The figure builds a P2PK proof from the inside out.

**[1]** Innermost is the JSON array: the kind P2PK, then nonce, data and tags.

**[2]** The array is serialized into one string, the secret, here 195 bytes. From this point on, the secret is these bytes, not a JSON value.

**[3]** The string sits inside the proof JSON, next to C, id, amount and witness. There every quote is escaped a second time with a backslash.

**[4]** The mint hashes the bytes of the string to a curve point, Y = hash_to_curve(secret), and checks that k·Y equals C, where k is its private key for the amount.

**[5]** The same bytes go through SHA-256. The receiver signs that digest with a 64-byte Schnorr signature, and the signature goes into the witness field. One string feeds both checks.

## Background

- **hash_to_curve (pre-v3 NUT-00)**: maps bytes to a secp256k1 point with unknown private key: `msg_hash = SHA256("Secp256k1_HashToCurve_Cashu_" ‖ secret)`, then `SHA256(msg_hash ‖ counter)` for counter 0, 1, … until the result is a valid x-coordinate.
- **k·Y = C**: the pre-v3 redemption check. The mint recomputes Y from the secret and multiplies by its private key k.
- **JSON escaping**: to put a JSON text inside a JSON string, each `"` becomes `\"`. The proof carries JSON inside a string inside JSON.
- **SHA-256 digest**: the 32-byte hash that the BIP340 signature is computed over.
- **Witness**: a JSON string `{"signatures": [...]}`, escaped the same way inside the proof.
