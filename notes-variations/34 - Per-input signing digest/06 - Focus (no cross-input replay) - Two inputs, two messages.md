# 34.06 · Two inputs, two messages

Variation 6 of slide 34 (Per-input signing digest) · lens: Focus: no cross-input replay · deck `fcv-f-client-intent` page 25 · 4 steps · script 116 words, about 50 s

## Script

Two inputs in one transaction, from the multi-input vector.

**[1]** Both share one transaction digest, 9517f426.

**[2]** Each input hashes its own container, so the input IDs differ, 44002fef and 08960176, and so do the input digests, 3c5ccb85 and 720c3e06. Each key signs its own.

**[3]** On the diagonal, signature 1 verifies over input digest 1, and signature 2 over input digest 2.

**[4]** Off the diagonal both fail: a signature moved to the other input does not verify. This matters for twin secrets. 02 x and 03 x share one x-coordinate but are distinct secrets with distinct Y and spent-state entries, and one scalar spends both. If both inputs signed one shared message, one signature would verify at both.

## Background

- **Twin secrets**: two compressed keys with the same x-coordinate, prefix 02 and prefix 03. BIP-340 checks only x, so the owner of one scalar can sign for either.
- **Spent-state entry**: the mint's record that a given Y was spent. Twins have different Y, so they are different proofs.
- **Why per-input messages close the gap**: each twin's input ID differs, so each needs its own signature over its own digest.
- **Values**: the NUT-10 multi-input vector, secrets from NUT-13 V3 counters 0 and 1.

## Speaker note

- The two secrets in this vector have different x-coordinates (02e6e7cf…, 03a882e1…); the twin case in the note is the motivating example, not these values.
- The off-diagonal failures were recomputed with a BIP-340 verifier for this page; the spec states the requirement. Specified in cashubtc/nuts#443; not implemented on the federation branches.
