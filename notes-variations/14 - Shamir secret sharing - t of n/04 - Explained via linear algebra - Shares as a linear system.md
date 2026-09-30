# 14.04 · Shares as a linear system

Variation 4 of slide 14 (Shamir secret sharing - t of n) · lens: Explained via linear algebra · deck `fcv-b-threshold` page 14 · 4 steps · script 136 words, about 60 s

## Script

Shamir sharing as a linear system, t = 2. The matrix rows are (1, i), the unknowns k and a₁, the right side the shares 4.2, 5.4 and 6.6.

**[1]** Each share is one linear equation: k + i·a₁ = f(i).

**[2]** Row 1 alone: k + a₁ = 4.2. Every k has a matching a₁ = 4.2 − k.

**[3]** Rows 1 and 2: determinant 1·2 − 1·1 = 1, not zero, so one solution: k = 3, a₁ = 1.2.

**[4]** The inverse is (2, −1; −1, 1). Its first row gives k: 2·4.2 − 1·5.4 = 3. Those entries are the Lagrange weights, λ₁ = 2 and λ₂ = −1.

For t shares the matrix is t×t Vandermonde, invertible exactly when the IDs are distinct. ID 0 would be the row (1, 0, …), the secret itself.

## Background

- **Linear system**: equations of the form (row) · (unknowns) = value. With as many independent equations as unknowns there is exactly one solution.
- **Determinant**: for a 2×2 matrix (a, b; c, d) it is ad − bc. Non-zero means the matrix is invertible.
- **Vandermonde matrix**: rows (1, i, i², …, iᵗ⁻¹), one per share ID i. Its determinant is the product of (j − i) over all pairs of IDs, so it is non-zero exactly when the IDs are distinct.
- **First row of the inverse**: (k, a₁) = inverse · shares, so k is the first row of the inverse times the shares. Those coefficients are the Lagrange weights at x = 0.
- **Why duplicates are rejected**: two equal IDs give two equal rows, the determinant is zero, and k cannot be solved for. The implementation rejects duplicate signer IDs.
- **Why ID 0 is forbidden**: the row for x = 0 is (1, 0, …, 0), so that share would be k itself.
