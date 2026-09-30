# 26 · Restart, restore and catch-up

Original slide, deck `fcv-e-membership-custody` page 10 (main deck slide 26). Same text as `notes/26 - Restart, restore and catch-up/notes.md`.

1.4 Keys and membership · 5 steps · script 125 words, about 55 s

## Script

**[1]** Three members, each with the same log of operations. They move in lockstep: every operation is ordered by consensus and applied by everyone.

**[2]** One member fails. The other two keep going: they are still enough to order new operations, so the mint stays online.

**[3]** The failed member restarts from its last checkpoint: a backup of its database at a known point in the log.

**[4]** It asks its peers for everything it missed since then, and replays those operations in order. Replaying is deterministic, so it ends up in exactly the same state.

**[5]** Once its log matches a checkpoint signed by a quorum of members, it opens again for serving and signing, back in sync. Only history comes from peers; each member's own keys never do.

## Background

- **Log / journal**: the ordered list of operations a member has applied.
- **Checkpoint**: a statement signed by at least c members that commits to the operation order and state up to a point in the log. Catch-up runs in bounded pages toward the next checkpoint.
- **Deterministic replay**: applying the same operations in the same order always gives the same result.
- **Readiness gate**: a restarting member keeps its signing routes closed until its state is proven current.
- **Not recoverable from peers**: the identity key, BLS key shares and the sealed FROST share; a member that loses them needs a new roster.
