# removed.06 · What a proof reveals about its signers

Variation 6 of slide removed (Threshold BLS compared with t-of-n multisig) · lens: Focus: signer set visibility · deck `fcv-b-threshold` page 8 · 4 steps · script 138 words, about 60 s

## Script

What a proof reveals about its signers, in a 2-of-3 federation. Left: the contents of a multisig proof. Right: the threshold BLS result from the shares, with the toy polynomial f(x) = 3 + 1.2x, so each share is C′ᵢ = f(i)·B′.

**[1]** S = {1, 2}: m1 and m2 respond. The multisig proof holds x, C₁ and C₂. The wallet computes 2·C′₁ − 1·C′₂ = (8.4 − 5.4)·B′ = 3·B′.

**[2]** S = {1, 3}: the proof holds C₁ and C₃. The weights are 1.5 and −0.5, and the result is again 3·B′.

**[3]** S = {2, 3}: C₂ and C₃. Weights 3 and −2, again 3·B′.

**[4]** Three different multisig proofs: the receiver, and the mint at redemption, see which members signed. The threshold result is C′ = 3·B′ for every subset. After unblinding there is one C = k·Y.

## Background

- **S**: the set of members that responded.
- **Toy polynomial**: f(x) = 3 + 1.2x gives k = f(0) = 3 and shares 4.2, 5.4, 6.6. Real shares are elements of 𝔽ᵣ.
- **Lagrange weights**: λᵢ = Π over the other members j in S of j/(j − i). {1, 2}: 2 and −1. {1, 3}: 3/2 and −1/2. {2, 3}: 3 and −2.
- **Why the result does not depend on S**: any t points of f determine the same f(0), and multiplying points by numbers is linear, so Σ λᵢ·kᵢ·B′ = f(0)·B′ = k·B′.
- **Unblinding**: C = r⁻¹·C′ = k·Y, where Y = H(x) and B′ = r·Y.

## Speaker note

- The three weighted sums on the slide were recomputed with python3 (8.4 − 5.4, 6.3 − 3.3, 16.2 − 13.2); all equal 3.
