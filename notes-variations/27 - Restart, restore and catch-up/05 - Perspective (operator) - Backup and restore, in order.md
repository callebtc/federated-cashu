# 27.05 · Backup and restore, in order

Variation 5 of slide 27 (Restart, restore and catch-up) · lens: Perspective: operator · deck `fcv-e-membership-custody` page 15 · 7 steps · script 137 words, about 60 s

## Script

Backup and restore, as the operator runs them.

**[1]** Stop the mint and take a quiesced SQLite or Postgres snapshot. The mint stays stopped until the manifest exists, so the frontier cannot move.

**[2]** Run cdk-mintd federation backup-manifest with the public and private config. The manifest binds federation ID, config digest, member ID, trusted checkpoint, durable frontier, AlephBFT backup size, schema version and secret generation. It holds no secrets.

**[3]** Keep snapshot, manifest, both configs and the sealed FROST share with its key together as one generation.

**[4]** To restore, put those files back.

**[5]** Set restore_manifest_path. Before DKG reconciliation or any route, startup compares manifest, database and secrets; any mismatch refuses to start.

**[6]** Run audit-checkpoint. Serve only after a matched audit.

**[7]** The member then catches up from the snapshot frontier. The readiness gate opens when its frontiers match a quorum-signed checkpoint.

## Background

- **Quiesced snapshot**: a copy of the database taken while the mint is stopped, so no write is in progress and the recorded frontier matches the data.
- **Backup manifest**: an operator file that binds one database backup to its exact durable frontier, trusted checkpoint, AlephBFT session backup, schema contract, config, member and secret generation. It is not a consensus proof and contains no secret keys or local paths.
- **Secret generation**: a domain-separated commitment to the member's external secret config. It detects a database restored with secrets from a different generation.
- **restore_manifest_path**: a `[federation]` setting in the mintd config. When set, startup validates the manifest against the restored database and secrets before anything else.
- **audit-checkpoint**: an operator command that recomputes the materialized-state digest of the database and compares it with the trusted checkpoint. A mismatch latches the member as halted.
- **Readiness gate**: the member keeps its serving and signing routes closed until it is current and its checkpoint and audit state are valid.

## Speaker note

- Step 7 on the slide says "the readiness gate opens after the digests match". In the code, catch-up promotes a quorum-signed checkpoint when the journal, finalized-item and application frontiers equal it; the materialized-state digest is compared in the step 6 audit (`bls-federation:docs/federated-cashu-checkpoint-architecture.md`, `docs/federated-cashu-backup-recovery.md`). The script uses "frontiers match".
