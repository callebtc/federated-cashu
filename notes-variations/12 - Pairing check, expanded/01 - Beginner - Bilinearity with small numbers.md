# 12.01 · Bilinearity with small numbers

Variation 1 of slide 12 (Pairing check, expanded) · lens: Beginner · deck `fcv-a-bls` page 27 · 5 steps · script 137 words, about 60 s

## Script

The pairing e takes a point of G₁ and a point of G₂ and returns an element of G_T. Write g for e(G₁, G₂). Bilinear means e(a·P, b·Q) = e(P, Q) to the power a·b.

**[1]** e(2·G₁, 3·G₂) = g⁶. Both multiples end up in the exponent: 2·3 = 6.

**[2]** e(6·G₁, G₂) = g⁶. The factor 3 can move to the G₁ side.

**[3]** e(G₁, 6·G₂) = g⁶. Or both factors can move to the G₂ side.

**[4]** The same move with the mint key: e(k·Y, G₂) = e(Y, k·G₂) = e(Y, K). k leaves the signature and appears inside the public key K.

**[5]** A toy check mod 13, with Y = 5·G₁, k = 7 and C = 9·G₁. e(9·G₁, G₂) = g⁹, and e(5·G₁, 7·G₂) = g³⁵ = g⁹. They are equal, and the verifier never used k.

## Background

- **G₁, G₂, G_T**: three groups of the same prime order. G₁ and G₂ are groups of curve points; G_T is where pairing results live.
- **Exponent notation**: G_T is written multiplicatively, so a multiple k in G₁ or G₂ turns into a power k in G_T.
- **Bilinearity**: e(a·P, Q) = e(P, Q)^a = e(P, a·Q). A multiplier can move from either input to the exponent, and from the exponent into the other input.
- **Why this verifies a signature**: C = k·Y is a multiple of Y by the secret k. The pairing moves k onto G₂, where k·G₂ is the published K. The verifier needs K, not k.
- **Toy numbers**: 35 = 2·13 + 9, so g³⁵ = g⁹ when exponents are taken mod 13.
