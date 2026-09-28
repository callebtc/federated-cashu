# 13.04 · Weights for every 3-of-5 subset

Variation 4 of slide 13 (Lagrange interpolation at x = 0) · lens: Explained via a table · deck `fcv-b-threshold` page 23 · 3 steps · script 130 words, about 55 s

## Script

All ten 3-of-5 subsets with their Lagrange weights. On the right, the shares come from f(x) = 3 + 2.5x − 0.3x², so k = 3, and f(1) to f(5) are 5.2, 6.8, 7.8, 8.2 and 8.0. The first row, {1, 2, 3}, has weights 3, −3 and 1. The subset farthest from zero, {3, 4, 5}, has weights 10, −15 and 6.

**[1]** Every row of weights sums to 1. The weights interpolate the constant polynomial 1, whose value at zero is 1.

**[2]** Every weighted sum of the shares gives f(0) = 3, for every subset.

**[3]** In 𝔽ᵣ each fraction is a field element: 15/8 means 15 times the inverse of 8. The highlighted rows, {1, 3, 5} and {2, 3, 4}, are the subsets of the in-tree 3-of-5 test.

## Background

- **λᵢ for three members**: λᵢ = Π over the other two members j of j/(j − i). For {1, 3, 5}: λ₁ = (3·5)/(2·4) = 15/8, λ₃ = (1·5)/((−2)·2) = −5/4, λ₅ = (1·3)/((−4)·(−2)) = 3/8.
- **Why each row sums to 1**: interpolating the constant polynomial g(x) = 1 gives Σ λᵢ·1 = g(0) = 1. It is a quick consistency check on any weight table.
- **Why every row gives 3**: any three points determine the same degree-2 polynomial, so every subset yields the same f(0).
- **Larger weights far from zero**: IDs far from x = 0 extrapolate further, so their weights are larger, as in {3, 4, 5}.
- **The test**: `test_threshold_bls_three_of_five_aggregates_any_valid_subset` in nut01/bls.rs.

## Speaker note

- All ten rows were recomputed with exact fractions in python3: every weight on the slide is correct, every row sums to 1 and interpolates 3.
- The polynomial and weights are the slide's toy example. The in-tree test uses the same two subsets but real 𝔽ᵣ coefficients (`bls_key(3)`, `bls_key(5)`, `bls_key(9)`), not 3 + 2.5x − 0.3x².
