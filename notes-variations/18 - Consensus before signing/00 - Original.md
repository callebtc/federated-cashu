# 18 · Consensus before signing

Original slide, deck `fcv-c-ordering` page 18 (main deck slide 18). Same text as `notes/18 - Consensus before signing/notes.md`.

1.3 Ordering · 5 steps · script 125 words, about 55 s

## Script

**[1]** Members no longer sign on receipt. They submit the envelope to consensus.

**[2]** AlephBFT produces one total order that all honest members agree on. Operation 41, outputs A and B, is applied: the quote is marked issued.

**[3]** Operation 42 targets the same quote and fails at apply, because the quote is already issued.

**[4]** Only after that do members sign, and only the outputs of accepted operations. Each share is bound to its operation ID.

**[5]** Three details. Conflict keys are the mint and melt quote IDs. Swaps have no conflict key: the proof store at apply time is the spend lock. Replay is idempotent: the same operation yields the same state and the same shares. And t may be lower than c only because signing follows ordering.

## Background

- **Total order**: every member processes the same operations in the same sequence, so every member computes the same state.
- **Apply**: the deterministic step that executes an ordered operation against the member's database, for example marking a quote issued or proofs spent.
- **Conflict key**: a value two operations must not share. For mints and melts it is the quote ID. A member refuses to queue a second operation whose conflict key is held by a pending one (`ConflictingOperation`, `cdk-common/src/federation/consensus.rs`). A conflicting mint that is ordered anyway, for example after the first one finalized or when submitted through another member, fails at apply because the quote is already issued (`IssuedQuote`). The slide shows that second case.
- **Spend lock**: marking input proofs spent at apply time. A second swap with the same inputs finds them spent and fails.
- **Why t < c is safe**: an honest member only returns a share for an operation that consensus accepted. Getting an operation accepted needs c members, so t signers alone cannot issue anything the federation did not order.
