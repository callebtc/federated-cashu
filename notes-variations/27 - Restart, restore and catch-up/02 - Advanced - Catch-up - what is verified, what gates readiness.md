# 27.02 · Catch-up: what is verified, what gates readiness

Variation 2 of slide 27 (Restart, restore and catch-up) · lens: Advanced · deck `fcv-e-membership-custody` page 12 · 4 steps · script 140 words, about 60 s

## Script

Catch-up runs over the private REST plane.

**[1]** The request names the first missing index, a target checkpoint bounding the page, a limit, the known order digest and the next AlephBFT item index. Each entry returns its index, operation ID, order digest before and after, and application state. The order digest chains from a genesis hash.

**[2]** A page is accepted only against a quorum-signed checkpoint: a commitment to the order digest, finalized items, application and materialized state, signed by at least c members. Each entry must match the entry rebuilt from finalized AlephBFT items, or catch-up fails with an index, operation-ID or digest mismatch.

**[3]** Catch-up and live finality share one lock. The checkpoint is promoted only when the local frontiers equal it.

**[4]** Until the member is ready, mint, swap, melt, FROST, observations and broadcast stay closed. An audit mismatch latches permanently.

## Background

- **Private REST plane**: the member-to-member HTTP API under `/federation/v1`, authenticated with the members' identity keys. Wallets do not use it.
- **Order digest chain**: d₀ = SHA-256("cdk-federation-journal-genesis-v1"); dᵢ₊₁ = SHA-256(lp(entry label) ‖ lp(dᵢ) ‖ i as 8-byte big-endian ‖ lp(operation_id)), where lp is a 4-byte length prefix. Changing, dropping or reordering any entry changes every later digest.
- **AlephBFT finalized items**: the ordered output of the AlephBFT consensus protocol. Journal entries are derived from them deterministically, so a peer cannot claim an entry that the finalized items do not produce.
- **Quorum-signed checkpoint**: a payload that commits to one complete boundary: journal index and order digest, finalized-item index and digest, terminal-application digest, AlephBFT session cursors and the materialized-state digest, bound to federation ID and config digest. It is trusted only with Schnorr signatures from at least c distinct configured members, made with their identity keys.
- **Frontier**: the position a member has durably reached in each stream (journal, finalized items, application), with the digest at that position.
- **Promotion**: making a verified checkpoint the member's trusted recovery base, in one database transaction, only when the frontiers match it exactly.
- **Serialized with live finality**: catch-up and normal consensus application take the same application lock, so a catch-up page and a live unit are never applied at the same time.
- **Audit latch**: when the operator audit finds that the database's materialized-state digest differs from the trusted checkpoint, a durable flag halts the member. No restart, peer response or command clears it; recovery restores a known-good backup or replays from genesis with the same secrets.

## Speaker note

- Slide box "Accepting a page" says: "A consensus-threshold quorum of catch-up certificates: range, ordered operation IDs, order digest, state digest, signer." Range-based catch-up certificates were replaced by quorum-signed checkpoints (`bls-federation:docs/federated-cashu-checkpoint-architecture.md`; `docs/federated-cdk-checkpoint-implementation-plan.md`: "cut-through replacement of catch-up certificates"). The script describes the checkpoint. If this variation is used, change the slide text. The page's deck note also says "the certificate quorum".
- Slide box "Applying" says: "After replay, order digest and materialized-state digest must both match." In the current code, catch-up promotion requires the journal, finalized-item and application frontiers to equal the checkpoint (`crates/cdk-axum/src/federation/checkpoint_catch_up.rs`). The materialized-state digest in the checkpoint is compared by the explicit operator audit (`cdk-mintd federation audit-checkpoint`, `checkpoint_manager.rs`) and recomputed by each member when it signs a new checkpoint. The script says "frontiers equal it".
