# 15.02 · Shamir shares in the implementation

Variation 2 of slide 15 (Shamir secret sharing, t = 2) · lens: Advanced · deck `fcv-b-threshold` page 12 · 5 steps · script 139 words, about 60 s

## Script

The implementation, in nut01/bls.rs and federation/config.rs.

**[1]** One polynomial per amount, degree t − 1, over 𝔽ᵣ, the BLS12-381 scalar field. Member i holds kᵢ = f(i); Kᵢ = kᵢ·G₂ is public, and K = f(0)·G₂. Any t − 1 shares are independent of k.

**[2]** Signer IDs are non-zero u16, big-endian; zero would be f(0) = k. Duplicate IDs and identity public keys are rejected.

**[3]** ThresholdParams requires 0 < t ≤ n, t ≤ c ≤ n, n ≥ 2. The production profile, validate_bft_safety, adds t > ⌊(n − 1)/3⌋ and c ≥ n − ⌊(n − 1)/3⌋.

**[4]** trusted_dealer_keygen, for tests, takes coefficients[0] as k and their count as t. Dealer-free DKG ends in shares of the same form.

**[5]** Encodings: version byte 01, signer ID, then the scalar or point. Secret share 35 bytes, public share 99, signature share 51.

## Background

- **𝔽ᵣ**: the integers modulo r, the prime order of the BLS12-381 groups G₁ and G₂. Keys, shares and coefficients are 32-byte elements of it.
- **Polynomial**: f(x) = k + a₁x + … + aₜ₋₁xᵗ⁻¹. t coefficients, so t shares determine it.
- **kᵢ, Kᵢ, K**: kᵢ is member i's secret scalar; Kᵢ = kᵢ·G₂ its public share, a 96-byte G₂ point; K = f(0)·G₂ the aggregate key published in the v3 keyset.
- **Uniform coefficients**: if a₁ … aₜ₋₁ are uniformly random, any t − 1 shares are uniformly distributed whatever k is, so they carry no information about k.
- **BlsSignerId**: the type for signer IDs; `BlsSignerId::new(0)` returns InvalidThresholdSignerId. In the wallet the ID is the member ID.
- **Identity point**: the neutral element of the group. Parsing a G₁ or G₂ point rejects it, and DKG share aggregation rejects a zero secret share (`reject_zero_secret_key`).
- **n, t, c**: members, signing threshold, consensus threshold. ⌊(n − 1)/3⌋ is the number of Byzantine members consensus tolerates. Example n = 5: that number is 1, so the production profile needs t ≥ 2 and c ≥ 4. t above it means the tolerated faulty members cannot reach the signing threshold by themselves.
- **trusted_dealer_keygen**: one process samples the coefficients and evaluates f at each ID. The config generator that uses it is compiled only under `cfg(any(test, feature = "test"))`.
- **Encodings**: secret share = 01 ∥ ID (2 bytes, big-endian) ∥ 32-byte scalar = 35 bytes; public share = 01 ∥ ID ∥ 96-byte compressed G₂ point = 99 bytes; blind signature share = 01 ∥ ID ∥ 48-byte compressed G₁ point = 51 bytes. Secret share bytes are written only to private member configuration or secret storage.

## Speaker note

- "Dealer-free DKG ends in the same shares" on the slide means shares of the same form (kᵢ = f(i) of a joint polynomial, K = f(0)·G₂), not the same values a dealer would produce.
