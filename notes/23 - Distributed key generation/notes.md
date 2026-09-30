# 23 · Distributed key generation

1.4 Keys and membership · 4 steps · script 140 words, about 60 s

## Script

No single dealer ever knows the key. A toy example with three members and straight lines.

**[1]** Each member picks its own random line: 2 + x, 4 − x and 1 + x.

**[2]** Each member sends member i the value of its line at i. Member 1 receives 3, 3 and 2.

**[3]** Each member adds up what it received: member 1 gets 8, member 2 gets 9, member 3 gets 10. These are points on the sum of the three lines, 7 + x. Each member now holds a share of that sum line.

**[4]** The key is the sum line at zero: 2 + 4 + 1 = 7. Nobody computes it, because each member only knows its own constant. The public key K is published, and members publish commitments to their lines so every received value can be checked.

## Background

- **DKG (distributed key generation)**: the members jointly create a key pair so that each holds a share of the private key and nobody ever knows the whole private key.
- **Why adding works**: adding polynomials gives a polynomial. The value each member holds is the sum line evaluated at its ID, which is exactly a Shamir share of the sum's value at zero.
- **Dealer**: in plain Shamir sharing, one party knows k and hands out shares. A DKG removes that party.
- **Commitments (Feldman)**: each member publishes its coefficients multiplied by G₂. A receiver checks the value it got against them without learning the coefficients. K is the sum of the constant-term commitments.
- **Real arithmetic**: the implementation uses random polynomials of degree t − 1 modulo the BLS12-381 group order, one per amount. The code calls it `PedersenDkg`.
