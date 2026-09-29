# 30.04 · The accepted transaction as a state machine

Variation 4 of slide 30 (On-chain melt - intent to broadcast) · lens: Explained via state machine · deck `fcv-e-membership-custody` page 38 · 5 steps · script 130 words, about 55 s

## Script

The accepted transaction is a state machine, and each transition is a consensus operation or an accepted observation. The payment intent starts Pending.

**[1]** An accepted TransactionProposal creates the transaction in state Accepted. The intent moves to Accepted with that proposal ID.

**[2]** TransactionSigned persists the exact signed bytes: state Signed.

**[3]** TransactionBroadcastIntent authorizes broadcast of those bytes: BroadcastPending. Any ready member can now send them.

**[4]** A success-equivalent broadcast observation moves it to Broadcast.

**[5]** When the settlement policy is met, depth and distinct observers, it is Confirmed and the intent is Completed with the txid. Two side states keep the inputs reserved: Replaced, when a replacement proposal is accepted, and Abandoned, when another candidate of the batch confirmed. The Cashu melt finalizes on a paid MeltQuotePayment quorum; a failed quorum rolls it back.

## Background

- **Payment intent**: the on-chain payment a melt requires. States: Pending (eligible for batching), Accepted (owned by one proposal), Completed (confirmed txid), Failed.
- **Success-equivalent broadcast observation**: a member's broadcast result that proves success: the backend accepted the transaction, already knew it, or reports it confirmed.
- **Settlement policy**: a versioned rule for when a transaction counts as confirmed: a minimum confirmation depth reported by enough distinct members.
- **Replaced { by }**: a replacement proposal for the same payments, for example with a higher fee, was accepted. The old transaction may still confirm, so its inputs stay reserved.
- **Abandoned**: another candidate transaction for the same batch confirmed. Inputs also stay reserved.
- **MeltQuotePayment quorum**: matching payment observations from enough members. Paid finalizes the melt (inputs spent, quote paid, change signed); failed rolls back the reservation.
