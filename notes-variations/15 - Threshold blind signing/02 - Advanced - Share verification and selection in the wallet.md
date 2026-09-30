# 15.02 · Share verification and selection in the wallet

Variation 2 of slide 15 (Threshold blind signing) · lens: Advanced · deck `fcv-b-threshold` page 29 · 6 steps · script 139 words, about 60 s

## Script

The wallet side as implemented in crates/cdk/src/wallet/federation.rs, in six stages.

**[1]** Fan-out. FederatedMintConnector sends the same Cashu request to every member's public_mint_url.

**[2]** Metadata, per member. Each signature must match its output's amount and keyset ID, checked by validate_signature_metadata.

**[3]** Batch pairing check, per member. All of one member's shares go into one multi-pairing, with non-zero weights from a SHA-256 transcript under the tag Cashu_BLS_Blind_Batch_v1. The signer ID comes from the member that answered, not from the response.

**[4]** Fallback. If the batch fails, verify_blind_signature_share runs per output and names the bad share; the member is ignored.

**[5]** Selection. Members are grouped by identical lists of amount and keyset ID. The first group with at least t members is used, and exactly t are taken.

**[6]** Aggregation, per output, into a BlindSignature with dleq set to None. Without a compatible group the result is InvalidMintResponse.

## Background

- **public_mint_url**: each member's ordinary Cashu HTTP endpoint; wallets use only these.
- **Metadata check**: also rejects a share that carries DLEQ data. For change and restore outputs the requested amount may be zero; then any returned amount is accepted.
- **Multi-pairing**: several pairings computed together, sharing one final exponentiation, the expensive last step of a pairing.
- **Batch equation (right column)**: e(−Σ wⱼ·C′ⱼ, G₂) · Π e(Σ wⱼ·B′ⱼ, K_{i,a}) = 1, one factor per key K_{i,a}, member i's public share for amount a. If all shares are valid the factors cancel. The weights wⱼ prevent errors in two shares from cancelling each other.
- **Transcript weights**: SHA-256 over the tag and every (share, key, blinded message), then one hash per index with a counter, rejecting zero and values not below r.
- **Signer ID from the member**: the wallet builds each share with `member_id.to_bls_signer_id()` and looks up that member's public share, so a member cannot present another member's share as its own.
- **Grouping**: members that signed different (amount, keyset ID) lists answered different requests and cannot be combined.
- **dleq: None**: v3 signatures carry no DLEQ proof (NUT-12).
- **InvalidMintResponse**: the message reads "insufficient valid federation signature shares" and lists the ignored members.
