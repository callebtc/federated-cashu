# 19.01 · Agree on the order, then sign

Variation 1 of slide 19 (One order, replicated) · lens: Beginner · deck `fcv-c-ordering` page 19 · 5 steps · script 127 words, about 55 s

## Script

Three members. Two requests for the same quote reach different members.

**[1]** m1 receives a mint for quote q with outputs A and B. m3 receives a mint for the same quote with outputs B and C.

**[2]** Neither member signs. Both requests go into consensus. Consensus is the protocol by which the members agree on one list of operations in one order.

**[3]** Every member receives the same list. Entry 1 is the first to use quote q, so every member accepts it.

**[4]** Entry 2 uses quote q again. Every member rejects it, for the same reason, because every member reads the same list and applies the same rules.

**[5]** Members sign only the outputs of entry 1. A and B get three shares each. C never gets a share.

## Background

- **Consensus**: a protocol that makes all honest members output the same ordered list, even when requests arrive at different members in different orders. The federation uses AlephBFT.
- **Entry**: one position in that list. Entry 1 is processed before entry 2 at every member.
- **Deterministic rules**: each member applies each entry with the same code to the same prior state, so every member reaches the same verdict.
- **Rejected at apply**: entry 2 finds quote q already issued by entry 1, so it produces no shares.
