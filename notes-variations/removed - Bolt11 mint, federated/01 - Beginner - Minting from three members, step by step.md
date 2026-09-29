# removed.01 · Minting from three members, step by step

Variation 1 of slide removed (Bolt11 mint, federated) · lens: Beginner · deck `fcv-d-flows-dkg` page 3 · 6 steps · script 131 words, about 55 s

## Script

Three members. q, the number of matching payment reports needed, is 3. t, the number of shares or identical answers needed, is 2.

**[1]** The wallet asks m1 for a mint quote; m1 creates a Lightning invoice.

**[2]** m1 submits the quote to consensus, the members' shared, ordered log. All three store it as unpaid. The wallet waits until 2 members return it.

**[3]** The wallet pays. Each member checks its own payment backend and reports paid.

**[4]** 3 matching reports meet q: the quote is paid on every member.

**[5]** The wallet reads the status from all three and uses it once 2 answers are identical.

**[6]** It sends its blinded output B′ to all three. The mint is ordered through consensus, then each member returns its share. Any 2 shares give the blind signature C′.

## Background

- **Quote**: the mint's record of an invoice to be paid. **Mint quote (NUT-04, Bolt11 in NUT-23)**: the wallet asks to mint an amount; the mint answers with a quote ID and a Lightning invoice. After payment the wallet sends blinded outputs and receives blind signatures.
- **Consensus**: the members run AlephBFT, which gives every honest member the same ordered list of items. A quote exists on m2 and m3 only because m1's quote item was ordered and applied there.
- **q, the observation quorum**: how many members must independently report the payment before the quote counts as paid. It must lie between c and n. With n = 3, c = 3 − ⌊(3 − 1)/3⌋ = 3, so q = 3.
- **t, the signing threshold**: how many signature shares combine into one signature. The wallet also uses t as the number of identical status answers it needs.
- **Payment backend**: the Lightning node a member uses to see whether its invoice was paid.
- **Share C′ᵢ = kᵢ·B′**: member i multiplies the blinded output B′ by its key share kᵢ. Any t shares, combined with Lagrange weights, give C′ = k·B′.

## Speaker note

- The slide shows the three payment reports appearing at once; in the code each member reports when its own backend probe runs, for example on a payment event, a scheduled scan or a status request.
