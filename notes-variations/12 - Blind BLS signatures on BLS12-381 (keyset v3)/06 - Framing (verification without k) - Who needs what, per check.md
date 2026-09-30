# 12.06 · Who needs what, per check

Variation 6 of slide 12 (Blind BLS signatures on BLS12-381 (keyset v3)) · lens: Framing: verification without k · deck `fcv-a-bls` page 24 · 5 steps · script 138 words, about 60 s

## Script

Five checks, secp256k1 keysets against v3.

**[1]** A wallet checking C′ after issuance: on secp, an optional DLEQ proof from the mint; on v3, e(C′, G₂) = e(B′, K).

**[2]** A mint verifying an input: on secp, k·Y = C, which needs k; on v3, e(C, G₂) = e(Y, K).

**[3]** A receiver verifying offline: on secp, the DLEQ proof plus the sender's r; on v3, the same pairing with public data only.

**[4]** A federation member verifying an input: on secp, t members would compute k·Y together; on v3, the same pairing with the aggregate K, locally. The secp cells here and below are hypothetical: CDK federates only v3 keysets.

**[5]** A wallet checking member i's share: on secp, one DLEQ per share; on v3, e(C′ᵢ, G₂) = e(B′, Kᵢ). Members verify inputs in verify_proofs, as a batch from eight proofs up.

## Background

- **DLEQ proof (NUT-12)**: proves that the same k was used for K and C′ without revealing k. Needed on secp keysets for any check by a party without k.
- **Pairing check**: compares e(signature, G₂) with e(message, key). Only public values are used.
- **Aggregate key K**: the federation's public key for one amount; all members hold it in the public config.
- **Public share Kᵢ**: member i's public key share, used to check that member's signature share before interpolation.
- **`verify_proofs`**: `crates/cdk/src/mint/federation/configuration_and_admission.rs`. Below `FEDERATION_BLS_PROOF_BATCH_MIN` = 8 proofs it checks one by one; from 8 it runs one batch pairing check. Proofs from a non-v3 keyset are rejected with `InvalidFederatedKeysetVersion`.
