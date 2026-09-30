# 12.01 · Blind BLS with toy numbers

Variation 1 of slide 12 (Blind BLS signatures on BLS12-381 (keyset v3)) · lens: Beginner · deck `fcv-a-bls` page 19 · 6 steps · script 134 words, about 55 s

## Script

Toy groups G₁ and G₂ with 13 elements. The pairing e multiplies the multiples: e(a·G₁, b·G₂) = g to the a·b, exponents mod 13.

**[1]** The mint has k = 7 and publishes K = 7·G₂. The wallet hashes x to Y = 5·G₁.

**[2]** It blinds by multiplication with r = 3: B′ = 15·G₁ = 2·G₁, and sends it.

**[3]** The mint returns C′ = k·B′ = 14·G₁ = 1·G₁.

**[4]** The wallet checks the blind signature. e(C′, G₂) = g¹ and e(B′, K) = g¹⁴ = g¹. They match.

**[5]** It unblinds with r⁻¹ = 9, because 3·9 = 27 = 1 mod 13. C = 9·C′ = 9·G₁.

**[6]** Anyone can check the result. e(C, G₂) = g⁹, and e(Y, K) = e(5·G₁, 7·G₂) = g³⁵ = g⁹. Only the public K is used, not k.

## Background

- **G₁, G₂**: two groups of points. In the real scheme they are subgroups of BLS12-381 with a 255-bit prime order; here they have 13 elements. Messages and signatures live in G₁, keys in G₂.
- **Pairing e**: a function that takes a point of G₁ and a point of G₂ and returns an element of a third group, G_T. Its defining property is bilinearity: e(a·P, b·Q) = e(P, Q)^(a·b).
- **g = e(G₁, G₂)**: the pairing of the two generators. Every result in the toy example is g raised to some exponent mod 13.
- **Multiplicative blinding**: B′ = r·Y instead of Y + r·G. It is removed by multiplying with r⁻¹.
- **Inverse mod 13**: r⁻¹ is the number with r·r⁻¹ = 1 mod 13. For r = 3 it is 9.
- **Blind check**: e(C′, G₂) = e(B′, K) holds exactly when C′ = k·B′. The wallet can run it before unblinding, with values it already has.
