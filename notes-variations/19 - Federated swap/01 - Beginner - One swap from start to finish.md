# 19.01 · One swap from start to finish

Variation 1 of slide 19 (Federated swap) · lens: Beginner · deck `fcv-c-ordering` page 27 · 5 steps · script 136 words, about 60 s

## Script

One swap from start to finish, with three members and t = 2. A swap exchanges proofs for new proofs of the same value, minus fees.

**[1]** The wallet holds two proofs, P1 worth 4 and P2 worth 1. It blinds three new outputs: A worth 2, B worth 2, C worth 1. Five in, five out; there is no fee here.

**[2]** It sends the same swap request to m1, m2 and m3.

**[3]** The members order it through consensus. It is accepted as the first swap that spends P1 and P2.

**[4]** Each member marks P1 and P2 spent and returns its signature shares for A, B and C.

**[5]** For each output the wallet takes t = 2 shares, combines them into one signature and unblinds it. The result is three new proofs worth 2, 2 and 1.

## Background

- **Proof**: a token the mint has signed: a secret and a signature on it. Amounts are powers of two.
- **Blinding**: the wallet hides each new output with a random factor r, so members cannot link the signed output to the later token.
- **Consensus**: the members agree on one order of operations; the first swap that spends P1 and P2 wins.
- **Marked spent**: each member records P1 and P2 as spent in its database, so they cannot be used again.
- **Combining shares**: two shares on the same output, multiplied by their Lagrange weights and added, give the full blinded signature.
- **Unblinding**: multiplying by r⁻¹ removes the blinding factor and gives the final signature on the token.
