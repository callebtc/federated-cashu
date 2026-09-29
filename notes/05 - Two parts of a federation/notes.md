# 05 · Two parts of a federation

Setting · 2 steps · script 108 words, about 45 s

## Script

A federation is more than a signature scheme.

**[1]** The first part is cryptography: threshold signatures. Any t of the n members can produce a signature, and no member holds the whole key. That covers issuing ecash.

**[2]** The second part is state. A mint is a state machine: quotes get paid, proofs get spent, outputs get signed. In a federation, every member must observe the same facts, for example that a Lightning invoice was paid, and apply the same rules in the same order. Those rules are enforced through consensus. Several sections of this talk are about this second part: how state advances when no single member is trusted.

## Background

- **State machine**: a system whose data changes only through defined transitions, such as "quote unpaid → paid → issued" or "proof unspent → spent".
- **Consensus rules**: the checks every member applies to an operation before it changes state. Because all members apply the same rules to the same ordered operations, they end in the same state.
- **Quorum**: the number of members that must agree on an observation, such as a payment, before it counts.
