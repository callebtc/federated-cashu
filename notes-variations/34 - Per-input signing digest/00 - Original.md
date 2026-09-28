# 34 · Per-input signing digest

Original slide, deck `fcv-f-client-intent` page 19 (main deck slide 34). Same text as `notes/34 - Per-input signing digest/notes.md`.

1.6 Client intent · 5 steps · script 112 words, about 50 s

## Script

Each input signs its own message.

**[1]** transaction_digest is a plain SHA-256 of the whole transcript.

**[2]** input_id is a plain SHA-256 of this input's complete container record, 145 bytes here.

**[3]** The input digest is a tagged hash with the tag Cashu_TransactionInput, over the transaction digest followed by the input ID.

**[4]** The input's witness is a BIP-340 signature by the proof secret's key over its own input digest. No two inputs sign the same message.

**[5]** If a member rewrites the outputs from A and B to X and Y, the transcript changes, both digests change, and the witness no longer verifies.

A witness published under disclosure can be verified without revealing the transaction digest.

## Background

- **Tagged hash (BIP340)**: SHA256(SHA256(tag) ‖ SHA256(tag) ‖ message). The tag makes the hash specific to one purpose, so a value computed for one context cannot be reused in another.
- **‖**: byte concatenation.
- **BIP-340 signature**: the Schnorr signature scheme used by taproot; 64 bytes, verified against a 32-byte x-only public key.
- **Why per input**: each signature covers the whole transaction and its own input, so it cannot be moved to another input or another transaction.
- **Disclosure**: an opt-in leaf field (chapter two) under which the mint publishes the witness and input digest.

## Status

- Specified in `cashubtc/nuts#443`; not implemented on the federation branches yet.
