# 34.02 · Properties of the input digest

Variation 2 of slide 34 (Per-input signing digest) · lens: Advanced · deck `fcv-f-client-intent` page 21 · 3 steps · script 139 words, about 60 s

## Script

At the top: the input digest is SHA-256 over the tag hash T twice, the transaction digest, and the input ID, which covers the full container record. T is SHA-256 of Cashu_TransactionInput.

**[1]** A valid transaction repeats no Y and no quote ID, so input IDs differ and no two inputs sign the same message, given collision resistance. The transaction digest covers every container, so changing any output changes every input digest.

**[2]** A witness verifies only at its own input. 02 x and 03 x are distinct secrets one scalar can spend; their signatures still cover different messages. A published witness and input digest verify without the transaction digest; recovering it needs a SHA-256 preimage.

**[3]** Only the signed message is tagged; a NUT-22 request transcript uses its own tag. Pre-v3 inputs sit in the transcript but derive no input digest.

## Background

- **Collision resistance**: it is infeasible to find two different inputs with the same SHA-256 output.
- **Preimage resistance**: given a SHA-256 output, it is infeasible to find an input that produces it. The input digest therefore does not reveal the transaction digest.
- **02‖x and 03‖x**: two compressed public keys with the same x-coordinate and opposite y. They are different secrets with different Y and spent-state entries, but BIP-340 verifies x-only, so one scalar signs for both. Per-input messages keep one signature from serving both.
- **Tag (domain separation)**: `Cashu_TransactionInput` for transaction inputs, `Cashu_AuthorizedRequest` for NUT-22 request transcripts; a signature under one tag is never valid under the other.
- **Disclosure**: an opt-in leaf field under which the mint publishes the exercised witness and input digest (NUT-07).
- **Pre-v3 inputs**: keep NUT-10 JSON secrets, NUT-11 and NUT-14 rules; their bytes are in the transcript and so covered by the v3 inputs' signatures.

## Speaker note

- Specified in cashubtc/nuts#443; not implemented on the federation branches.
