# 29 · On-chain melt - intent to broadcast

Original slide, deck `fcv-e-membership-custody` page 34 (main deck slide 29). Same text as `notes/29 - On-chain melt - intent to broadcast/notes.md`.

1.5 Custody · 5 steps · script 138 words, about 60 s

## Script

An on-chain melt, from intent to broadcast.

**[1]** make_payment creates an intent. A Melt operation goes through consensus. No funds move yet.

**[2]** A member proposes the exact unsigned transaction as a TransactionProposal, ordered like any other operation.

**[3]** Every member recomputes it: input ownership, value conservation, the fee cap, the destination, and the sighashes.

**[4]** FROST signing. Each authorization binds the operation, the transaction, the input index and the sighash. Nonces are burned on failure and never reused.

**[5]** TransactionSigned is stored first, then a BroadcastIntent. Replay broadcasts the same bytes.

A single member can propose, but it cannot change the destination, get a different transaction signed, or broadcast different bytes. Deposit addresses are allocated by consensus and need the observation quorum plus confirmation depth. A reorg before issuance withdraws the observation; after issuance it raises an alarm and does not unmint.

## Background

- **Sighash**: the hash of the transaction data that a signature commits to. A signature for one sighash is useless for any other transaction.
- **Value conservation**: inputs equal outputs plus fee.
- **Nonce**: a one-time random value in each Schnorr or FROST signature. Using the same nonce for two different messages reveals the private key share, so a nonce that was committed but not completed is discarded ("burned").
- **Nonce lifecycle in cdk-frost**: Generated → Reserved → CommitmentSent → Signing → ShareProduced → Consumed.
- **Confirmation depth**: number of blocks on top of the one containing the deposit.
- **Reorg**: the chain switches to a competing branch, and a confirmed transaction can disappear.
