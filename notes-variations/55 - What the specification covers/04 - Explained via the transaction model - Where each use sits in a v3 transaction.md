# 55.04 · Where each use sits in a v3 transaction

Variation 4 of slide 55 (What the specification covers) · lens: Explained via the transaction model · deck `fcv-j-nutroot-use` page 14 · 6 steps · script 139 words, about 60 s

## Script

**[1]** A v3 transaction, NUT-10. Each input signs its own input digest; outputs never sign. Outputs are blinded messages, container 0x03, and melt quotes, 0x04, bound by every input digest.

**[2]** Proof input, 0x01. Bearer tokens, pay to a key, multisig, refunds, HTLCs, data binding and auditable locks are all shapes of this input's secret.

**[3]** Mint quote input, 0x02: the lock key signs. In a batched mint, each quote signs its own digest.

**[4]** Before the transaction: a nutspA signing package carries inputs, outputs and the spends awaiting signatures; each leaf-key holder adds signatures.

**[5]** After it: checkstate returns a commitment over Y, input digest and witness hash, and the witness only for disclosure leaves. A nutrcA spend receipt opens that commitment.

**[6]** Never in a transaction: the request transcript, 0x05. A blind auth token signs a digest of method, request-target and body hash.

## Background

- **TLV transcript**: the transaction serialized as container records (type, 2-byte length, nested fields); inputs first, then outputs.
- **Input digest**: tagged_hash("Cashu_TransactionInput", transaction_digest ‖ input_id), with transaction_digest = SHA-256 of the transcript and input_id = SHA-256 of that input's container. Each input signs a different message, and a published witness does not reveal the transaction digest.
- **Batched mint (NUT-29)**: several paid quotes as inputs of one transaction, each quote's lock key signing its own input digest.
- **nutspA, nutrcA**: transport strings, base64url JSON behind a prefix: a signing package collecting cosigner signatures, and a spend receipt that reveals witness and transcript.
- **Checkstate commitment (NUT-07)**: tagged_hash("Cashu_SpendCommitment", Y ‖ input_digest ‖ witness_hash), returned for spent v3 proofs.
- **Request transcript (NUT-22)**: one container 0x05; the token signs tagged_hash("Cashu_AuthorizedRequest", SHA-256 of that container). A blind auth token is never a transaction input.
