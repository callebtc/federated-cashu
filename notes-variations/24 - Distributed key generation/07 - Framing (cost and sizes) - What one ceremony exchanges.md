# 24.07 · What one ceremony exchanges

Variation 7 of slide 24 (Distributed key generation) · lens: Framing: cost and sizes · deck `fcv-d-flows-dkg` page 25 · 4 steps · script 136 words, about 60 s

## Script

What one ceremony exchanges for a full keyset. A, the number of amounts, is 64, the per-keyset maximum; each member samples one polynomial per amount.

**[1]** n·A polynomials: 192 for three members, 320 for five. Each has t coefficients, so n·A·t secret scalars, 960 for five, zeroized after evaluation.

**[2]** Each coefficient becomes a public G₂ point in the member's reveal: again 960 points. At 96 bytes per compressed point that is 92,160 bytes, about 92 KB.

**[3]** Private delivery: one message per sender and receiver, self included, so n² = 25, each carrying 64 scalars of 32 bytes. Each member checks n·A = 320 values against commitments.

**[4]** The closing rounds cost one message per member each: a hash, a transcript signature and an activation. Private traffic grows with n², public commitments with n·A·t. Every member stays online throughout.

## Background

- **A = 64**: the code limits a DKG keyset to 64 amounts and a federation to 64 members.
- **G₂ point, 96 bytes**: the compressed encoding of a BLS12-381 G₂ point. A scalar is 32 bytes.
- **n·A·t**: every member commits to t coefficients for each of the A amounts.
- **n²**: every ordered pair of sender and receiver, including a member sending to itself.
- **Commitment checks**: each member checks the value from each of the n senders, for each of the A amounts.

## Speaker note

- The totals are computed for the slide from the formulas. 92,160 B is raw point data counted once. On the wire each reveal is sent to every member inside a JSON request, so actual traffic is higher; a delivered share is encoded as 35 bytes (version, signer ID, scalar) rather than 32.
- "Hashes, transcript signatures, activations: n each" counts distinct items; each is sent to every member.
