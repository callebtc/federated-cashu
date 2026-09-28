# 14 · Threshold blind signing

1.2 Threshold issuance · 7 steps · script 118 words, about 50 s

## Script

**[1]** The wallet blinds its secret once: B′ = r·H(x).

**[2]** It sends the same request to every member's public URL.

**[3]** Member i multiplies by its key share and returns C′ᵢ = kᵢ·B′. In code this is blind_sign_share.

**[4]** Member 2 does not answer. With t = 2, two responses are enough.

**[5]** The wallet checks each share with a pairing against that member's public share Kᵢ and drops invalid shares, so a faulty member cannot corrupt the result.

**[6]** It applies the Lagrange weights for S = {1, 3}: λ₁·C′₁ + λ₃·C′₃ = k·B′.

**[7]** It unblinds with r⁻¹ and verifies against the aggregate key K, like any v3 signature. The members never exchange shares with each other. The wallet is the aggregator.

## Background

- **Signature share**: one member's partial result, kᵢ·B′. Alone it is not a valid signature.
- **Public share Kᵢ = kᵢ·G₂**: published per member so that each share can be checked on its own: e(C′ᵢ, G₂) = e(B′, Kᵢ).
- **Aggregator**: the party that collects shares and combines them. Here it is the wallet, so no member ever holds a complete signature before the wallet does.
