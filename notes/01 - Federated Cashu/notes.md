# 01 · Federated Cashu

Cover · script 52 words, about 20 s

## Script

I'll talk about two improvements to Cashu that are coming soon and that we have been working on. The first is federations: one Cashu mint, run by several independent operators. The second is nutroot, our new way of expressing conditional payments in Cashu: spending conditions built the way Bitcoin's taproot builds them.

## Background

- **Cashu**: a Chaumian ecash protocol for Bitcoin. A mint issues tokens against sats it holds and redeems them later. The protocol is specified in documents called NUTs (Notation, Usage and Terminology), numbered NUT-00, NUT-01, and so on.
- **Chaumian ecash**: ecash based on blind signatures, introduced by David Chaum. The mint signs a token without seeing it, so at redemption it cannot tell which issuance the token came from.
- **Conditional payment**: a token that can only be spent when a condition is met, for example a signature from a given key, a hash preimage, or a time having passed.
- **The cover animation**: five members; each round, a different group of three sends its part of a signature to the center, where the parts form one full signature. The grey dots are the messages members exchange to agree on an order.
- **CDK**: the Cashu Development Kit, a Rust implementation of Cashu mints and wallets (`github.com/cashubtc/cdk`). The federation work lives on the branch `bls-federation`.
