# 40.04 · HTLC spend outcomes

Variation 4 of slide 40 (Conditions as tags - HTLC (NUT-14)) · lens: Explained via a truth table · deck `fcv-g-json-taproot` page 14 · 4 steps · script 140 words, about 60 s

## Script

The HTLC spend rule, then six cases.

**[1]** A spend is valid if R, S or A holds. R: the preimage hashes to data and at least n_sigs receiver keys signed. S: the mint's clock is past the locktime and at least n_sigs_refund refund keys signed. A: the clock is past the locktime and there is no refund tag.

**[2]** Row 1: preimage and receiver signature before the locktime: valid by R. Row 2: the preimage without a signature fails, because this secret has a pubkeys tag.

**[3]** Row 3: a refund signature before the locktime fails, even with the preimage present. It matches an invalid NUT-11 test vector. Row 4: after the locktime, a refund signature alone is valid by S.

**[4]** Row 5: R still holds after the locktime. Row 6: with no refund tag, after the locktime no witness is needed.

## Background

- **∨ (logical or)**: the spend is valid if at least one of the three conditions is true.
- **R, receiver pathway**: preimage check plus Locktime Multisig over the `pubkeys` keys.
- **S, sender pathway**: Refund Multisig over the `refund` keys, only after the locktime.
- **A, no refund tag**: NUT-11 treats an expired lock without `refund` as unlocked.
- **The NUT-11 test vector for row 3**: an HTLC with `pubkeys`, a `locktime` far in the future (4854185133, in 2123), a `refund` key and `SIG_ALL`. The witness has the correct preimage and a signature by the refund key; the request is invalid.
