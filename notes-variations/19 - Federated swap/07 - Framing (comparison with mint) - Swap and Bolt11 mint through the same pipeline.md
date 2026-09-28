# 19.07 · Swap and Bolt11 mint through the same pipeline

Variation 7 of slide 19 (Federated swap) · lens: Framing: comparison with mint · deck `fcv-c-ordering` page 33 · 3 steps · script 140 words, about 60 s

## Script

Swap and Bolt11 mint through the same pipeline.

**[1]** A swap is one consensus operation. A mint is 2 + q: MintQuote, one MintQuotePayment per observation, and Mint; with q = 4, six. A swap goes to every member with the same body. A mint quote is created on the first healthy member; status polls and the mint request go to every member.

**[2]** A swap is unique through its input proofs, checked at apply: a second spend gets TokenAlreadySpent. A mint is unique through its quote ID, the conflict key Mint quote. A swap needs no outside fact. A mint needs the payment, observed by each member; it counts as paid after q observations.

**[3]** Both end the same way: shares for the outputs of the accepted operation. In production q ≥ c. With one development observer, a mint takes three operations.

## Background

- **Bolt11**: the Lightning invoice format.
- **q (payment observation quorum)**: how many members must independently observe the payment before the quote counts as paid. Production requires q ≥ c.
- **MintQuotePayment**: one member's observation of the payment, ordered as its own operation. Each observer has its own conflict key.
- **Fact from outside**: information the members cannot derive from the log, here whether a Lightning payment arrived. Each member checks its own payment backend.
- **Development observer**: a test setup with one observing member, giving MintQuote, one MintQuotePayment and Mint.
- **Conflict key `Mint { quote }`**: at most one output set per quote is issued.
