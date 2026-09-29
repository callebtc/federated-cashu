# 35 · Part 2 - Nutroot

Part title · script 18 words, about 10 s

## Script

Part two: nutroot. Conditional payments for Cashu v3, built like taproot. The specification is cashubtc/nuts pull request 443.

## Background

- **Point secret**: in v3, the token secret is an elliptic curve public key instead of a string.
- **Condition tree**: a Merkle tree of spending conditions committed into that key.
