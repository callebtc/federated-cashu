# 29.01 · Adding a public tweak to threshold shares

Variation 1 of slide 29 (Two DKG ceremonies, one roster) · lens: Beginner · deck `fcv-e-membership-custody` page 27 · 5 steps · script 140 words, about 60 s

## Script

Toy numbers modulo 97: secret s is 13, line f of x is 13 plus 7x.

**[1]** Member i holds the line's value at x equals i: 20, 27, 34. The secret is the value at 0.

**[2]** Two points fix a line. Lagrange weights recombine shares into the secret; for m1 and m2 they are 2 and minus 1, and sum to 1. 2 times 20 minus 27 is 13.

**[3]** Each member adds the public tweak tau equals 5: 25, 32, 39.

**[4]** The same weights give 2 times 25 minus 32, which is 18, or 13 plus 5: shares of s plus tau.

**[5]** The public key P is s times G, with G the curve's generator. It becomes P plus tau times G, computable by anyone; nobody computes s. In CDK the tweak is the application tweak plus two BIP32 tweaks.

## Background

- **Modulo 97**: all arithmetic wraps around at 97, the way secp256k1 arithmetic wraps around at the group order n. 97 keeps the numbers small.
- **Shamir secret sharing**: the secret is the constant term of a random polynomial of degree t − 1; member i receives the value at x = i. Any t values determine the polynomial; fewer reveal nothing about the secret. Here t = 2, so the polynomial is a line.
- **Lagrange weights**: for a set of members S, λᵢ = Π over j in S, j ≠ i, of xⱼ / (xⱼ − xᵢ). The secret is Σ λᵢ · shareᵢ. For S = {1, 2}: λ₁ = 2/(2 − 1) = 2, λ₂ = 1/(1 − 2) = −1.
- **Why the tweak passes through**: the weights always sum to 1, so Σ λᵢ(shareᵢ + τ) = s + τ·Σ λᵢ = s + τ. Adding the same public number to every share adds it to the secret.
- **G**: the generator point of secp256k1. P = s·G is the public key; P + τ·G is the public key of s + τ, and computing it needs only P and τ.
- **Tweak in CDK**: a + b₀ + bⱼ, where a is the application tweak and b₀, bⱼ are the public BIP32 tweaks for branch and index. This is why BIP32 child keys can be derived without reconstructing the root.
