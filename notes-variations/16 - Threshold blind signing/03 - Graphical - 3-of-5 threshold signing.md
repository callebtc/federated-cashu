# 16.03 · 3-of-5 threshold signing

Variation 3 of slide 16 (Threshold blind signing) · lens: Graphical · deck `fcv-b-threshold` page 30 · 5 steps · script 115 words, about 50 s

## Script

Threshold signing with t = 3 and n = 5. The wallet is on the left, the five members on the right.

**[1]** The wallet sends the blinded message B′ to all five members.

**[2]** m4 is offline. m1, m2, m3 and m5 return shares.

**[3]** The wallet checks each share with e(C′ᵢ, G₂) = e(B′, Kᵢ). m1, m3 and m5 pass. m2's share fails the check and is dropped.

**[4]** The three valid shares are combined, C′ = Σ λᵢ·C′ᵢ, with the Lagrange weights for S = {1, 3, 5}.

**[5]** The wallet unblinds, C = r⁻¹·C′, and holds an ordinary proof (x, C). One member offline and one faulty did not stop signing, because three valid shares remained.

## Background

- **B′ = r·H(x)**: the blinded message; members never see x.
- **Per-share pairing check**: holds exactly when C′ᵢ = kᵢ·B′ for the published Kᵢ = kᵢ·G₂.
- **λᵢ for S = {1, 3, 5}**: 15/8, −5/4 and 3/8 as fractions; in 𝔽ᵣ they are field elements.
- **Unblinding**: multiplying by r⁻¹ removes the blinding: C = k·H(x).

## Speaker note

- The figure leaves out ordering. With n = 5 the consensus threshold is c = 4 and the BFT model tolerates one faulty member. With m4 offline, the operation is accepted only if the other four, including the faulty m2, take part in consensus. Do not present "one offline plus one faulty" as tolerated in general; it is tolerated here for the signing step.
