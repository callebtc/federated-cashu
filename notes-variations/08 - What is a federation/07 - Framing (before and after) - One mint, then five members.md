# 08.07 · One mint, then five members

Variation 7 of slide 08 (What is a federation) · lens: Framing: before and after · deck `fcv-a-bls` page 9 · 3 steps · script 131 words, about 55 s

## Script

A standalone v3 mint against a five-member federation with threshold 3.

**[1]** The standalone mint: one scalar k per amount on one server. It signs when the request is valid. The wallet talks to one URL. A quote is paid when the payment backend reports it. Its public key is K = k·G₂.

**[2]** The federation: members hold shares kᵢ, and any three shares interpolate k·B′. Members sign only when the operation is accepted in the consensus order. The wallet talks to all five public URLs and aggregates. A quote is paid when at least four members report matching observations.

**[3]** The last three rows do not change. The public key has the same form; after a DKG no machine holds k. The proof and its check are unchanged; a receiver needs nothing federation-specific.

## Background

- **v3 keyset**: a keyset whose ID starts with byte 02. It uses BLS12-381: public keys K = k·G₂ are 96-byte points, signatures are 48-byte points, and proofs are verified with a pairing.
- **Interpolation**: combining t shares with Lagrange weights; any three of the five shares give the same k·B′.
- **DKG (distributed key generation)**: the members create the key jointly. Each ends up with a share kᵢ; the full k is never computed on any machine. The aggregate public key K is published.
- **Matching observations**: each member queries its own view of the payment. The quote counts as paid when q ≥ 4 of these reports agree.
- **Why a receiver sees no difference**: the federation publishes one aggregate key per amount, in an ordinary v3 keyset. A proof from the federation is a pair (x, C) that verifies against K like a proof from a single mint.
