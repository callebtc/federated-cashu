# 19.02 · Preconditions of the attack and what removes each

Variation 2 of slide 19 (Mix-and-match across members) · lens: Advanced · deck `fcv-c-ordering` page 4 · 4 steps · script 140 words, about 60 s

## Script

Three preconditions; the right column shows what the federation does with each.

**[1]** First: shares verify one by one with the pairing check e(C′ᵢ, G₂) = e(B′, Kᵢ), and any t valid shares on one B′ interpolate to k·B′. This is kept: the wallet aggregates any t responses. So shares may only exist for agreed outputs.

**[2]** Second: a member judges a request only against its own state, and every window of w outputs passes. Ordering removes this: members act on the AlephBFT log, and a second output set for the same quote hits the conflict key Mint quote.

**[3]** Third: a share refers to one output, not to the request. Signing now needs an accepted journal entry whose outputs equal the requested ones. Share rows store the operation ID.

**[4]** Three regression tests: the naive attack succeeds, the mint and swap variants fail.

## Background

- **Pairing check**: e is a bilinear pairing on BLS12-381. C′ᵢ = kᵢ·B′ is member i's share, G₂ the fixed generator, Kᵢ = kᵢ·G₂ the member's published public share. The equation holds only if the share was made with kᵢ, so the wallet can check each share alone.
- **Interpolation**: t shares of the same output, each multiplied by its Lagrange weight and summed, give k·B′. The weights depend only on which members answered.
- **Window of w outputs**: a request with the paid number of outputs, w, chosen as a different overlapping subset for each member.
- **AlephBFT**: the consensus library the members run. All honest members output the same ordered log of operations.
- **Conflict key `Mint { quote }`**: a value derived from the quote ID. Two different operations with the same key cannot both be issued.
- **`FederationAcceptedSigningRequest`**: built only from an accepted journal entry. It recomputes the operation ID from the envelope and rejects outputs that differ from the accepted ones (`crates/cdk-common/src/federation/signing.rs`).
- **Regression tests**: `naive_local_signing_allows_sliding_window_quorum_cover` (n = 4, t = 3; windows ABC, BCD, CDA, DAB give every output 3 shares), `runtime_config_rejects_sliding_window_mint_output_attack` (one mint accepted, three `ConflictingOperation`), `local_federated_members_reject_sliding_window_swap_output_attack` (one swap view gets shares, three fail).
