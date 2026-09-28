# 13.06 · 3-of-5 interpolation mod 97

Variation 6 of slide 13 (Lagrange interpolation at x = 0) · lens: Worked example end to end · deck `fcv-b-threshold` page 25 · 5 steps · script 140 words, about 60 s

## Script

A 3-of-5 interpolation end to end, over 𝔽₉₇.

**[1]** The dealer polynomial has degree 2: f(x) = 20 + 45x + 11x² mod 97, so k = 20. The shares are 76, 57, 60, 85 and 35.

**[2]** Subset {1, 3, 5}. Weights as fractions: 15/8, −5/4 and 3/8. Reduced mod 97, with 8⁻¹ ≡ 85 and 4⁻¹ ≡ 73, they are 14, 23 and 61.

**[3]** Weighted sum: 14·76 + 23·60 + 61·35 ≡ 94 + 22 + 1 = 117 ≡ 20. That is k.

**[4]** Subset {2, 3, 4}: weights 6, −8 ≡ 89, and 3. 6·57 + 89·60 + 3·85 ≡ 51 + 5 + 61 = 117 ≡ 20. Different weights, same k.

**[5]** The same weights applied to G₁ points give C′ = Σ λᵢ·C′ᵢ = 20·B′ for both subsets. The in-tree 3-of-5 test aggregates the same two subsets.

## Background

- **𝔽₉₇ and ≡**: arithmetic modulo 97; ≡ means equal modulo 97.
- **Modular inverse**: 8⁻¹ is the number that gives 1 when multiplied by 8 mod 97: 8·85 = 680 = 7·97 + 1. Likewise 4·73 = 292 = 3·97 + 1.
- **Reducing the fractions**: 15/8 ≡ 15·85 ≡ 14; −5/4 ≡ −5·73 ≡ 23; 3/8 ≡ 3·85 ≡ 61; −8 ≡ 89.
- **Weights**: λᵢ = Π over the other j in S of j/(j − i). For {2, 3, 4}: λ₂ = 12/2 = 6, λ₃ = 8/(−1) = −8, λ₄ = 6/2 = 3.
- **From numbers to points**: each member returns C′ᵢ = kᵢ·B′; the wallet computes Σ λᵢ·C′ᵢ = (Σ λᵢ·kᵢ)·B′ = k·B′.

## Speaker note

- Shares, inverses, weights and both sums were recomputed with python3; all values on the slide are correct.
- The polynomial 20 + 45x + 11x² mod 97 is a toy example computed for the slide. The in-tree test `test_threshold_bls_three_of_five_aggregates_any_valid_subset` uses the same subsets {1, 3, 5} and {2, 3, 4}, but real 𝔽ᵣ coefficients, not these values.
