# 26.04 · What a member can lose

Variation 4 of slide 26 (Restart, restore and catch-up) · lens: Explained via table · deck `fcv-e-membership-custody` page 14 · 3 steps · script 139 words, about 60 s

## Script

Rows run from the smallest loss to the largest.

**[1]** History is recoverable. A crash with an intact database is an ordinary restart. A lost in-memory AlephBFT suffix is replayed from the trusted checkpoint and session backup. A lost database is restored from a good snapshot with manifest and secrets, then the tail is caught up. With only the secrets left, the member replays pages from genesis. A lagging member catches up and stays closed meanwhile.

**[2]** A pending proposal is retried only with the exact same operation ID. Mid-round FROST nonces are burned; a new attempt uses fresh ones.

**[3]** Secrets are not recoverable. Losing the identity key or BLS shares needs a new roster. Losing the sealed FROST share ends this seat's treasury signing. Another member's secrets are never usable. A checkpoint commits to state; it is not a snapshot.

## Background

- **AlephBFT suffix**: the consensus state after the trusted checkpoint that a running member holds in memory. The retained journal and finalized items in the database let it be rebuilt.
- **AlephBFT session backup**: an opaque backup of the current consensus session that lets the consensus engine resume. It cannot advance journal or checkpoint trust by itself.
- **Genesis replay**: starting from an empty database and applying the journal from entry 0. Version 1 retains all journal and finalized-item bodies from genesis, so this is always possible, but slow.
- **Exact operation ID retry**: resubmitting the identical envelope joins the pending or accepted operation. A changed envelope has a different operation ID and is a different operation.
- **Nonce burn**: a FROST nonce whose use is uncertain is marked unusable. Reusing a nonce with two different challenges would reveal the signing share.
- **Seat**: one member position in the roster. Its secrets are the identity key, the BLS key shares and the sealed FROST share.
- **Proof of possession**: a check that a member holds the private key for its public key or share. Another member's secrets fail it, and activation fails.
- **Checkpoint vs. snapshot**: a checkpoint contains digests and positions, not database rows. An empty database cannot start from a checkpoint ID alone; it needs the journal bodies or a real backup.
