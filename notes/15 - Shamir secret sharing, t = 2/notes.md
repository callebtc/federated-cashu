# 15 · Shamir secret sharing, t = 2

1.2 Threshold issuance · 4 steps · script 131 words, about 55 s

## Script

**[1]** Shamir secret sharing splits the key k. Pick a random polynomial of degree t − 1 whose value at zero is k. With t = 2 that is a straight line through the point (0, k).

**[2]** Member i stores the value of the line at x = i. Member IDs start at one, because the value at zero is the secret itself.

**[3]** A single share is one point. Every line through that point is possible, and each has a different value at zero. So one share says nothing about k.

**[4]** Two points fix the line, and with it f(0). In general, any t shares determine the polynomial.

The federation uses one polynomial per amount in the keyset. Issuance never rebuilds k. The next slide shows how signature shares are combined instead.

## Background

- **Polynomial of degree t − 1**: f(x) = k + a₁x + … + aₜ₋₁xᵗ⁻¹ with random coefficients. Degree 1 is a line, degree 2 a parabola.
- **Why t points fix it**: a polynomial of degree t − 1 has t unknown coefficients; t points give t equations with exactly one solution.
- **Secrecy with fewer than t shares**: every possible value of k is equally consistent with the shares held.
- **Real arithmetic vs. the drawing**: the implementation computes modulo the group order of BLS12-381. The slide draws real numbers only to make the line visible.
