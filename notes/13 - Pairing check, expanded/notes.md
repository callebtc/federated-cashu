# 13 · Pairing check, expanded

1.1 BLS blind signatures · 6 steps · script 120 words, about 50 s

## Script

This is why the check works, one step per line. Start from e(C, G₂).

**[1]** C is r⁻¹·C′. **[2]** C′ is k·r·Y. **[3]** r⁻¹ times r is one, which leaves k·Y.

**[4]** Bilinearity moves the scalar k out of the first argument into the exponent. **[5]** And back in, into the second argument, as k·G₂. **[6]** k·G₂ is the published key K.

So e(C, G₂) = e(Y, K), and both sides use only public values. The blind check before unblinding is the same derivation without r.

For many proofs there is batch verification. Each signature gets a random weight hᵢ, derived from a SHA-256 transcript with the tag Cashu_BLS_Batch_v1. The verifier checks one combined equation. The random weights prevent one invalid signature from cancelling out another.

## Background

- **Bilinearity**: e(a·P, Q) = e(P, Q)^a = e(P, a·Q). A number multiplying either input can be moved to the exponent of the result, or to the other input.
- **Exponent notation**: the pairing's output group is written multiplicatively, so "multiplying by k" there appears as "raising to the power k".
- **Batch verification**: checking n signatures with one combined equation, e(Σ hᵢ·Cᵢ, G₂) = Π e(hᵢ·Yᵢ, Kᵢ). Σ is a sum, Π is a product. It is cheaper than n separate checks.
- **Why random weights**: with all weights equal to 1, two invalid signatures whose errors add up to zero would pass together. Random weights unknown in advance make that infeasible.
- **Rejection sampling into 𝔽ᵣ\***: take a hash output as a number; if it is zero or not below the group order, discard it and hash again. The result is a uniform non-zero scalar.
