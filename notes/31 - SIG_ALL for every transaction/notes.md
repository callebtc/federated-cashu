# 31 · SIG_ALL for every transaction

1.6 Client intent · 3 steps · script 106 words, about 45 s

## Script

**[1]** The fix: every input signs the whole transaction, inputs and outputs. That is what SIG_ALL means.

**[2]** If a member replaces the outputs A and B with its own X and Y, the signatures no longer match, and the transaction is rejected.

**[3]** Before v3, SIG_ALL is optional. With a single mint that was acceptable: you already trust the mint with your proofs, and it has no reason to replace your outputs. In a federation any single member sees your proofs, so v3 makes SIG_ALL mandatory for every transaction. A token without conditions then carries its private key for the receiver, and the mint only ever sees signatures.

## Background

- **SIG_ALL / SIG_INPUTS (NUT-11)**: the signature flag of P2PK. SIG_INPUTS signs only the input's own secret; SIG_ALL signs all inputs and all outputs together.
- **How v3 does it**: the transaction is serialized into a fixed byte format (a TLV transcript), hashed, and each input signs a digest of that hash and its own position. Changing any input or output changes every digest.
- **Bearer key in spend info**: a v3 secret is a public key K = k·G. A token without conditions carries k to the receiver, outside of what the mint sees; the mint receives K, the signature C and a witness signature.

## Status

- Specified in `cashubtc/nuts#443` (NUT-10). Neither federation branch implements v3 transcript signing yet.
