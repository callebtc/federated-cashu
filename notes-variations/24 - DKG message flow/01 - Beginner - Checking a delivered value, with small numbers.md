# 24.01 · Checking a delivered value, with small numbers

Variation 1 of slide 24 (DKG message flow) · lens: Beginner · deck `fcv-d-flows-dkg` page 27 · 5 steps · script 138 words, about 60 s

## Script

One delivered value, checked with small numbers. The group is the powers of g = 4 modulo 107. g to the power a stands for a·G₂.

**[1]** m3's polynomial is f₃(x) = 3 + 6x. In its reveal it publishes commitments to its two coefficients: 4³ = 64 and 4⁶ = 30.

**[2]** It sends m2 the value f₃(2) = 3 + 6·2 = 15, privately, as a signed request on the secret-shares route.

**[3]** m2 raises g to the value it received: 4¹⁵ = 34 modulo 107.

**[4]** m2 evaluates the commitments at x = 2: A₃,₀ times A₃,₁ squared, 64 times 44, which is also 34. The two results agree, so m2 accepts the value.

**[5]** If m3 had sent 16, m2 would compute 4¹⁶ = 29, not 34. m2 rejects the value, and the error names m3 as the sender.

## Background

- **Toy group**: the numbers 4ᵃ modulo 107. There are 53 of them, so exponents work modulo 53. Multiplication here plays the role of point addition on the curve, and raising to a power plays the role of multiplying a point by a scalar.
- **Commitment Aⱼ,ₗ**: member j's coefficient aⱼ,ₗ hidden in the group: gᵃ here, a·G₂ on BLS12-381. In the real group the scalar cannot be recovered from the point.
- **The check**: g^{fⱼ(i)} must equal Πₗ Aⱼ,ₗ^{iˡ}. Written additively, fⱼ(i)·G₂ = Σₗ iˡ·Aⱼ,ₗ. Both sides equal (aⱼ,₀ + aⱼ,₁·i)·G₂ when the value is correct.
- **Feldman-style commitments**: commitments to the coefficients without a blinding term. They let a receiver check its value without learning the coefficients.
- **Why the sender is named**: the value arrives in a request signed with the sender's identity key, so a failed check is attributable to that sender.

## Speaker note

- All numbers are toy values computed for the slide (source comment: computed with python), not spec or test vectors.
