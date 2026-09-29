# 16.05 · What a faulty member can return

Variation 5 of slide 16 (Threshold blind signing) · lens: Perspective: Byzantine member · deck `fcv-b-threshold` page 32 · 6 steps · script 137 words, about 60 s

## Script

What a faulty member, m3, can return instead of its share.

**[1]** A random G₁ point R. The check e(R, G₂) = e(B′, K₃) fails; m3 is ignored for this request.

**[2]** k₃·B″, a correct share for a different blinded message B″. The pairing check uses the requested B′, so it fails.

**[3]** m1's valid share C′₁. The signer ID is the member that answered, so it is checked against K₃ and fails.

**[4]** A valid share with a wrong amount or keyset ID. The metadata check against the requested output rejects it before any pairing.

**[5]** No response. Withholding costs only liveness: t shares from the other members suffice.

**[6]** m3 cannot learn x: it sees only B′ = r·Y. It cannot finish a signature alone: it holds one share. And a share that fails its Kᵢ check never enters the interpolation.

## Background

- **Byzantine member**: a member that may deviate arbitrarily: send wrong data, copy other members' data, or stay silent.
- **Why a random point fails**: e(R, G₂) = e(B′, K₃) holds only if R = k₃·B′.
- **Share for another message**: k₃·B″ is correctly formed, but the check binds the share to the requested B′.
- **Signer ID from the member**: the wallet builds the share with `member_id.to_bls_signer_id()` for the member that answered and looks up that member's Kᵢ, so a copied share fails.
- **Metadata check**: `validate_signature_metadata` requires amount and keyset ID to match the requested output; a mismatch invalidates the member's whole response.
- **Liveness and safety**: withholding can delay or prevent issuance if fewer than t valid responses remain; it cannot produce a wrong signature.
- **Blindness**: B′ = r·Y with a random r the member never sees, so B′ reveals nothing about Y or x.
