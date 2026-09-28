# 14.04 · Threshold signing as a message sequence

Variation 4 of slide 14 (Threshold blind signing) · lens: Explained via sequence diagram · deck `fcv-b-threshold` page 31 · 6 steps · script 128 words, about 55 s

## Script

The same flow as a message sequence, with three members and t = 2. Lifelines for the wallet, m1, m2 and m3; time runs downward.

**[1]** The wallet sends the same request, with B′, to every member.

**[2]** The members first order the operation. It is accepted by consensus, section 1.3, before any share is computed.

**[3]** Each member that accepted it computes its share: C′₁ = k₁·B′, C′₂ = k₂·B′, C′₃ = k₃·B′.

**[4]** Shares go to the wallet, not to other members. m1 and m3 respond. m2 accepted the operation, but its response times out.

**[5]** The wallet checks each share against Kᵢ: e(C′ᵢ, G₂) = e(B′, Kᵢ).

**[6]** With t = 2 shares it interpolates, C′ = λ₁·C′₁ + λ₃·C′₃, unblinds, C = r⁻¹·C′, and verifies e(C, G₂) = e(Y, K).

## Background

- **Lifeline**: the vertical line of one party; arrows between lifelines are messages.
- **Ordering (section 1.3)**: each member submits the request to AlephBFT consensus; only operations accepted into the common order are applied and signed, and each share is bound to its operation.
- **n = 3**: c = n − ⌊(n − 1)/3⌋ = 3, so all three members take part in ordering, while two responses suffice for signing.
- **Timeout**: m2 did its work, but the wallet stops waiting for it once it has t valid shares.
- **λ₁, λ₃ for S = {1, 3}**: 3/2 and −1/2.
- **Final check**: e(C, G₂) = e(Y, K) with Y = H(x), the same check any v3 wallet runs.
