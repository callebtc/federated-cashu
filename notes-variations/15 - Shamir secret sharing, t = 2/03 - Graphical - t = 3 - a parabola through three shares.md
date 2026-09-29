# 15.03 · t = 3: a parabola through three shares

Variation 3 of slide 15 (Shamir secret sharing, t = 2) · lens: Graphical · deck `fcv-b-threshold` page 13 · 4 steps · script 131 words, about 55 s

## Script

Shamir sharing with t = 3 and n = 5 members.

**[1]** With t = 3 the polynomial has degree t − 1 = 2: a parabola. Its value at x = 0 is the key k.

**[2]** Each member, m1 to m5, holds the height of the parabola at its ID, 1 to 5.

**[3]** Take two shares, from m2 and m4. The dashed curves are different parabolas through both points, and each crosses x = 0 at a different height. Two shares are consistent with any k.

**[4]** Adding m1's share leaves one parabola through all three points, and with it one value at zero. Three shares fix the parabola and k; the shares of m3 and m5 are not needed. In general, t shares determine a polynomial of degree t − 1.

## Background

- **Degree t − 1**: a polynomial with t coefficients; for t = 3, f(x) = k + a₁x + a₂x², a parabola.
- **Family through two points**: every parabola f(x) + c·(x − 2)(x − 4) passes through the shares at x = 2 and x = 4. Its value at zero is f(0) + 8c, so varying c gives any intercept.
- **Why three points fix it**: three unknown coefficients and three equations with distinct x values have exactly one solution.
- **Drawing vs. implementation**: the drawn curve is f(x) = 3 + 2.5x − 0.3x² over the real numbers (not printed on the slide). The implementation works in 𝔽ᵣ, where the same counting holds.
