# 30.08 · Crash points in an on-chain melt

Variation 8 of slide 30 (On-chain melt - intent to broadcast) · lens: Framing: crash at each stage · deck `fcv-e-membership-custody` page 42 · 5 steps · script 139 words, about 60 s

## Script

A crash at each stage of an on-chain melt, and what durable state allows on restart.

**[1]** After the Melt is accepted: inputs are reserved and the intent is Pending, still eligible for deterministic batching.

**[2]** After the proposal is accepted, with a FROST round open: the nonce records are not terminal. They are burned with reason RestartRecovery, and a new attempt uses fresh nonces.

**[3]** After TransactionSigned is persisted: the signed bytes and txid are durable. A broadcast intent follows, and any ready member sends them.

**[4]** After an ambiguous broadcast: inputs stay reserved. The options are exact-byte rebroadcast or a reviewed fee-bump replacement with a fresh FROST session.

**[5]** After confirmation: a paid MeltQuotePayment quorum finalizes the melt and signs change if present.

Signed bytes are persisted before the broadcast intent, so a crash cannot broadcast bytes the journal does not know.

## Background

- **Durable state**: what is written to the database or journal and survives a restart.
- **Deterministic batching**: every member computes the same batch of pending intents from the same journal, so a restart does not change which payments go together.
- **RestartRecovery**: the burn reason for nonce records found in a non-terminal state after a restart. A nonce whose commitment may have left is never reused.
- **Ambiguous broadcast**: the member does not know whether the network accepted the transaction. The inputs stay reserved because the transaction may still confirm.
- **Exact-byte rebroadcast**: `cdk-mintd federation rebroadcast --proposal-id <id> --acknowledge-exact-byte-retry` re-sends the persisted signed bytes after checking their txid. It cannot build a new spend.
- **Fee-bump replacement**: a new proposal paying the same outputs with a higher fee, accepted through consensus and signed in a new FROST session with fresh nonces.
- **Change signing**: the BLS signatures on the melt's change outputs, produced once the melt is finalized.
