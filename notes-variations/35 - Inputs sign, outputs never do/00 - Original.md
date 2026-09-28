# 35 · Inputs sign, outputs never do

Original slide, deck `fcv-f-client-intent` page 28 (main deck slide 35). Same text as `notes/35 - Inputs sign, outputs never do/notes.md`.

1.6 Client intent · 3 steps · script 140 words, about 60 s

## Script

**[1]** Before v3, binding inputs to outputs is opt-in and restricted. A random-string secret has no witness: whoever presents x and C spends it. P2PK with SIG_INPUTS signs only the secret string. SIG_ALL is optional and requires every input to have the same data and tags.

**[2]** With v3, every secret is a public key, and every input carries a BIP-340 witness over its input digest. That is SIG_ALL for every transaction, with no sigflag: inputs with different locks, or none, mix freely. Paid mint quotes are inputs too, signed by the quote lock key. Serialized tokens never carry witnesses.

**[3]** An anyone-can-spend token is a bare key K = k·G whose private key k travels in the token's spend info. The mint receives K, C and a signature, never k. A member that sees the swap cannot re-sign it for other outputs.

## Background

- **P2PK (NUT-11)**: pay-to-public-key: a proof spendable only with a signature from a given key.
- **Sigflag**: a NUT-11 tag choosing what the signature covers. SIG_INPUTS: the input secret only. SIG_ALL: inputs and outputs together.
- **Spend info**: extra data carried with a token entry for the next holder, not sent to the mint (section 2.4).
- **Anyone-can-spend in v3**: "anyone who holds the token", since the token carries k. It is still a bearer token for the holder, but the mint only ever sees signatures.
- **Mint quote lock key (NUT-04, NUT-20)**: a public key attached to a mint quote; only the holder of its private key can mint the paid quote.

## Status

- Specified in `cashubtc/nuts#443` (NUT-10, NUT-03, NUT-04, NUT-05); not implemented on the federation branches yet.
