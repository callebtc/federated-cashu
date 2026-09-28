# 10.04 · Where the threshold appears in a token's life

Variation 4 of slide 10 (Threshold BLS compared with t-of-n secp multisig) · lens: Explained via lifecycle · deck `fcv-b-threshold` page 6 · 5 steps · script 136 words, about 60 s

## Script

Five stages of a token's life. Top row: secp multisig. Bottom row: threshold BLS. Shaded cells are federation-aware; plain cells are ordinary Cashu.

**[1]** Issuance. Multisig collects t signatures, each with a DLEQ proof. Threshold BLS fans out, checks t shares against the members' public shares Kᵢ, and interpolates. Both are federation-aware here.

**[2]** Storage. Multisig stores x, t signatures, roster and policy. Threshold BLS stores (x, C).

**[3]** Transfer. The multisig token carries the whole bundle. The threshold BLS token is an ordinary v3 token.

**[4]** Verification. Multisig needs t DLEQ checks and the t-of-n policy. Threshold BLS needs one pairing check with K, in any v3 wallet.

**[5]** Spending. The mint checks the multisig bundle against roster history. The threshold BLS proof is an ordinary v3 input, checked against K. Multisig federates the token; threshold BLS federates the issuer.

## Background

- **Fan-out**: the wallet sends the same request to every member in parallel.
- **Public share Kᵢ = kᵢ·G₂**: published per member, so each returned share can be checked on its own.
- **Interpolation**: combining t checked shares with Lagrange weights into one signature under the aggregate key K.
- **Roster history**: which member keys were valid at which time. A mint checking an old multisig proof must know which roster signed it.
- **v3 token, v3 input**: a proof (amount, keyset ID, secret, C) under a BLS12-381 keyset; a v3 input is such a proof spent in a swap or melt.
- **Pairing check with K**: e(C, G₂) = e(Y, K) with Y = H(x); it needs only public values.
