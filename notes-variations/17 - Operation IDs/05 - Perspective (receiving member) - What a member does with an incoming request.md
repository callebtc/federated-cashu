# 17.05 · What a member does with an incoming request

Variation 5 of slide 17 (Operation IDs) · lens: Perspective: receiving member · deck `fcv-c-ordering` page 15 · 4 steps · script 136 words, about 60 s

## Script

The path of one incoming request at one member, here a swap.

**[1]** The same body arrives at every member. Admission runs first: outputs on a v3 keyset, unique inputs, valid proofs and spending conditions, content bounds. A failure is rejected before consensus.

**[2]** The member builds the envelope, federation ID, version 6 and operation, and computes the operation ID itself. If its sync status is not healthy, it fails closed with no shares: lagging, catching up or halted.

**[3]** A known operation ID, pending or finalized, is joined, not queued again. An operation whose conflict key is held by another pending operation is refused with ConflictingOperation. A swap has no conflict key, so for a swap this check never refuses.

**[4]** Only a new, non-conflicting envelope is queued for AlephBFT. After apply, the member answers from its stored shares.

## Background

- **Admission**: cheap checks that reject malformed requests before they use consensus capacity. For a swap: v3 outputs, unique inputs and outputs, proof content bounds, proof signatures and spending conditions. The balance check is not here; it runs at apply.
- **Sync status**: healthy, awaiting quorum, lagging, catching up or halted. Only healthy is ready. The errors are `NodeLagging`, `NodeCatchingUp`, `NodeHalted` (and `NodeAwaitingQuorum`).
- **Fail closed**: when a member cannot prove its state is current, it refuses instead of answering.
- **`DuplicateOperation`**: the operation ID is already pending; the request waits for that operation's result.
- **`ConflictingOperation`**: another pending operation holds the same conflict key. On the private federation routes this maps to HTTP 409.
- **Stored shares**: after apply, the member returns the share rows written for this operation ID; the route never signs.

## Speaker note

- The flowchart starts with `POST /v1/swap` but shows a `ConflictingOperation` exit. For swaps `conflict_keys()` returns an empty list (`crates/cdk-common/src/federation/operation.rs`), so a swap never takes that exit; a competing swap is ordered and fails at apply with `TokenAlreadySpent`. The script says so.
- Not shown: for Swap, Mint and Melt, members use a deterministic publisher order derived from the operation ID; a lower-ranked member waits for the prior publisher's result before queueing itself (`crates/cdk-axum/src/federation/wallet_operation_publisher.rs`).
