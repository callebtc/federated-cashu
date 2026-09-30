# 39.01 · A secret made from a key pair

Variation 1 of slide 39 (The secret is a public key) · lens: Beginner · deck `fcv-h-nutroot-tree` page 3 · 5 steps · script 136 words, about 60 s

## Script

**[1]** Pick a private key k, a number from 1 to n − 1, where n is the order of the secp256k1 group. The spec vectors use small test keys; here k = 7.

**[2]** The public key is K = k·G. G is the fixed generator point of secp256k1, and k·G is G added to itself k times.

**[3]** A point is written in 33 bytes: one prefix byte for the parity of y, 02 here because y is even, then the 32-byte x-coordinate.

**[4]** Those 33 bytes, as 66 hex characters, are the proof's secret. The wallet hashes them to Y, a point in BLS12-381 G₁, for blind signing, as for any proof.

**[5]** To spend, the witness holds one BIP-340 signature by k over the input digest of the transaction. Only the holder of k can produce it.

## Background

- **Private key k and curve order n**: a private key is an integer modulo n, the number of points in the secp256k1 group (a 256-bit number). Any value from 1 to n − 1 is a valid key.
- **Generator G and k·G**: G is a fixed point defined by the secp256k1 standard. k·G is G added to itself k times. Computing K from k is fast; recovering k from K is infeasible (the discrete logarithm problem).
- **Compressed encoding**: for each valid x there are two points, one with even y and one with odd y. The prefix 02 (even) or 03 (odd) selects one, so 33 bytes describe the point. Key 7 is `025cbdf0…cac4f9bc`.
- **Y = hash_to_curve_G1(33 bytes)**: a deterministic map from bytes to a point in the G₁ group of BLS12-381 (the RFC 9380 suite with a Cashu domain tag). The mint blind-signs Y and stores it to mark the proof spent.
- **BIP-340 signature**: a Schnorr signature on secp256k1, 64 bytes, verified against the 32-byte x-coordinate of the public key.
- **Input digest**: the message each v3 input signs, a tagged hash of the transaction digest and that input's own ID, so the signature is valid only for this input of this transaction.

## Speaker note

- Key 7 is a public test key from `tests/10-tests.md` (the bearer example with no conditions). Its secret on the slide is the vector value.
- Transcript signing over the input digest is specified in nuts#443; neither federation branch implements it yet.
