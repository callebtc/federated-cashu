# 21.05 · A lagging member during and after a swap

Variation 5 of slide 21 (Federated swap) · lens: Perspective: lagging member · deck `fcv-c-ordering` page 31 · 5 steps · script 135 words, about 60 s

## Script

m3 over time. Its sync status is healthy, awaiting quorum, lagging, catching up or halted. Only healthy is ready to serve value requests.

**[1]** m3 goes offline. The others finalize swap 41, P1 and P2 to A and B, without it.

**[2]** After restart, its operation count is below a peer's, so it is lagging. Swap, mint and melt fail closed: no shares.

**[3]** It catches up. It verifies a checkpoint signed by c members, fetches the missing entries from peers in bounded pages, and replays entry 41 deterministically: P1 and P2 spent, its own shares stored.

**[4]** When its state matches the checkpoint, the readiness gate passes and it is healthy again.

**[5]** It can now serve its stored shares for a retry of swap 41. A new swap of P1 and P2 to other outputs fails with TokenAlreadySpent.

## Background

- **Sync status**: `healthy`, `awaiting_quorum`, `lagging`, `catching_up`, `halted`. Only `healthy` passes the readiness check.
- **Lagging**: the member's local operation count is below a peer's reported count.
- **Quorum-signed checkpoint**: a statement signed by c members committing to the accepted-operation order and the resulting state. It lets a member verify the history it downloads.
- **Bounded pages**: catch-up fetches the missing entries in size-limited pages, verifying each one before applying it.
- **Deterministic replay**: the same entries in the same order give the same state and the same shares as at the peers.
- **Readiness gate**: signing and value routes stay closed until the member's journal, finalized-item and application frontiers equal the checkpoint.
- **Value requests**: swap, mint and melt; the requests that produce shares.

## Speaker note

- The slide's catch-up card says "journal entries from peers with a certificate quorum of c" and step 3 says "certificate quorum". Catch-up certificates were replaced by quorum-signed checkpoints (`bls-federation:docs/federated-cashu-checkpoint-architecture.md`); the checkpoint quorum is c signatures. The script uses the checkpoint term.
