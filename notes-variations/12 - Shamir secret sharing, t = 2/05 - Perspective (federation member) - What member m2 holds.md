# 12.05 · What member m2 holds

Variation 5 of slide 12 (Shamir secret sharing, t = 2) · lens: Perspective: federation member · deck `fcv-b-threshold` page 15 · 4 steps · script 118 words, about 50 s

## Script

What member m2 holds, in a federation of five. The keyset has one polynomial fₐ per amount a, so the table has one row per amount: 1, 2, 4, 8 and so on.

**[1]** Private: per amount, m2 stores one scalar, fₐ(2), 32 bytes, only in its private configuration.

**[2]** Public: every member's public share fₐ(j)·G₂, for j from 1 to 5, and the keyset key fₐ(0)·G₂.

**[3]** Not known to m2: fₐ(0), the other members' scalars, and the coefficients of fₐ.

**[4]** Alone, m2 can compute C′₂ = f₁(2)·B′ for an output of amount 1. Anyone can check it against m2's public share f₁(2)·G₂. It is a share, not a signature under the keyset key f₁(0)·G₂. A signature needs t shares.

## Background

- **fₐ**: the Shamir polynomial for amount a. Its value at 0 is the private key for that amount; the keyset holds one public key per amount.
- **Scalar**: an element of 𝔽ᵣ, stored as 32 bytes.
- **Public share fₐ(j)·G₂**: member j's key share times the G₂ generator, a 96-byte point. Published so that anyone can check that member's signature shares.
- **Keyset key fₐ(0)·G₂**: the aggregate public key K for amount a. It is computed from public data, without anyone knowing fₐ(0).
- **Share check**: e(C′₂, G₂) = e(B′, f₁(2)·G₂) holds exactly when C′₂ = f₁(2)·B′.
- **Why m2 never learns fₐ(0)**: with DKG nobody computes it, and a single share carries no information about it.
- **B′**: the blinded message from the wallet, B′ = r·H(x).
