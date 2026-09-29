# removed.07 · One mint vs a federation: the same wallet calls

Variation 7 of slide removed (Bolt11 mint, federated) · lens: Framing: before and after · deck `fcv-d-flows-dkg` page 9 · 4 steps · script 138 words, about 60 s

## Script

The Bolt11 mint calls of NUT-04 and NUT-23, against one mint and against a federation of n members.

**[1]** Create. One mint creates an invoice and stores the quote. A federation wallet tries one member at a time; the accepting member's MintQuote goes through consensus, and the wallet checks that t members see it.

**[2]** Payment. One mint's backend marks the quote paid. In a federation each member checks its own backend and submits an observation; paid after q matching ones.

**[3]** Status. One mint gives one response. A federation answers from all n; the wallet accepts t identical responses.

**[4]** Mint. One mint returns C′ = k·B′ per output. In a federation the Mint is ordered, locked on the quote ID; each member returns kᵢ·B′, and the wallet checks and interpolates t shares. The calls and the resulting proofs are unchanged.

## Background

- **NUT-04 / NUT-23**: NUT-04 defines minting with a quote; NUT-23 specialises it for Bolt11 invoices, with the routes on the slide.
- **Federated connector**: `FederatedMintConnector` in the wallet. It implements the normal mint-connector interface, fans requests out to the members and returns ordinary Cashu responses, so the rest of the wallet is unchanged.
- **Identical responses**: compared after setting `updated_at` to zero, since each member sets its own timestamp.
- **Interpolation**: Lagrange interpolation of t shares kᵢ·B′ gives k·B′, the same blind signature a single mint with key k would return.
- **Observation quorum q**: between c and n; a single member cannot mark a quote paid.
