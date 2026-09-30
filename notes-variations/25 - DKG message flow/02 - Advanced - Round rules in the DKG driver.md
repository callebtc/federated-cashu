# 25.02 · Round rules in the DKG driver

Variation 2 of slide 25 (DKG message flow) · lens: Advanced · deck `fcv-d-flows-dkg` page 28 · 6 steps · script 134 words, about 55 s

## Script

The driver's rules per phase.

**[1]** Readiness: every member confirms the same ceremony ID and keyset policy.

**[2]** Commitment: advances once all n hashes are stored. A second, different commitment from one member, or another ceremony ID, is rejected.

**[3]** Reveals go out only after all n commitments. Each must match its hash and the keyset spec, with t commitments per amount.

**[4]** Secret shares go out only after all n reveals: one contribution from every member to every member, itself included. A value that fails the commitment check is rejected.

**[5]** Each member checks kᵢ·G₂ = Kᵢ and persists its share; then n Schnorr signatures over one transcript hash.

**[6]** Activation needs every member's confirmation of the final config digest. A timeout stops the run and names the absent members. Every message is signed; later phases resend earlier artifacts.

## Background

- **Readiness barrier**: runs before the driver starts, only when no participant state for this ceremony exists yet. Every member must acknowledge within the allowed attempts.
- **Keyset policy**: the amounts, unit and other keyset parameters the ceremony generates keys for. All members must use the same one.
- **Signer ID check**: a contribution must be addressed to the receiver's own signer ID; otherwise it is rejected.
- **Transport policy**: DKG messages go only over HTTPS or iroh; plain HTTP is allowed only to loopback addresses in an explicit development policy.
- **Resending**: each phase's outbound set includes the earlier artifacts. Within one run an in-memory tracker resends to members that have not acknowledged, so a lagging peer catches up without a durable acknowledgement journal.
- **Durable replay state**: sequence numbers of effectful DKG messages are stored with the DKG records, so a replay after a restart is still rejected.

## Speaker note

- Readiness is a barrier before the driver runs, not a value of `FederationDkgDriverPhase` (crates/cdk-common/src/federation/dkg_driver.rs). Between Activation and Complete that enum has three FROST phases: FrostRound1, FrostRound2, FrostConfirmation.
- "The ceremony timeout aborts the run" is accurate for the driver run only: it stops and returns an error naming the missing members; the durable ceremony record stays active.
- The plain-HTTP check is done by the sending driver for every member URL and blocks all DKG messages, not only secret shares.
