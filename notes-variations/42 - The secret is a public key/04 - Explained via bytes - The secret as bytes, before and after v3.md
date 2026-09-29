# 42.04 · The secret as bytes, before and after v3

Variation 4 of slide 42 (The secret is a public key) · lens: Explained via bytes · deck `fcv-h-nutroot-tree` page 6 · 5 steps · script 139 words, about 60 s

## Script

The bars are drawn to scale.

**[1]** On v1 and v2 keysets a secret is a string. A random secret is 64 hex characters, and it is hashed as those 64 UTF-8 bytes.

**[2]** A JSON secret grows with its policy. The P2PK example in NUT-11 is 195 bytes, the HTLC example in NUT-14 is 323 bytes.

**[3]** On v3 keysets the secret is always a 33-byte compressed point, with or without conditions.

**[4]** Byte 0 is 02 or 03, the parity of y. Bytes 1 to 32 are the x-coordinate. It is the refund vector's secret, 02d310a4…. Y is hashed over the 33 decoded bytes, not the hex text.

**[5]** The key-path witness is one 64-byte BIP-340 signature: the 32-byte x-coordinate of the nonce point R, then the 32-byte scalar s. In the witness JSON that is 128 hex characters, bare or tweaked.

## Background

- **Pre-v3 hashing**: for keysets `00` and `01`, Y = hash_to_curve(secret) on secp256k1, over the UTF-8 bytes of the string. 64 hex characters are 64 bytes of input, although they encode 32 random bytes.
- **NUT-10 JSON secret**: `["P2PK", {"nonce", "data", "tags"}]`. The mint parses it on every spend. 195 and 323 bytes are the compact JSON of the spec examples; real secrets vary with their tags.
- **Parity of y**: for each x on the curve there are two y values; the prefix 02 marks the even one, 03 the odd one.
- **BIP-340 signature (R.x, s)**: the signer picks a nonce r, R = r·G, and computes s = r + e·d mod n, where e is a hash of R.x, the public key and the message. The verifier checks s·G = R + e·P.
- **Hex**: two characters per byte, so 33 bytes are 66 characters and 64 bytes are 128.

## Speaker note

- The 195 B and 323 B values are the compact JSON of the NUT-11 and NUT-14 example secrets (recounted). They are examples, not fixed sizes.
