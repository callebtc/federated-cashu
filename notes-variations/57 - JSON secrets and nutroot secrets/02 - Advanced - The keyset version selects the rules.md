# 57.02 · The keyset version selects the rules

Variation 2 of slide 57 (JSON secrets and nutroot secrets) · lens: Advanced · deck `fcv-j-nutroot-use` page 29 · 6 steps · script 138 words, about 60 s

## Script

**[1]** The keyset version byte picks the rules: 00 and 01 JSON, 02 and later nutroot.

**[2]** Secret. Pre-v3, any string; a well-known JSON secret's kind selects rules. v3, a 33-byte compressed point or reject; its shape never selects rules.

**[3]** Y. Pre-v3, hash_to_curve over the string, a 33-byte secp256k1 point. v3, hash_to_curve_G1 over the 33 decoded bytes, a 48-byte BLS12-381 point.

**[4]** Signing. Pre-v3, the secret string, or a concatenation under SIG_ALL. v3, each input signs its own input digest; SIG_ALL and sigflag do not exist.

**[5]** Support. Pre-v3, a mint lacking a kind may treat the proof as anyone-can-spend. v3, the keyset implies all of nutroot; NUT-10, 11, 14 and 20 settings are pre-v3 only.

**[6]** Mixed transactions are valid: each input follows its own keyset. A point-shaped string on v1 or v2 is just a string. v3 tokens carry no witness.

## Background

- **Keyset version byte (NUT-02)**: the first byte of the keyset id; 00 and 01 are the secp256k1 keysets called v1 and v2 here, 02 the BLS12-381 keyset called v3.
- **hash_to_curve**: maps bytes to a curve point deterministically; the result Y is the mint's spent-state key. G1 is the BLS12-381 group used for v3.
- **SIG_ALL, sigflag (NUT-11)**: pre-v3 flag making one signature cover all inputs and outputs, with strict rules on matching secrets.
- **Anyone-can-spend**: a mint that does not understand a JSON kind sees only a random string and asks for no witness.
- **MintMethodSetting**: the NUT-06 info entries that advertise NUT-10, 11, 14 and 20 support; on v3 support is implied by the keyset.
- **No witness in tokens**: a v3 witness signs one transaction's input digest, so it has no use elsewhere; wallets drop it when encoding or decoding a token.
