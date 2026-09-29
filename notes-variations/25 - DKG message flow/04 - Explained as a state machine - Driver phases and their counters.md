# 25.04 · Driver phases and their counters

Variation 4 of slide 25 (DKG message flow) · lens: Explained as a state machine · deck `fcv-d-flows-dkg` page 30 · 7 steps · script 133 words, about 55 s

## Script

Each member runs this machine on its own records, n = 3. The counters come from FederationDkgDriverProgress.

**[1]** Commitment: advances when every member's hash is stored, 3 of 3.

**[2]** Reveal: sent once all hashes exist; each reveal must match its hash.

**[3]** Secret shares: sent once all reveals exist; each incoming contribution is checked.

**[4]** Local share: the member checks kᵢ·G₂ = Kᵢ, then persists its share.

**[5]** Signature: n signatures over one transcript hash.

**[6]** Activation: every member confirms the final config. In the code, three FROST phases follow before complete.

**[7]** Complete: the keyset may sign, and the ceremony record goes from active to complete. A timeout does not change the record; it stops the driver and names the members it waited for. The aborted state is defined for a ceremony replaced by a new ceremony ID.

## Background

- **FederationDkgDriverProgress**: member_count, commitment_count, reveal_count, secret_share_contribution_count, local_keyset_share_ready (a yes/no flag), transcript_signature_count and activation_count.
- **Own records**: each member computes its phase from its own database; there is no shared view of the ceremony.
- **Ceremony record**: states active, complete and aborted. Complete is set after all activations are in, the FROST key generation is complete and every member has confirmed it.
- **Timeout defaults**: the driver stops after 64 ticks with a 1 s retry delay, or after 600 s.

## Speaker note

- The slide shows seven phases. `FederationDkgDriverPhase` (crates/cdk-common/src/federation/dkg_driver.rs) has ten: FrostRound1, FrostRound2 and FrostConfirmation sit between Activation and Complete.
- The arrow active → aborted is defined (`FederationDkgCeremonyRecord::aborted_by`, dkg.rs) but only tests call it; no production path marks a record aborted. mintd refuses a different ceremony ID while a record exists and asks for a new setup ID and independent state.
- The timeout text on the slide matches the code; pages 20, 28 and 31 say "aborts", which is true of the driver run only.
