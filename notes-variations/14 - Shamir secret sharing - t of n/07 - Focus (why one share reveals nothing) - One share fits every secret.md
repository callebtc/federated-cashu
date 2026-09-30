# 14.07 · One share fits every secret

Variation 7 of slide 14 (Shamir secret sharing - t of n) · lens: Focus: why one share reveals nothing · deck `fcv-b-threshold` page 17 · 4 steps · script 140 words, about 60 s

## Script

Why one share reveals nothing, with t = 2 over 𝔽₉₇.

**[1]** The dealer picks the line f(x) = 20 + 45x mod 97. So k = 20, and the shares are k₁ = 65, k₂ = 13 and k₃ = 58.

**[2]** An observer holds only k₁ = 65 and tries every candidate secret k′ from 0 to 96. For each, the slope that fits is a′ = 65 − k′ mod 97.

**[3]** Every row passes through (1, 65): each k′ has exactly one slope. The dealer's slope a₁ is uniform, so every k′ has probability 1/97. The share favours no k′.

**[4]** A second share, k₂ = 13, is the value at x = 2, which is k′ + 2a′. Only one row gives 13: k′ = 20, the secret. Over 𝔽ᵣ the same holds for any t − 1 shares.

## Background

- **mod 97**: arithmetic on the remainders 0 to 96. Example: 20 + 45·2 = 110 ≡ 13.
- **Table rows**: k′ = 0 gives slope 65 and f′(2) = 33; k′ = 96 gives slope −31 ≡ 66 and f′(2) = 34.
- **Uniform slope**: a₁ is uniformly random and independent of k, so the share k₁ = k + a₁ is uniform whatever k is. Seeing it leaves the distribution of k unchanged; for a uniformly random key, every k′ has probability 1/97.
- **Second share**: f′(2) = k′ + 2a′ = 130 − k′ mod 97. Exactly one k′ gives 13, namely 20.
- **General case**: for a polynomial of degree t − 1 and t − 1 shares, every candidate k′ matches exactly one polynomial.

## Speaker note

- All values on the slide were recomputed with python3 (shares 65, 13, 58; every table row; the single consistent k′ = 20). No errors.
