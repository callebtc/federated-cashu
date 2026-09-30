# 19 · Mix-and-match across members

Original slide, deck `fcv-c-ordering` page 2 (main deck slide 19). Same text as `notes/19 - Mix-and-match across members/notes.md`.

1.3 Ordering · 4 steps · script 138 words, about 60 s

## Script

Setup: t = 2, n = 3. The wallet has paid a mint quote for two outputs. It sends each member a different pair of blinded outputs.

**[1]** Member 1 is asked to sign A and B. Two outputs match the paid amount, so it signs.

**[2]** Member 2 is asked for B and C. Also two outputs, also valid. B now has two shares: a complete signature.

**[3]** Member 3 is asked for C and A. Now A and C also have two shares.

**[4]** Result: three valid signatures for a quote that paid for two. Every member saw a valid request. Members that sign on receipt can be played against each other.

The swap variant works the same way with fixed inputs and overlapping output windows. The regression test runs windows ABC, BCD, CDA and DAB against one three-output quote.

## Background

- **Mint quote (NUT-04)**: the wallet requests to mint an amount; the mint returns a Lightning invoice. After payment, the wallet submits blinded outputs worth that amount and receives signatures.
- **Blinded output**: the B′ value the wallet wants signed; one per token.
- **Sliding window**: overlapping subsets of the same list of outputs, as in ABC, BCD, CDA, DAB. Each member sees a request of the correct size; the union is larger than what was paid.
