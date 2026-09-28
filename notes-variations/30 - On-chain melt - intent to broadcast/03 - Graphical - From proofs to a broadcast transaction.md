# 30.03 · From proofs to a broadcast transaction

Variation 3 of slide 30 (On-chain melt - intent to broadcast) · lens: Graphical · deck `fcv-e-membership-custody` page 37 · 5 steps · script 111 words, about 50 s

## Script

A melt from eCash to an on-chain payment, with five members.

**[1]** The wallet sends its proofs. They enter consensus as a Melt operation and are reserved.

**[2]** A proposal appears, drawn dashed: one federation input, a payment output and a change output. It is not signed yet.

**[3]** All five members check it. Each check mark is one member's own recomputation of inputs, outputs, fee and sighashes.

**[4]** Three of the five, m1, m3 and m4, run FROST signing. The proposal turns solid: a transaction with one Schnorr signature per input.

**[5]** The signed bytes are recorded through consensus first. Only then are they sent to the Bitcoin network. Any retry sends the same bytes.

## Background

- **Melt operation**: the consensus operation that accepts the melt request and reserves the proofs before any payment.
- **Proposal**: the exact unsigned transaction, submitted as a consensus operation by any member.
- **Recomputation**: each member derives txid, fee, value balance and sighashes from the proposal itself instead of trusting the proposer.
- **FROST signing**: two rounds. Signers first exchange nonce commitments, then produce signature shares; a coordinator aggregates them into one signature.
- **TransactionSigned**: the consensus operation that records the signed bytes. A broadcast intent follows, and only those bytes may be broadcast.
