# 13.07 · Interpolating a bad share

Variation 7 of slide 13 (Lagrange interpolation at x = 0) · lens: Framing: failure mode · deck `fcv-b-threshold` page 26 · 5 steps · script 129 words, about 55 s

## Script

What happens when interpolation receives a bad share.

**[1]** Honest shares are C′ᵢ = f(i)·B′ with f(x) = 3 + 1.2x: m1 returns 4.2·B′, m2 5.4·B′, m3 6.6·B′.

**[2]** m2 returns 6.4·B′ instead of 5.4·B′.

**[3]** With S = {1, 2}: 2·4.2 − 1·6.4 = 2, so C′ = 2·B′, not k·B′. Interpolation still yields a point, the wrong one. After unblinding, C = 2·Y and the check e(C, G₂) = e(Y, K) fails. The error is λ₂·δ·B′ with δ = 1. The sum does not say which share was wrong.

**[4]** Checking each share against its public share Kᵢ first identifies m2. m1 passes: e(C′₁, G₂) = e(B′, K₁). m2 fails and is dropped.

**[5]** Use m3 instead. S = {1, 3}: 1.5·4.2 − 0.5·6.6 = 3, so C′ = 3·B′ = k·B′.

## Background

- **Error term**: if m2's share is off by δ, the aggregate is off by λ₂·δ·B′. With λ₂ = −1 and δ = 1 the result is 3 − 1 = 2.
- **Why the final check cannot name the culprit**: it tests only the sum against K, and an error in any share changes the sum.
- **Per-share check**: e(C′ᵢ, G₂) = e(B′, Kᵢ) with Kᵢ = kᵢ·G₂ published per member. It holds exactly when C′ᵢ = kᵢ·B′, so each member is checked on its own.
- **In the wallet**: shares are checked per member before aggregation (a batch pairing check, with a per-share fallback that names the bad share); invalid members are ignored and t valid ones are used.
- **aggregate_blind_signature_shares**: also rejects fewer than t shares and duplicate signer IDs.
- **Unblinding**: C = r⁻¹·C′, so an aggregate 2·B′ = 2r·Y unblinds to 2·Y.

## Speaker note

- Both sums were recomputed with python3 (2·4.2 − 6.4 = 2; 1.5·4.2 − 0.5·6.6 = 3). Correct.
