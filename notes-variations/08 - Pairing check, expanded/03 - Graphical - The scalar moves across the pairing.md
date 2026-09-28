# 08.03 · The scalar moves across the pairing

Variation 3 of slide 08 (Pairing check, expanded) · lens: Graphical · deck `fcv-a-bls` page 29 · 5 steps · script 93 words, about 40 s

## Script

The pairing drawn as two slots: the left one takes a point of G₁, the right one a point of G₂.

**[1]** The left slot holds C, written out: C = r⁻¹·C′ = r⁻¹·k·r·Y. The right slot holds G₂.

**[2]** r⁻¹ times r is one. Both blinding factors cancel, and k·Y is left.

**[3]** Bilinearity: e(k·P, Q) = e(P, k·Q). The scalar k moves from the G₁ slot to the G₂ slot.

**[4]** k·G₂ is the published key K.

**[5]** Result: e(C, G₂) = e(Y, K). The blind check uses the same move: e(k·B′, G₂) = e(B′, K).

## Background

- **Slots**: the pairing e(P, Q) takes P from G₁ (left) and Q from G₂ (right). Scalars can be written in front of either input.
- **r⁻¹·r = 1**: the blinding factor and its inverse modulo the group order multiply to one, so they cancel.
- **Bilinearity**: e(k·P, Q) = e(P, Q)^k = e(P, k·Q). A scalar can pass from one input to the other.
- **K = k·G₂**: the mint's public key for the amount. Once k sits on the G₂ side, the verifier can substitute the published K.
- **Blind check**: the same derivation with B′ in place of Y and C′ = k·B′ in place of C.
