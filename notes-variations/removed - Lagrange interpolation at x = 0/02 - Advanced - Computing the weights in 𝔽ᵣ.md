# removed.02 · Computing the weights in 𝔽ᵣ

Variation 2 of slide removed (Lagrange interpolation at x = 0) · lens: Advanced · deck `fcv-b-threshold` page 21 · 4 steps · script 123 words, about 55 s

## Script

The aggregation code from crates/cashu/src/nuts/nut01/bls.rs, condensed. On the right, what each part enforces.

**[1]** validate_threshold_shares runs first. Fewer than t shares returns InsufficientThresholdShares. Duplicate signer IDs return DuplicateThresholdSignerId.

**[2]** lagrange_coefficient_at_zero computes each weight: λᵢ is the product, over the other members j, of −xⱼ divided by xᵢ − xⱼ. That costs one inversion in 𝔽ᵣ per share. Distinct IDs keep every denominator non-zero.

**[3]** Each share point is multiplied by its coefficient and added: C′ = Σ λᵢ·C′ᵢ, t scalar multiplications in G₁ per output. g1_from_projective rejects an identity result with InvalidPublicKey.

**[4]** Every share passed in is used, and the wallet passes exactly t. The in-tree test aggregates the subsets {1, 3, 5} and {2, 3, 4} of a 3-of-5 keyset and gets the same k·B′.

## Background

- **xᵢ, xⱼ**: the signer IDs, taken as elements of 𝔽ᵣ.
- **λᵢ = Π (−xⱼ)/(xᵢ − xⱼ)**: the Lagrange basis polynomial of member i evaluated at x = 0; equal to Π xⱼ/(xⱼ − xᵢ), the form on the main slide.
- **Field inversion**: division in 𝔽ᵣ is multiplication by the modular inverse. The code accumulates numerator and denominator over the loop and inverts the denominator once per share.
- **G1Projective**: a point representation in which additions need no field inversion; the result is converted to the normal (affine) form at the end.
- **Identity point**: the neutral element of G₁. An aggregate equal to it is not a usable signature and is rejected.
- **Scalar multiplication**: computing λ·P for a point P; the main cost of aggregation.
- **The test**: `test_threshold_bls_three_of_five_aggregates_any_valid_subset` builds a trusted-dealer keyset for IDs 1 to 5, checks every share against its public share, asserts that both subset aggregates equal the blinded message times coefficients[0], and checks the first aggregate with a pairing against the aggregate key.
