# 19 · Consensus before signing

1.3 Ordering · 4 steps · script 114 words, about 50 s

## Script

**[1]** Members no longer sign on receipt. Each request becomes an envelope, and its hash is the operation ID. Members submit the envelope to consensus. An exact retry has the same ID and joins the same operation.

**[2]** AlephBFT produces one order that every honest member agrees on. Operation 41, outputs A and B, is applied: the quote is marked issued.

**[3]** Operation 42 uses the same quote and fails when applied, because the quote is already issued.

**[4]** Only then do members sign, and only the outputs of accepted operations. Each share is bound to its operation ID. This is also why t can be lower than c: a signature always needs an operation that consensus accepted.

## Background

- **Operation ID**: SHA-256 of the canonical request envelope (federation, kind, quote or inputs, outputs). A different output set is a different operation.
- **Total order**: every member processes the same operations in the same sequence, so every member computes the same state.
- **Apply**: the deterministic step that executes an ordered operation against the member's database.
- **Conflict key**: a value two operations must not share; for mints and melts, the quote ID. A member refuses to queue a second operation whose key is held by a pending one (`ConflictingOperation`). A conflicting mint that is ordered anyway fails at apply (`IssuedQuote`). Swaps have no conflict key; marking proofs spent at apply is the lock.
- **Idempotent replay**: replaying the same operation yields the same state and the same shares.
