# 12.07 · Checking C′ before unblinding

Variation 7 of slide 12 (Blind BLS signatures on BLS12-381 (keyset v3)) · lens: Focus: the blind check · deck `fcv-a-bls` page 25 · 5 steps · script 115 words, about 50 s

## Script

**[1]** For each requested output the wallet keeps x, r and B′ = r·Y.

**[2]** The mint returns C′ per output. The wallet first checks that each returned amount and keyset id match the request.

**[3]** Then the blind check, e(C′, G₂) = e(B′, K), with values the wallet already has, for all outputs of the response in one batch. In a federation the wallet runs the same check on each member's share, against Kᵢ.

**[4]** If it fails, the wallet rejects the response. No proof is stored.

**[5]** Otherwise it unblinds, C = r⁻¹·C′ = k·Y, and keeps the proof (x, C). Receivers later check e(C, G₂) = e(Y, K). After a passing blind check this holds by bilinearity.

## Background

- **Blind check**: the pairing equation on the blinded values. It holds exactly when C′ = k·B′.
- **Why amount and keyset id first**: the mint controls these fields in its response. A mismatch would make the wallet look up the wrong key.
- **Batch**: all v3 signatures of one response are checked in one multi-pairing with transcript-derived weights. In CDK the transcript for blind signatures uses the tag `Cashu_BLS_Blind_Batch_v1` and covers C′, K and B′ of every output.
- **Why the final check follows**: if C′ = k·B′ = k·r·Y, then r⁻¹·C′ = k·Y, and e(k·Y, G₂) = e(Y, k·G₂) = e(Y, K).
- **Per-share check in a federation**: each member's share C′ᵢ is checked with e(C′ᵢ, G₂) = e(B′, Kᵢ) before the wallet interpolates; an invalid share identifies the faulty member.

## Speaker note

- The slide's code reference `validate_mint_response_signatures` (`crates/cdk/src/wallet/blind_signature.rs`) is the amount/keyset check and the batched blind check on the returned signatures. The per-share check against Kᵢ is a different function: `valid_member_share_set` in `crates/cdk/src/wallet/federation.rs`, calling `batch_verify_blind_signature_shares` with a per-share fallback.
- The blind-signature batch tag `Cashu_BLS_Blind_Batch_v1` is from the code; NUT-00 in nuts#443 defines only the proof batch tag `Cashu_BLS_Batch_v1`.
