# 28.05 · One CLN node under a federated issuer

Variation 5 of slide 28 (Funding backends) · lens: Framing: failure mode · deck `fcv-e-membership-custody` page 23 · 4 steps · script 124 words, about 55 s

## Script

A federated issuer on top of one CLN node run by one operator.

**[1]** A wallet asks for a mint quote. A member asks the node for an invoice, and the node returns one.

**[2]** The node reports the invoice as paid, but nothing arrived. Each of the three members queries the same node and records the same observation. The observation quorum, q equals 3, is reached from one source, and the federation issues eCash without reserves.

**[3]** A wallet melts. The members agree through consensus to pay invoice X. The node pays invoice Y instead, or pays nothing.

**[4]** The node's operator moves the reserves wherever they choose. Consensus among the members constrains what the members sign. It does not constrain a key they do not hold.

## Background

- **Mint quote**: a request to mint eCash; the mint returns a Lightning invoice to pay (NUT-04).
- **Observation**: a member's report of a payment's status, submitted to consensus. A quote is marked paid after q matching observations.
- **One source**: all three observations come from the same node, so they are three copies of one claim, not three independent checks.
- **Melt**: redeeming eCash for an outgoing payment made by the mint (NUT-05).
- **Invoice X vs. Y**: consensus fixes which invoice should be paid, but the node that holds the key executes the payment and can deviate.
