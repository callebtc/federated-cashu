# 13.05 · Attempts against the pairing check

Variation 5 of slide 13 (Pairing check, expanded) · lens: Perspective: attacker · deck `fcv-a-bls` page 31 · 5 steps · script 135 words, about 60 s

## Script

**[1]** Present C for a new secret x without k. C must equal k·H(x). Computing that from K and old signatures is a one-more CDH-type problem.

**[2]** Publish, or slip in, the identity O as a key. e(Y, O) = 1, so C = O would pass for every x. Identity points MUST be rejected; in CDK they fail on parse.

**[3]** Send a B′ with a small-order component. C′ = k·B′ would leak k modulo that order. B′ MUST lie in the prime-order subgroup.

**[4]** In one batch, send C₁ + Δ and C₂ − Δ. An unweighted sum would still match. Weighted, the error is (w₁ − w₂)·Δ, and the weights are hashed from the submitted Cᵢ.

**[5]** Spend a valid (x, C) a second time. The pairing passes again. The spent set of Y values rejects it.

## Background

- **One-more CDH**: given some signatures k·H(xᵢ) and K, produce a valid signature on a new message. Believed infeasible; blind BLS security rests on it.
- **Identity point O**: the neutral element. e(P, O) = 1 for every P, so an identity key would accept the identity as a signature on any secret.
- **Small-order component**: a point outside the prime-order subgroup can be written as a prime-order part plus a part of small order h. k times the small part reveals k mod h.
- **Batch cancellation**: with all weights 1, errors +Δ and −Δ add to zero. With weights w₁ ≠ w₂ the sum carries (w₁ − w₂)·Δ ≠ O. Because the weights are derived from a hash of the Cᵢ, the attacker cannot choose Δ after knowing them.
- **Spent set**: the mint's record of Y = hash_to_curve_G1(x) for every redeemed proof. The pairing proves authenticity; the spent set prevents reuse.
