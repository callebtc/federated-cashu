# 37 · Conditions as tags - HTLC (NUT-14)

2.1 Spending conditions today · 2 steps · script 98 words, about 40 s

## Script

The same format for an HTLC, NUT-14: 323 bytes as a secret string, and every value is a string, including integers such as the locktime.

**[1]** It has two pathways. The receiver provides the preimage of the hash in data, plus signatures from the listed public keys. That pathway is always available. After the locktime, the sender can spend with signatures from the refund keys.

**[2]** Three properties of JSON secrets. The size grows with the policy. Every spend reveals the whole policy to the mint. And a mint that does not support a kind treats the proof as anyone-can-spend.

## Background

- **HTLC**: hash time-locked contract. Spendable by revealing a preimage of a given hash, or, after a timeout, by a refund key.
- **Preimage**: the input to a hash function; here a value whose SHA-256 equals `data`.
- **Locktime**: a Unix timestamp; after it passes, the refund pathway opens. Without a refund tag, anyone can spend after the locktime.
- **n_sigs**: how many distinct signatures from the listed keys are required.
- **Pathway**: a fixed combination of conditions defined by the NUT for that kind; other combinations cannot be expressed.
