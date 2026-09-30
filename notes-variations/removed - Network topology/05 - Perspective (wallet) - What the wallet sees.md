# removed.05 · What the wallet sees

Variation 5 of slide removed (Network topology) · lens: Perspective: wallet · deck `fcv-d-flows-dkg` page 15 · 4 steps · script 121 words, about 50 s

## Script

The federation from the wallet's side.

**[1]** The wallet holds the public config from the invite code: the federation ID, n public mint URLs, the thresholds t and c, the aggregate key K per amount, and each member's public share Kᵢ per amount. The config is checked on import.

**[2]** Every signing request goes to the n public URLs.

**[3]** Each member answers on its own, and the wallet checks every answer: each share against that member's Kᵢ, quote statuses by t identical responses, and the unblinded signature against K.

**[4]** Ordering, payment observations, AlephBFT units, catch-up and DKG messages all run under /federation/v1. The wallet does not see them. Its safety comes from thresholds and its own checks, not from watching the members agree.

## Background

- **Invite code**: the prefix cashufedA followed by URL-safe base64 of a JSON object with a version and the public federation config.
- **Checks on import**: the federation ID is recomputed from setup authorization, thresholds and roster; each keyset ID is recomputed; interpolating the Kᵢ reproduces K for every amount; the setup transcript and payment policy are validated.
- **K and Kᵢ**: K = k·G₂ is the aggregate public key per amount; Kᵢ = kᵢ·G₂ is member i's public share. Wallets verify tokens against K and shares against Kᵢ.
- **Share check**: e(C′ᵢ, G₂) = e(B′, Kᵢ), a pairing equation that uses only public values.
- **t identical statuses**: at most f members are Byzantine and t ≥ f + 1, so t identical answers include an honest member.

## Speaker note

- The invite config also carries each member's private federation URL and identity key, the setup transcript and the payment and checkpoint policies; the wallet does not use the private URLs.
- "Checked on import" holds, with a gap: the CLI import also runs `validate_bft_safety` (t ≥ f + 1, c ≥ n − f), but the library path `FederatedMintConnector::from_invite_code` runs only `FederationConfig::validate`, which does not include that check (crates/cdk/src/wallet/federation.rs, crates/cdk-cli/src/sub_commands/federation.rs).
