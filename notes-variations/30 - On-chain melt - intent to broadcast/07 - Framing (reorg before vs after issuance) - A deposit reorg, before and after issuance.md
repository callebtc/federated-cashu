# 30.07 · A deposit reorg, before and after issuance

Variation 7 of slide 30 (On-chain melt - intent to broadcast) · lens: Framing: reorg before vs after issuance · deck `fcv-e-membership-custody` page 41 · 4 steps · script 131 words, about 55 s

## Script

The same reorg, before and after the federation issued ecash for a deposit.

**[1]** Before issuance: a deposit is observed and confirmed by q members at the required depth. Then its block is disconnected.

**[2]** When q members report the reorg, the UTXO moves to Reorged and a new observation epoch starts. The quote stays unpaid, and members observe the deposit again. No ecash was issued, so nothing has to be undone.

**[3]** After issuance: the deposit was spendable, a MintQuotePayment quorum marked the quote paid, and ecash was issued. Then the block disconnects and q members report it. The federation raises a sticky liability alarm. It does not unmint.

**[4]** One member's reorg report is diagnostic only. The Reorged transition needs the same observer quorum as spendability. Conflicting evidence moves a UTXO to Quarantined.

## Background

- **Reorg**: the chain switches to a competing branch, and a block that contained the deposit is no longer in the best chain.
- **Observation epoch**: a counter per deposit output. Observations from an old epoch are ignored after a reorg, so members must confirm the deposit again.
- **Liability**: the ecash issued against a deposit. Before issuance a reorg only delays the quote; after issuance the ecash exists and cannot be revoked.
- **Liability alarm**: a sticky flag on the UTXO for operators; it halts on-chain payment of that quote. There is no automatic unminting.
- **UTXO states**: Observed (seen without a block), Confirmed (below depth or quorum), Spendable (depth and quorum met), Reserved (by an accepted proposal), Spent, Reorged, Quarantined (conflicting evidence, operator review).
- **MintQuotePayment**: the consensus operation that records payment observations for a mint quote.
