# 42 · The secret is a public key

2.3 Nutroot secrets · 3 steps · script 139 words, about 60 s

## Script

For v1 and v2 keysets the secret is a string: 64 hex characters of randomness, or a NUT-10 JSON document.

**[1]** For v3 keysets, every secret is a 33-byte compressed secp256k1 point, 66 hex characters. Mints reject any other form. The mint hashes those 33 bytes to G₁.

**[2]** Without conditions the secret is a public key K = k·G. With conditions it is P = K + t·G, where the tweak t commits to a tree of conditions, following BIP341 with Cashu-specific tags.

**[3]** A bare K and a tweaked P look the same on the wire, and a key-path spend of a locked proof is byte-identical to a bare-key spend. The mint learns that conditions exist only when a script path is used. Pre-v3 and v3 proofs cannot collide: their Y values are on different curves, secp256k1 and BLS12-381 G₁.

## Background

- **Compressed point**: a public key written as a prefix byte (02 or 03, the parity of y) plus the 32-byte x-coordinate, 33 bytes in total.
- **Two curves in one proof**: the secret is a secp256k1 key, used for BIP-340 witness signatures. The mint's blind signature is BLS on BLS12-381. The 33 secret bytes are hashed into G₁ for the BLS part.
- **"Mints reject any other form"**: on a v3 keyset, a string secret or an invalid point is not accepted.
- **Y**: the hashed secret, which the mint stores to mark a proof spent.
