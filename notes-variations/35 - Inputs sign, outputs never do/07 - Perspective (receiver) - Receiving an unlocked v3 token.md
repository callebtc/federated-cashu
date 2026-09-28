# 35.07 · Receiving an unlocked v3 token

Variation 7 of slide 35 (Inputs sign, outputs never do) · lens: Perspective: receiver · deck `fcv-f-client-intent` page 35 · 4 steps · script 140 words, about 60 s

## Script

The receiver's side of an unlocked v3 token, using the bearer V4 vector.

**[1]** The token entry carries amount, keyset ID, the secret 02e6e7cf, C, and spend info holding k, the bearer private key, 47196dc0. There is no witness: tokens never carry one.

**[2]** Check 1: the spend info must reconstruct the secret. There is no tree, so k·G must equal the secret, and it does.

**[3]** Check 2: the wallet can spend it, because it holds the key path, k. Recommended: check C by the pairing, with no mint round-trip.

**[4]** Then sweep: swap to the wallet's own seed-derived secrets, signing with k. The sender holds the same scalar, and a bearer scalar can conceal a tweaked tree. In a V4 token, spend info is the CBOR map si with key k. A derived key must not be re-gifted as a bearer k.

## Background

- **Spend info**: data carried with a token entry for the next holder, never sent to the mint. Fields: k (bearer key), E (ephemeral key, NUT-28), K (internal key), tree, u (NUMS offset).
- **Tree**: the set of condition leaves a secret may commit to. With no tree, the secret is the bare key K = k·G.
- **Concealed tree**: a sender could hand over p′ = k + t as "k" for a secret P = K + t·G that commits leaves the receiver never sees, such as a refund to the sender. p′·G = P passes check 1. Sweeping to fresh secrets removes any such path, and the sender's copy of k.
- **Pairing check**: verifies C against the keyset's public key with a BLS12-381 pairing equation, without contacting the mint.
- **Re-gift rule**: a key derived from E must not be passed on as k, because the original sender knows the blinding tweak and could recover the receiver's static key. k and E are mutually exclusive in spend info.
- **V4 token**: the CBOR-encoded `cashuB` format; `si` is its spend-info map.

## Speaker note

- k·G was recomputed and equals the secret 02e6e7cf…a29b. Specified in cashubtc/nuts#443; not implemented on the federation branches.
