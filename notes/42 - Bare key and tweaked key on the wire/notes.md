# 42 · Bare key and tweaked key on the wire

2.3 Nutroot secrets · 5 steps · script 105 words, about 45 s

## Script

How a script ends up inside the key.

**[1]** Start with a private key k and its public key K.

**[2]** The scripts are hashed into a small tree. Its root, together with K, gives a number t: the tweak.

**[3]** Adding the tweak to the key gives a tweaked key P. That is the secret of a token with scripts.

**[4]** A token without scripts uses K directly. On the wire, both are 33-byte public keys and cannot be told apart.

**[5]** The mint hashes the 33 bytes to the curve, the same way for both, and a spend by key path is one ordinary signature in either case.

## Background

- **Tweak**: t = tagged_hash("Cashu_NutrootTweak", K ‖ root), taken modulo the curve order. P = K + t·G.
- **Why the holder can still sign**: the private key of P is k + t, which the holder can compute.
- **Hex values on the slide**: from the spec's test vectors (nuts#443, `tests/10-tests.md`).
- **hash_to_curve_G1**: the mint's step for v3 keysets that maps the 33 secret bytes to a point for the BLS signature.
