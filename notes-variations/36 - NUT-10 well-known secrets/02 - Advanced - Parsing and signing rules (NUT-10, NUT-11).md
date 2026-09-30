# 36.02 · Parsing and signing rules (NUT-10, NUT-11)

Variation 2 of slide 36 (NUT-10 well-known secrets) · lens: Advanced · deck `fcv-g-json-taproot` page 4 · 5 steps · script 140 words, about 60 s

## Script

NUT-11's complex P2PK example: 2-of-3 over the data key and two pubkeys; after the locktime, also 1-of-2 refund keys.

**[1]** NUT-10: an array of kind and an object with nonce, data and tags. Tags hold non-empty strings only; an empty tag, an integer or an empty string is invalid.

**[2]** NUT-11 tags: each at most once, or the proof is unspendable. n_sigs and n_sigs_refund are positive, at most the keys in their pathway. sigflag is SIG_INPUTS, the default, or SIG_ALL.

**[3]** Keys compare by lowercase x-coordinate, ignoring the 02 or 03 prefix. Each key appears once per pathway, but may be in both, like 033281c3.

**[4]** The message is the unescaped secret or the SIG_ALL concatenation. The mint counts distinct keys with valid signatures, not signatures.

**[5]** A mint without NUT-11 may treat the proof as anyone-can-spend. This applies to keysets 00 and 01 only.

## Background

- **Pathway**: a self-contained set of conditions. Locktime Multisig: at least `n_sigs` of the keys in `data` plus `pubkeys` (here 2 of 3). Refund Multisig: at least `n_sigs_refund` of the `refund` keys (default 1, here 1 of 2), available only after `locktime`.
- **MUST reject / unspendable**: a malformed P2PK secret (repeated tag, bad `n_sigs`, unknown `sigflag`, duplicate key in a pathway) can never be spent; the mint rejects every attempt.
- **Compressed key**: 33 bytes, a prefix `02` (even y) or `03` (odd y) followed by the 32-byte x-coordinate. BIP340 signatures verify against x alone, so `02…` and `03…` with the same x are one signing key. Comparing by x stops one key from being counted twice.
- **Distinct keys, not signatures**: BIP340 signing mixes in random auxiliary data, so one key can produce many different valid signatures on the same message. Counting signatures would let one key satisfy `n_sigs` alone.
- **SIG_ALL**: the signature covers all inputs and outputs of the transaction through a concatenated message, carried in the first input's witness.
- **Keyset version**: the first byte of the keyset id. Keysets `02` and later use nutroot secrets and MUST reject any non-point secret (NUT-10).
