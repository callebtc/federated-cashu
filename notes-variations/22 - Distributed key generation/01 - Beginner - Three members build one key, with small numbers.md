# 22.01 · Three members build one key, with small numbers

Variation 1 of slide 22 (Distributed key generation) · lens: Beginner · deck `fcv-d-flows-dkg` page 19 · 5 steps · script 139 words, about 60 s

## Script

Three members, t = 2.

**[1]** Each member picks a random line, a polynomial of degree t − 1 = 1: f₁(x) = 4 + x, f₂(x) = 2 + 5x, f₃(x) = 3 + 6x. Its constant term is the member's secret piece.

**[2]** Member j sends fⱼ(i), its line at x = i, privately to member i. m1 sends 5, 6 and 7.

**[3]** Each member adds the values it received. m2 gets 6, 12 and 15; its share k₂ is 33. m1 holds 21, m3 holds 45.

**[4]** The shares lie on the sum of the three lines: f(x) = 9 + 12x.

**[5]** The key k is f(0) = 4 + 2 + 3 = 9. Nobody adds these. Any two shares determine it: 2·21 − 33 = 9. Real values are modulo the group order, one polynomial per amount.

## Background

- **Polynomial of degree t − 1**: f(x) = a₀ + a₁x + … + aₜ₋₁xᵗ⁻¹. With t = 2 it is a line, fixed by any two points.
- **Share**: member i's value kᵢ = f(i) of the summed polynomial. Here k₁ = 21, k₂ = 33, k₃ = 45.
- **Sum of polynomials**: adding the three lines term by term gives 9 + 12x. Adding their values at x = i gives the value of the sum at x = i, so each member's sum is its share.
- **Lagrange interpolation**: for members {1, 2} the weights are 2 and −1, so k = 2·k₁ − k₂ = 42 − 33 = 9. Issuance never does this with keys; the wallet applies the weights to signature shares.
- **Modulo the group order**: in the real scheme all these numbers are integers modulo the order of the BLS12-381 groups, so they wrap around and reveal nothing through their size.
- **One polynomial per amount**: a keyset has one key per denomination, so each member samples one polynomial for every amount.

## Speaker note

- The lines and all values are toy numbers chosen for the slide (the source comment says computed with python); they are not test vectors.
