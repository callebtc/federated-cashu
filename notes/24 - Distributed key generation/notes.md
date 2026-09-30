# 24 · Distributed key generation

1.4 Keys and membership · 5 steps · script 139 words, about 60 s

## Script

**[1]** This is the goal: one shared line. Its value at zero is the key k, and each member should end up with one point on it. The question is how to get this line without anyone ever knowing k.

**[2]** Each member picks its own random line: 2 + x, 4 − x and 1 + x.

**[3]** Each member evaluates its line at every other member's position and sends that value privately to that member.

**[4]** Each member adds up the three values it received. Member one gets 3 + 3 + 2 = 8, member two 9, member three 10.

**[5]** Those sums lie exactly on the goal line, 7 + x, because adding lines gives a line. The key is 2 + 4 + 1 = 7, but nobody ever computed it: each member only knew its own starting value.

## Background

- **DKG (distributed key generation)**: the members jointly create a key so that each holds a share and nobody holds the whole key.
- **Why adding works**: the sum of polynomials is a polynomial. A member's sum is the combined polynomial evaluated at its ID, which is exactly a Shamir share of the combined constant term.
- **Commitments**: in the real protocol each member also publishes its coefficients multiplied by a generator point, so receivers can check the values they get without learning them.
- **Real arithmetic**: random polynomials of degree t − 1, modulo the BLS12-381 group order, one per amount. The code calls it `PedersenDkg`.
