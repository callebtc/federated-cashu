# 21.07 · Fan-out without a private plane

Variation 7 of slide 21 (Network topology) · lens: Framing: failure mode · deck `fcv-d-flows-dkg` page 17 · 4 steps · script 137 words, about 60 s

## Script

Three members, t = 2, and a mint quote paid for two outputs. The wallet sends each member a different pair: A and B to m1, B and C to m2, C and A to m3.

**[1]** Left: only the public plane. Each member checks that its pair matches the paid amount and signs it.

**[2]** Each output now has two shares: A from m1 and m3, B from m1 and m2, C from m2 and m3. With t = 2 that is three valid signatures for a quote that paid for two.

**[3]** Right: each request becomes an envelope submitted to consensus, and all members see the same order. The first Mint for quote q, outputs A and B, is accepted. The other two target the same quote and are rejected.

**[4]** Members return shares only for A and B.

## Background

- **Mix-and-match**: every member sees a valid request of the right size, but the union of the requests is larger than what was paid.
- **Envelope**: the canonical encoding of one request: federation, operation kind, quote, outputs. Its SHA-256 hash is the operation ID.
- **Conflict key**: for mints and melts, the quote ID. The second operation with the same quote ID fails at apply, because the quote is already issued.
- **Why ordering fixes it**: all members apply the same operations in the same order, so they all accept the same first Mint and sign only its outputs.
