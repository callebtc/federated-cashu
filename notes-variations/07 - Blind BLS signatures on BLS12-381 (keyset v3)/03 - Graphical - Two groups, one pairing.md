# 07.03 · Two groups, one pairing

Variation 3 of slide 07 (Blind BLS signatures on BLS12-381 (keyset v3)) · lens: Graphical · deck `fcv-a-bls` page 21 · 6 steps · script 113 words, about 50 s

## Script

Two groups and a target. G₁ points take 48 bytes, G₂ points 96 bytes. The pairing maps one point of each into G_T.

**[1]** In G₁ the wallet hashes x to Y. In G₂ the mint's key K is the generator G₂ multiplied by k.

**[2]** Multiplying Y by r gives B′.

**[3]** The mint multiplies B′ by k and gets C′.

**[4]** The blind check pairs C′ with G₂, and B′ with K. e(C′, G₂) = e(B′, K) holds.

**[5]** Multiplying C′ by r⁻¹ gives C, still in G₁.

**[6]** The final check pairs C with G₂, and Y with K. e(C, G₂) = e(Y, K) holds. Messages and signatures live in G₁; only keys live in G₂.

## Background

- **G₁ and G₂**: two groups of points on BLS12-381, each of the same 255-bit prime order. A compressed G₁ point is 48 bytes; a compressed G₂ point is 96 bytes, because its coordinates are pairs of field elements.
- **G_T**: the target group of the pairing, a group of numbers in an extension field. Pairing results are compared there.
- **Pairing e(P, Q)**: takes P from G₁ and Q from G₂. Bilinearity lets a multiplier move between the two inputs: e(k·P, Q) = e(P, k·Q).
- **Why keys in G₂**: every proof carries its signature C, so putting C in G₁ keeps each proof at 48 bytes. Each 96-byte key is fetched once per keyset.
- **Two checks**: the blind check uses B′ and C′ before unblinding; the final check uses Y and C after. Both use the same K.
