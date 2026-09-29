# 13 · Lagrange interpolation at x = 0

Original slide, deck `fcv-b-threshold` page 19 (main deck slide 13). Same text as `notes/13 - Lagrange interpolation at x = 0/notes.md`.

1.2 Threshold issuance · 5 steps · script 126 words, about 55 s

## Script

**[1]** Given t points of a polynomial, Lagrange interpolation computes f(0) as a weighted sum of the known values. The weight λᵢ for member i depends only on which members are in the responding set S. The example is f(x) = 3 + 1.2x, so k = 3, with shares 4.2, 5.4 and 6.6.

**[2]** Members 1 and 2: the weights are 2 and −1. 2 · 4.2 − 5.4 = 3.

**[3]** Members 1 and 3: weights 3/2 and −1/2. Again 3.

**[4]** Members 2 and 3: weights 3 and −2. Again 3. Different weights, same f(0).

**[5]** The weights are plain numbers, so they can multiply curve points. If each member returns kᵢ·B′, the weighted sum of those points is k·B′. The wallet computes this, in aggregate_blind_signature_shares in nut01/bls.rs.

## Background

- **Lagrange weights**: λᵢ = Π over the other members j in S of j / (j − i). For S = {1, 2}: λ₁ = 2/(2 − 1) = 2 and λ₂ = 1/(1 − 2) = −1.
- **Why it works on points**: multiplying points by numbers is linear. λ₁·(k₁·B′) + λ₂·(k₂·B′) = (λ₁k₁ + λ₂k₂)·B′ = f(0)·B′ = k·B′.
- **Division in modular arithmetic**: in the real scheme, "divide by (j − i)" means multiply by the modular inverse of (j − i).
