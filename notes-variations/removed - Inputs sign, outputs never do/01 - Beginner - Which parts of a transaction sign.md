# removed.01 · Which parts of a transaction sign

Variation 1 of slide removed (Inputs sign, outputs never do) · lens: Beginner · deck `fcv-f-client-intent` page 29 · 4 steps · script 128 words, about 55 s

## Script

A transaction moves value from inputs to outputs.

**[1]** Inputs are where value comes from: a proof, here 8 sat, or a paid mint quote, a payment request the mint has marked as paid.

**[2]** Outputs are where value goes: a blinded message, which the mint signs into a new proof, or a melt quote, which the mint pays out, for example over Lightning.

**[3]** Every input signs. A proof signs with k, the private key of its secret. A mint quote signs with its lock key, attached when the quote was created. Each signs a digest of the whole transaction, outputs included, so changing an output breaks every input's signature.

**[4]** Outputs never sign; the inputs' signatures already cover them. Today's endpoints use parts of this shape: mint, swap and melt.

## Background

- **Proof**: a token unit: a secret and the mint's signature on it. On v3 the secret is a public key K = k·G.
- **Mint quote**: a request to mint, paid with an external payment; once paid it can be spent as an input.
- **Blinded message**: a new output the wallet wants signed. The mint signs it without seeing the secret inside.
- **Melt quote**: the mint's offer to make an external payment; as an output it receives the value of the inputs.
- **Lock key (NUT-04)**: the `pubkey` on a mint quote; only its private-key holder can mint the quote.
- **Endpoint shapes**: mint turns a quote into blinded messages, swap turns proofs into blinded messages, melt turns proofs into a melt quote plus blank change outputs.

## Speaker note

- Specified in cashubtc/nuts#443; not implemented on the federation branches.
