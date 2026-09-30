# 27.03 · Restore along the journal index

Variation 3 of slide 27 (Restart, restore and catch-up) · lens: Graphical · deck `fcv-e-membership-custody` page 13 · 5 steps · script 130 words, about 55 s

## Script

The axis is m2's journal index: zero, the trusted checkpoint, m2's frontier, and the federation's tip.

**[1]** m2 restores one backup generation: the database snapshot, its identity key, its BLS shares and its FROST share. The snapshot covers the journal from zero to its durable frontier.

**[2]** The trusted checkpoint is a quorum-signed commitment inside that range. Startup verifies the local entries between the checkpoint and the frontier against it.

**[3]** The entries from the frontier to the tip come from peers, here m1 and m3, in bounded pages.

**[4]** m2 replays them deterministically. When its frontiers equal a quorum-signed checkpoint, that checkpoint is promoted. The slide marks this as the digest check.

**[5]** Then the readiness gate opens, and m2 serves and signs. The keys came only from the backup. Peers never send them.

## Background

- **Journal index**: the position of an entry in the ordered journal, starting at 0.
- **Backup generation**: one set of files that belong together: database snapshot, manifest, public and private config, and the sealed FROST share with its sealing key.
- **Durable frontier**: the last journal, finalized-item and application positions written to the database, with their digests.
- **Trusted checkpoint**: the latest quorum-signed checkpoint the member has promoted. At startup the member verifies only the retained entries after it, with the same suffix verifier used for peer catch-up.
- **Bounded pages**: catch-up downloads a limited number of entries per request, so no response grows with the federation's total history.
- **Readiness gate**: the member keeps mint, swap, melt, FROST, observation and broadcast routes closed until it is not lagging, not catching up, not halted, and its checkpoint and audit state are valid.

## Speaker note

- The "digests ✓" mark corresponds in the code to exact frontier equality with a quorum-signed checkpoint (journal, finalized-item and application digests). The materialized-state digest is compared by the explicit operator audit and recomputed by each member when it signs a new checkpoint, not during catch-up (`bls-federation:docs/federated-cashu-checkpoint-architecture.md`: "Normal startup performs no full materialized-state scan").
