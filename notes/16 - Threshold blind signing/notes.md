# 16 · Threshold blind signing

1.2 Threshold issuance · 7 steps · script 120 words, about 50 s

## Script

**[1]** The wallet blinds its secret once: B′ = r·H(x).

**[2]** It sends the same request to every member.

**[3]** Member i multiplies by its key share and returns C′ᵢ = kᵢ·B′.

**[4]** Member 2 does not answer. With t = 2, two responses are enough.

**[5]** The wallet checks each share with a pairing against that member's public share Kᵢ and drops invalid ones.

**[6]** It combines the two shares with Lagrange weights: fixed numbers that depend only on which members answered. For members 1 and 3, the weighted sum of the shares is exactly k·B′, what a single mint with key k would have returned.

**[7]** It unblinds and verifies against the aggregate key K. The members never exchange shares; the wallet does the combining.

## Background

- **Lagrange interpolation**: given t points of a polynomial, its value at zero is a weighted sum of the known values, f(0) = Σ λᵢ·f(i), with λᵢ = Π over the other members j of j/(j − i).
- **Worked example**: f(x) = 3 + 1.2x, so k = 3; shares 4.2, 5.4, 6.6. Members {1, 2}: weights 2 and −1, 2·4.2 − 5.4 = 3. Members {1, 3}: 3/2 and −1/2, again 3. Members {2, 3}: 3 and −2, again 3.
- **Why it works on points**: multiplying points by numbers is linear, so λ₁·(k₁·B′) + λ₃·(k₃·B′) = (λ₁k₁ + λ₃k₃)·B′ = k·B′.
- **Public share Kᵢ = kᵢ·G₂**: published per member so each share can be checked on its own: e(C′ᵢ, G₂) = e(B′, Kᵢ).
- **Code**: `blind_sign_share` and `aggregate_blind_signature_shares` in `cashu/src/nuts/nut01/bls.rs`.
