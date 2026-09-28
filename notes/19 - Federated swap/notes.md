# 19 · Federated swap

1.3 Ordering · 5 steps · script 135 words, about 60 s

## Script

A federated swap, end to end.

**[1]** The wallet sends POST /v1/swap with an identical body to every member's public URL.

**[2]** Each member runs admission checks before consensus: unique inputs, unique v3 outputs, content within bounds, and the proofs and their spending conditions verify.

**[3]** The envelope gets its operation ID and goes through consensus. The first swap that spends the inputs wins.

**[4]** At apply, each member checks the balance including fees, marks the inputs spent, and signs the outputs with its share.

**[5]** The wallet collects t shares per output, interpolates, unblinds, and verifies against K.

Failure cases: a member behind the consensus log returns no shares. An offline member catches up from the journal, then serves the accepted shares. Restore returns stored shares, never new ones. A second swap of the same inputs fails with TokenAlreadySpent.

## Background

- **Swap (NUT-03)**: exchange existing proofs for new ones of the same total value minus fees. Used to split, merge, or take ownership of received tokens.
- **Admission**: cheap validity checks that reject malformed requests before they use consensus capacity.
- **Who submits to consensus**: every member receives the same request, but for swaps, mints and melts the members compute a publisher order from the operation ID. The first-ranked member submits the envelope; the others wait 3 s per rank and submit only if it has not appeared (`cdk-axum/src/federation/wallet_operation_publisher.rs`).
- **Journal**: the member's persistent log of accepted operations.
- **Fail closed**: when in doubt, refuse rather than act.
- **Restore (NUT-09)**: a wallet re-requests signatures for outputs it has already submitted, for example after losing local state.
