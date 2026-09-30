# 25.07 · Order digest and state digest

Variation 7 of slide 25 (Restart, restore and catch-up) · lens: Focus: the two digests · deck `fcv-e-membership-custody` page 17 · 4 steps · script 139 words, about 60 s

## Script

Two digests describe a member's state.

**[1]** The order digest starts at d₀, 98719e56, for an empty journal. Appending entry 0, with operation ID d7c9e7c0, gives d₁, 022d8081. Each later entry extends the chain.

**[2]** d₀ is SHA-256 of the label cdk-federation-journal-genesis-v1. Each step hashes a length-prefixed entry label, the previous digest, the index as an 8-byte integer and the operation ID. These values are the golden vectors in journal.rs.

**[3]** The state digest covers the materialized database rows, here one issued mint quote and one spent proof: 05bb07bd. The empty state is 3bdc17a9. Row insertion order does not matter; any field change or duplicate row does.

**[4]** A quorum-signed checkpoint commits to both. Catch-up checks the order digest; the operator audit checks the state digest. A member with the same journal but a different database projection fails the audit and stays halted.

## Background

- **Order digest**: a hash chain over the journal. dᵢ₊₁ = SHA-256(lp("cdk-federation-journal-entry-v1") ‖ lp(dᵢ) ‖ i as u64 BE ‖ lp(operation_id)), where lp is a 4-byte big-endian length prefix. Any change, omission or reordering changes every later digest.
- **Golden vector**: a fixed input with its expected output, checked by a test so that the encoding cannot change silently. These values come from `order_and_materialized_state_digest_golden_vectors` in `crates/cdk-common/src/federation/journal.rs`.
- **Materialized state**: the database rows that result from applying the journal: mint quotes, melt quotes, proof states, blind signatures, and on-chain intents, transactions and reservations. Each row is a table name, a key and string fields.
- **State digest**: a hash chain over the sorted rows, starting from a genesis label. Sorting makes it independent of insertion order; hashing every row makes it sensitive to any field and to duplicates.
- **Database projection**: the rows a member's database holds for a given journal. Two members with the same journal must hold the same projection.
- **Quorum-signed checkpoint**: a payload with both digests (plus finalized-item and application digests) at one boundary, signed by at least c members with their identity keys.

## Speaker note

- The last line of the slide says "Checkpoints and catch-up certificates bind both." Catch-up certificates were replaced by quorum-signed checkpoints (`bls-federation:docs/federated-cashu-checkpoint-architecture.md`, `docs/federated-cdk-checkpoint-implementation-plan.md`). The checkpoint payload contains both `journal_order_digest` and `materialized_state_digest` (`crates/cdk-common/src/federation/checkpoint.rs`). Catch-up promotion checks frontier equality; the state digest is compared by `audit-checkpoint`, and a mismatch latches the member as halted. The script says this. If this variation is used, change the slide text.
- All five hex values on the slide match the golden-vector test in `journal.rs` (verified).
