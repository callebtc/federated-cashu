# 57 · JSON secrets and nutroot secrets

Original slide, deck `fcv-j-nutroot-use` page 27 (main deck slide 57). Same text as `notes/57 - JSON secrets and nutroot secrets/notes.md`.

2.4 Using nutroot · table, no steps · script 134 words, about 55 s

## Script

JSON secrets against nutroot secrets. The secret: a string, 195 bytes for P2PK and 323 for the HTLC, versus a 33-byte point, always. Revealed on spend: the full policy, versus nothing on the key path or one leaf on the script path. Signed message: the secret string or a SIG_ALL concatenation, versus a per-input digest over the TLV transcript. Unlocked proofs: no witness, versus a bare key with k in spend info. A mint without support for a kind treats the proof as anyone-can-spend; a v3 keyset implies full support. Combinations: fixed tag pathways, versus up to 8 leaves in one tree. Encoding: JSON with integers as strings, versus minimal big-endian TLV that fails closed. The test vectors come from two independent implementations, cashu-ts and nutshell. CDK tracks the work in cdk issue 2433.

## Background

- **cashu-ts**: the TypeScript Cashu library. **nutshell**: the Python reference implementation of Cashu.
- **Test vectors**: fixed inputs with expected outputs, so implementations can check they compute the same bytes.
