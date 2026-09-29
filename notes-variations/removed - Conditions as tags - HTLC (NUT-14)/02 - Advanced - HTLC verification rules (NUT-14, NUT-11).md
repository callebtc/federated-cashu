# removed.02 · HTLC verification rules (NUT-14, NUT-11)

Variation 2 of slide removed (Conditions as tags - HTLC (NUT-14)) · lens: Advanced · deck `fcv-g-json-taproot` page 12 · 5 steps · script 138 words, about 60 s

## Script

NUT-14 rules, plus the multisig rules inherited from NUT-11.

**[1]** Hash lock: data is the SHA-256 of a 32-byte preimage; both are 64 lowercase hex characters. The check compares the decoded bytes.

**[2]** Receiver pathway: the preimage plus at least n_sigs signatures from the pubkeys keys, default 1, also after the locktime. Without a pubkeys tag the preimage alone spends.

**[3]** Sender pathway: after the locktime, at least n_sigs_refund refund keys, default 1. Without a refund tag, anyone can spend after the locktime. Without a valid locktime, only the receiver pathway exists.

**[4]** The mint counts distinct keys with valid signatures, since Schnorr signatures are not deterministic. Pathways cannot be mixed.

**[5]** The witness holds preimage and signatures, readable later through NUT-07; applications relying on that check NUT-07 in the mint info. On keysets 02 and later, hashlock leaves always require a signature.

## Background

- **hex_to_bytes**: the comparison is on decoded bytes, so upper- and lowercase hex cannot produce a mismatch.
- **Locktime states (NUT-11)**: no or invalid `locktime`: permanent lock; mint clock before `locktime`: active; after: expired, and the refund pathway opens.
- **n_sigs defaults**: `n_sigs` and `n_sigs_refund` default to 1 when absent.
- **Non-deterministic Schnorr signatures**: BIP340 signing uses random auxiliary data, so one key can produce several valid signatures. Counting keys prevents one key from filling several slots.
- **Self-contained pathways**: one receiver signature plus one refund signature never satisfy a 2-signature requirement together.
- **NUT-07 state check**: `POST /v1/checkstate` returns the state and, for spent pre-v3 proofs with a witness, the witness string.
- **Hashlock leaf (v3, NUT-10)**: preimage plus signatures by `n` distinct listed keys. There is no keyless hashlock.
