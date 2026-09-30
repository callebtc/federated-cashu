# 29 · Anything that can be FROSTed

1.5 Custody · 4 steps · script 100 words, about 45 s

## Script

The funding backends.

**[1]** The federation holds one FROST key, and any t members can produce a Schnorr signature for it.

**[2]** Implemented today: an on-chain wallet built with BDK. Its coins sit on a taproot key derived from the FROST key, so spending them needs t members.

**[3]** Also implemented: Bark, for Lightning. The Lightning side of the reserves is controlled by the same FROST key.

**[4]** And in general: any backend that authorizes spending with a Schnorr signature can be used the same way. The federation produces the signature; the backend does not need to know it was made by a threshold.

## Background

- **BDK**: Bitcoin Dev Kit, a Rust library for on-chain Bitcoin wallets. Here it runs as a watch-only wallet; the federation signs its transactions with FROST.
- **Bark**: a wallet implementation of the Ark protocol that can send and receive Lightning payments.
- **Why "anything that can be FROSTed"**: a FROST signature is an ordinary BIP340 Schnorr signature, indistinguishable from a single-key signature. Any system that verifies such signatures accepts it.
- **Same threshold**: the treasury key uses the same roster and threshold as ecash issuance, so neither side is weaker than the other.
