# 51 · Spend info and receive-time checks

2.4 Using nutroot · 4 steps · script 142 words, about 60 s

## Script

**[1]** A token entry may carry spend info: what the next holder needs that the proof does not say. k, a bearer private key; E, an ephemeral public key for NUT-28; K, the internal key; tree, the full leaves; u, the NUMS offset. k and E exclude each other, and u is present exactly for NUMS keys. A locked proof needs the tree even for a key-path spend, because the tweak needs the root. Spend info is fund-critical.

**[2]** On receive, check one: the disclosed data must compute the secret. A tree that computes it is provably complete.

**[3]** Check two: the wallet can spend it, and every leaf meets its policy, for example a minimum refund horizon.

**[4]** Then sweep to seed-derived secrets: the sender knows a bearer k, E is not seed-recoverable, and a disclosed tree may leave the key path to someone else.

## Background

- **Spend info**: data sent with a token to the receiver, never to the mint. JSON field `spend_info`; in a V4 token the CBOR map `si` with short keys k, e, i, t, u.
- **Provably complete**: the secret commits to the root, and the root commits to every leaf. If the disclosed leaves reproduce the secret, no additional hidden leaf can exist.
- **Refund horizon**: how far in the future a refund leaf unlocks. A receiver can reject a token whose sender could reclaim it too soon.
- **Sweep**: swap received proofs for new proofs with the receiver's own keys, so nobody else can spend them.
- **Seed-recoverable (NUT-13)**: proofs whose keys derive from the wallet seed can be restored from the seed alone.
