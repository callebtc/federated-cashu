# 40 · Conditions as tags - HTLC (NUT-14)

Original slide, deck `fcv-g-json-taproot` page 10 (main deck slide 40). Same text as `notes/40 - Conditions as tags - HTLC (NUT-14)/notes.md`.

2.1 Spending conditions today · 2 steps · script 129 words, about 55 s

## Script

The same format for an HTLC, NUT-14: 323 bytes as a secret string. Every value is a string, including integers such as the locktime.

**[1]** It has two pathways. The receiver provides the preimage of the hash in data, plus signatures from the pubkeys tag, n_sigs of them. That pathway is always available. The sender, after the locktime, spends with signatures from the refund keys. Without a refund tag, anyone can spend after the locktime.

**[2]** Properties of JSON secrets. The size grows with the policy. Every spend reveals the complete policy to the mint. The signed message is the secret string, or a string concatenation under SIG_ALL. A mint that does not support a kind treats the proof as anyone-can-spend. And combinations are limited to the pathways each kind defines.

## Background

- **HTLC**: hash time-locked contract. Spendable by revealing a preimage of a given hash, or, after a timeout, by a refund key. Used for atomic swaps and Lightning-style payments.
- **Preimage**: the input to a hash function; here a value whose SHA-256 equals `data`.
- **Locktime**: a Unix timestamp; after it passes, the refund pathway opens.
- **n_sigs**: how many distinct signatures from the listed keys are required.
- **Pathway**: a fixed combination of conditions defined by the NUT for that kind.
