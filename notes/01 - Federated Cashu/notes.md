# 01 · Federated Cashu

Cover · script 59 words, about 25 s

## Script

This talk is about running one Cashu mint as a federation of several operators, as implemented in the Cashu Development Kit, CDK. It has two chapters. Chapter one, federating Cashu: threshold BLS issuance, consensus-ordered signing, and threshold custody of the reserves. Chapter two, nutroot: the new secret format for v3 keysets, built on the same ideas as Bitcoin's taproot.

## Background

- **Cashu**: a Chaumian ecash protocol for Bitcoin. A mint issues tokens against sats it holds, and redeems them later. The protocol is specified in documents called NUTs (Notation, Usage and Terminology), numbered NUT-00, NUT-01, and so on.
- **Chaumian ecash**: ecash based on blind signatures, introduced by David Chaum. The mint signs a token without seeing it, so at redemption it cannot tell which issuance the token came from.
- **CDK**: the Cashu Development Kit, a Rust implementation of Cashu mints and wallets (`github.com/cashubtc/cdk`). The federation work lives on the branch `bls-federation`.
