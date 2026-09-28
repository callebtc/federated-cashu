# 10.03 · Proof size as t grows

Variation 3 of slide 10 (Threshold BLS compared with t-of-n secp multisig) · lens: Graphical · deck `fcv-b-threshold` page 5 · 3 steps · script 123 words, about 55 s

## Script

Proof size as the threshold t grows, for five members. Top: secp multisig. Bottom: threshold BLS.

At t = 2 the multisig proof holds the secret x, two 33-byte signatures, 66 bytes, and a roster and policy block. The receiver runs two DLEQ checks plus the policy. The BLS proof holds x and one 48-byte G₁ point C, verified with one pairing check.

**[1]** t = 3: three signatures, 99 bytes, three DLEQ checks. The BLS proof is unchanged.

**[2]** t = 4: 132 bytes.

**[3]** t = 5: 165 bytes and five DLEQ checks. The BLS proof is still one 48-byte C.

The multisig proof grows linearly with t. The threshold BLS proof has constant size, because the shares are interpolated before the proof exists.

## Background

- **33 bytes**: a compressed secp256k1 point, the size of one secp signature C.
- **48 bytes**: a compressed BLS12-381 G₁ point, the size of a v3 signature C.
- **Roster and policy**: the member keys and the t-of-n rule a receiver needs to judge a multisig proof. The slide does not give their size.
- **DLEQ check**: verifying one NUT-12 proof that a signature was made with the key it claims. One per multisig signature.
- **Pairing check**: e(C, G₂) = e(Y, K) with Y = H(x). One equation per proof, whatever t is.

## Speaker note

- The byte counter counts only the t signature points. A multisig proof that can be checked offline would also carry the t DLEQ proofs (NUT-12: e and s, 32 bytes each per signature, plus r) and the roster and policy block, so the real multisig proof is larger than the figure shows.
