# 20.05 · The same flow at member m2

Variation 5 of slide 20 (Bolt11 mint, federated) · lens: Perspective: member m2 · deck `fcv-d-flows-dkg` page 7 · 6 steps · script 133 words, about 55 s

## Script

The same flow from member m2, which never received the quote request. Four lifelines: the wallet, m2, consensus, and m2's own payment backend.

**[1]** m2 learns quote q1 from consensus, as a MintQuote item that m1 submitted.

**[2]** The wallet asks m2 for the status. m2 answers from its consensus-applied state: unpaid. The same request also makes m2 probe its backend.

**[3]** m2's backend reports the payment. m2 submits its own MintQuotePayment item: one observation.

**[4]** The quote turns paid in m2's state only after q matching observations are accepted.

**[5]** The wallet sends the mint request with its blinded outputs B′. m2 waits until the quote is paid in its own state. The Mint item, locked on q1, is ordered and accepted.

**[6]** Only then does m2 return its share, C′₂ = k₂·B′, for exactly the accepted outputs.

## Background

- **Applied state**: the member's database after it has executed the ordered consensus items. m2 knows q1 only because the MintQuote item was ordered and applied.
- **Observation**: a MintQuotePayment item with what m2's own backend saw. m2 does not trust m1's report or anyone else's.
- **Probe on status request**: a status request triggers a backend check before the answer, subject to a short per-quote cooldown.
- **Lock q1**: the quote ID is the conflict key of Mint; a later Mint with other outputs fails when the quote is already issued.
- **Share C′₂ = k₂·B′**: m2's key share times the blinded output. It is signed when m2 applies the accepted Mint.

## Speaker note

- Step 5 shows m2 submitting the Mint. In the code, one member chosen by a rank derived from the operation ID publishes it; the others, possibly including m2, wait for its result and publish only as a fallback (crates/cdk-axum/src/federation/wallet_operation_publisher.rs). m2 still signs when it applies the accepted Mint.
