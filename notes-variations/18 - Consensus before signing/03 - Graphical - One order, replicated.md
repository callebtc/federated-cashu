# 18.03 · One order, replicated

Variation 3 of slide 18 (Consensus before signing) · lens: Graphical · deck `fcv-c-ordering` page 21 · 4 steps · script 115 words, about 50 s

## Script

One order, replicated at every member.

**[1]** Two envelopes for the same quote, one with outputs A and B, one with B and C, go into AlephBFT. AlephBFT is the consensus library the members run. It outputs one ordered log.

**[2]** The log is replicated at every member: entry 41 is A and B, entry 42 is B and C, in that order at m1, m2 and m3.

**[3]** Every member applies the log in order and reaches the same verdicts. Entry 41 is accepted. Entry 42 is rejected, because the quote is already issued.

**[4]** Only entry 41 produces shares. Each member sends its shares to the wallet. A and B have three shares each; C has none.

## Background

- **AlephBFT**: a Rust library implementing asynchronous Byzantine fault tolerant consensus. Honest members output the same ordered items; correctness does not depend on message timing.
- **Envelope**: the canonical encoding of one request, identified by its operation ID.
- **Replicated log**: every member stores the same entries at the same indices, 41 and 42 here.
- **Deterministic apply**: the same entries applied in the same order to the same state give the same result at every member.
