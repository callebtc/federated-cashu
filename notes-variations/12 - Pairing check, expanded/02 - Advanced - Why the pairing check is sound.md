# 12.02 · Why the pairing check is sound

Variation 2 of slide 12 (Pairing check, expanded) · lens: Advanced · deck `fcv-a-bls` page 28 · 5 steps · script 140 words, about 60 s

## Script

**[1]** The properties used are bilinearity, e(a·P, b·Q) = e(P, Q)^ab, and non-degeneracy. G₁, G₂ and G_T have 255-bit prime order. The pairing is Type-3: no efficient map between G₁ and G₂.

**[2]** The check accepts exactly one C. e(C, G₂) = e(k·Y, G₂) implies C = k·Y, because P ↦ e(P, G₂) is injective on G₁.

**[3]** Forging a new (x, C) needs k·H(x) from K and earlier signatures: a one-more CDH-type problem, with H modelled as a random oracle. Blind BLS was analysed by Boldyreva, PKC 2003.

**[4]** The blind check implies the final check: C′ = k·r·Y, so r⁻¹·C′ = k·Y. After a passing blind check, the final check fails only if the wallet used a wrong r or Y.

**[5]** Not the pairing's job: point validation, the spent set, and batch weights that cannot be predicted before the Cᵢ are fixed.

## Background

- **Non-degenerate**: the pairing of the two generators is not the neutral element of G_T. Otherwise every pairing would be 1 and the check would say nothing.
- **Prime order**: the groups have r elements with r a 255-bit prime (`BLS_FR_ORDER`). Every non-identity point generates the whole group.
- **Type-3 pairing**: G₁ ≠ G₂ and no efficient map from one to the other is known. NUT-00 states that BLS12-381 is used with a Type-3 pairing.
- **Injective**: different inputs give different outputs. If e(C, G₂) = e(k·Y, G₂), then e(C − k·Y, G₂) = 1, which with a non-degenerate pairing of prime order forces C − k·Y = O.
- **CDH (computational Diffie–Hellman)**: given a·P and b·P, compute a·b·P. "One-more" variants give the attacker some signatures and ask for one more than it received.
- **Random oracle**: a security proof models the hash as a perfectly random function. It is a standard assumption for hash-then-sign schemes like BLS.
- **Not covered by the pairing**: invalid encodings, identity and small-subgroup points are rejected at parsing; double spends by the mint's spent set; batch cancellation by weights derived after the signatures are fixed.

## Speaker note

- General-knowledge fact, not from the spec or code: "Boldyreva, PKC 2003". This is correct: A. Boldyreva, "Threshold Signatures, Multisignatures and Blind Signatures Based on the Gap-Diffie-Hellman-Group Signature Scheme", PKC 2003, which proves blind BLS secure in the random-oracle model under a chosen-target (one-more) CDH assumption. The slide's "one-more CDH-type problem" matches.
- "255 bits" is the bit length of `BLS_FR_ORDER` from NUT-00/NUT-13 (computed, not stated in the spec).
