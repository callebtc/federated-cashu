# removed.04 · Quote states and the items that move them

Variation 4 of slide removed (Bolt11 mint, federated) · lens: Explained as a state machine · deck `fcv-d-flows-dkg` page 6 · 4 steps · script 135 words, about 60 s

## Script

A Bolt11 quote for 8 sat as a state machine. NUT-04 responses carry amount_paid and amount_issued. One consensus item type moves each transition.

**[1]** No quote to unpaid: one MintQuote item, from the member that created the invoice. amount_paid is 0.

**[2]** Unpaid to paid: q matching MintQuotePayment items, one per observing member. amount_paid becomes 8.

**[3]** Paid to issued: one Mint item with the exact outputs and a conflict lock on the quote ID. amount_issued becomes 8.

**[4]** Wallet requests in each state. Create tries one member at a time. Unpaid: status says unpaid; a mint request waits, then PendingQuote. Paid: a mint is submitted, shares follow acceptance. Issued: the same outputs map to the same operation and its stored shares; other outputs are rejected. Too few observations, a mismatching observation or a second Mint cause no transition.

## Background

- **State from amounts**: CDK derives the state from the two amounts. Unpaid if both are 0, paid if amount_paid exceeds amount_issued, otherwise issued.
- **MintQuote item**: carries the quote ID, the backend lookup ID every member uses to observe the payment, the wallet's request and the proposing member's response.
- **Matching observations**: two MintQuotePayment items match when quote, method, state, amount_paid, amount_issued, payment ID and payment proof are equal. One that differs does not count towards q.
- **Conflict lock**: the quote ID is the conflict key of Mint. A second Mint with other outputs for an issued quote fails when it is applied.
- **Same outputs, same operation**: the operation ID is a hash of the canonical request, so a retry with identical outputs joins the existing operation and gets the stored shares back.
- **PendingQuote**: returned when the quote does not turn paid in the member's own state within the submission timeout.

## Speaker note

- The note says "States as CDK stores them". CDK stores amount_paid and amount_issued and derives the state from them (crates/cdk-common/src/mint.rs); NUT-23 marks `state` as deprecated.
- "A second Mint for the same quote" moves no state only when the quote is fully issued, as in this 8-sat example. With partial issuance (amount_paid above amount_issued), a second Mint with other outputs is signed and raises amount_issued. The journal does not reject the second Mint; it fails at apply.
