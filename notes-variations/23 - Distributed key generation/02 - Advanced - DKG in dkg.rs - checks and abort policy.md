# 23.02 · DKG in dkg.rs: checks and abort policy

Variation 2 of slide 23 (Distributed key generation) · lens: Advanced · deck `fcv-d-flows-dkg` page 20 · 4 steps · script 138 words, about 60 s

## Script

What dkg.rs checks, and the failure policy.

**[1]** Per amount, each member samples t random scalars. The commitments are aⱼ,ₗ·G₂ with no blinding term: Feldman-style, although the code names the method PedersenDkg. It evaluates at every member's ID, its own included, and rejects a zero value. Then the coefficients are zeroized; the reveal and the evaluations are kept.

**[2]** The reveal must hash to the earlier commitment. Federation, setup authorization and ceremony ID must match, the sender must be in the roster, and every amount needs exactly t commitments.

**[3]** Each value is checked against the sender's commitments; a mismatch names the sender. The sum kᵢ must satisfy kᵢ·G₂ = Kᵢ.

**[4]** Every member is needed throughout. A timeout stops the driver and names the missing members. Recovery is a new setup with a new ceremony ID. Limits: 64 members, 64 amounts.

## Background

- **Feldman vs Pedersen commitments**: a Feldman commitment is a·G₂; a Pedersen commitment adds a blinding term, a·G + b·H. "Pedersen DKG" names the protocol in which every member deals its own polynomial and the shares are summed. The code uses Feldman-style commitments inside that protocol.
- **Commitment hash**: SHA-256 over a versioned domain string and the canonical JSON of the reveal, each length-prefixed.
- **Zero evaluation**: a share of zero is rejected, because a zero scalar is not a valid key.
- **Horner's rule**: evaluates a₀ + a₁x + a₂x² as a₀ + x(a₁ + x·a₂). The code uses it for the commitment check, one group multiplication fewer.
- **DkgCommitmentMismatch / PrivateShareMismatch**: the first names the sender whose value failed; the second means the member's summed share does not match its public share.
- **Duplicates**: an identical resend of a commitment or reveal is ignored; a different second one from the same member is an error.
- **Ceremony ID**: a hash of a domain string, the setup ID and the setup proposal hash, so a new ceremony needs a new setup.

## Speaker note

- "a timeout aborts": the driver in crates/cdk-axum/src/federation/dkg_driver.rs stops after max_ticks (default 64) or ceremony_timeout (default 600 s) and returns an error whose text says "aborted … still waiting on member(s)". The durable ceremony record stays active.
- "Retry uses a new ceremony ID; the old one is recorded as aborted" is not what the code does. `FederationDkgCeremonyRecord::aborted_by` (crates/cdk-common/src/federation/dkg.rs) is called only in tests. mintd refuses a different ceremony ID while a record exists and asks for a new setup ID and independent state.
- The kept evaluations fⱼ(1) … fⱼ(n) determine fⱼ whenever n ≥ t, so zeroizing the coefficients does not remove the polynomial from the participant state. That state is persisted as JSON in the mint database; I did not check whether it is deleted after completion.
