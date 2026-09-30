# 22.04 · The same ceremony in Rust

Variation 4 of slide 22 (Distributed key generation) · lens: Explained via code · deck `fcv-d-flows-dkg` page 22 · 5 steps · script 122 words, about 50 s

## Script

The ceremony as condensed Rust from dkg.rs, with the function and error names from the source.

**[1]** generate_by_construction samples t coefficients per amount with BlsSecretKey::generate and commits to each with public_key_g2: the scalar times the G₂ generator.

**[2]** For every receiver in the roster, itself included, evaluate_secret_key_coefficients computes the value at the receiver's signer ID.

**[3]** derive_member_keyset_share loops over the participants. For each, it evaluates the sender's commitments at its own ID and compares the result with the received value times G₂. A difference is DkgCommitmentMismatch.

**[4]** aggregate_secret_key_shares sums the contributions into kᵢ. If kᵢ·G₂ differs from the public share, the error is PrivateShareMismatch.

**[5]** derive_federated_keyset sums the commitments coefficient by coefficient. Coefficient 0 is K. Evaluating the summed commitments at i gives each public share Kᵢ.

## Background

- **BlsSecretKey::generate**: draws a random nonzero scalar modulo the BLS12-381 group order.
- **public_key_g2**: multiplies the scalar by the generator of G₂, giving a 96-byte compressed point.
- **Signer ID**: the member ID used as the x coordinate of the sharing. Member IDs are non-zero, because f(0) is the secret.
- **evaluate_public_key_commitments**: computes Σₗ iˡ·Aⱼ,ₗ from the commitments using Horner's rule. It equals fⱼ(i)·G₂ when the sender is honest.
- **aggregate_public_key_commitments**: adds points. Summing each coefficient's commitments over all members gives the commitments to the summed polynomial f.
- **Public share Kᵢ**: kᵢ·G₂, derived by every member from public data alone, so all members agree on it.

## Speaker note

- The listing is condensed, not verbatim. `generate_by_construction` is `pub(super)`; the public entry point `generate` calls it and then validates the state.
