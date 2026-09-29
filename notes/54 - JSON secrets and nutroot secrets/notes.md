# 54 · JSON secrets and nutroot secrets

2.4 Using nutroot · table, no steps · script 92 words, about 40 s

## Script

JSON secrets against nutroot secrets. The secret: a string of 195 to 323 bytes in these examples, versus 33 bytes, always. Revealed on spend: the whole policy, versus nothing on the key path or one leaf on the script path. Signed: the secret string, versus the whole transaction. A mint that does not support a kind treats the proof as anyone-can-spend; with v3, supporting the keyset implies supporting nutroot. Combinations: fixed per kind, versus up to eight leaves in one tree. The test vectors come from two independent implementations, cashu-ts and nutshell.

## Background

- **cashu-ts**: the TypeScript Cashu library. **nutshell**: the Python reference implementation of Cashu.
- **Test vectors**: fixed inputs with expected outputs, so implementations can check they compute the same bytes.
