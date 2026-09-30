# 25 · Restart, restore and catch-up

1.4 Keys and membership · 5 steps · script 125 words, about 55 s

## Script

A member that restarts or restores from backup.

**[1]** It restores a checkpoint: a database snapshot, its manifest, and the member secrets, all from one backup generation.

**[2]** It requests the journal suffix from peers: the operations accepted after the checkpoint.

**[3]** It replays them deterministically. Same operation, same state, same shares.

**[4]** It checks the result against a checkpoint signed by at least c members: its log positions and digests must equal the checkpoint's.

**[5]** Only then does the readiness gate pass, and the member serves and signs again.

History is replicated and verifiable. Key material is not. The identity key, the BLS key shares and the sealed FROST share cannot be recovered from peers. A member that loses them cannot sign, and replacing it requires a new roster.

## Background

- **Checkpoint**: a statement signed by at least c members with their identity keys. It commits to the accepted-operation order, the finalized consensus items, an application digest and a digest of the materialized state, at one point in the log. Catch-up runs in bounded pages toward the next checkpoint; the member promotes it only when its own positions and digests equal it exactly. The full state digest is checked by an explicit operator audit, not on every catch-up.
- **Manifest**: operator metadata that binds a database backup to its exact log position, trusted checkpoint, config, and secret generation.
- **Journal suffix**: the part of the log after the checkpoint.
- **Deterministic replay**: re-executing the same operations in the same order always gives the same result, so a recovering member ends in the same state as its peers.
- **Digest**: a hash summarizing a large state; equal digests mean equal state.
- **Readiness gate**: the member keeps its signing routes closed until its state is proven current.
- **Sealed**: stored encrypted.

## Speaker note

- The slide and script follow the current checkpoint design (`docs/federated-cashu-checkpoint-architecture.md` on `bls-federation`). Older material, including `FEDERATION_NOTES.md` section "Peer catch-up", still describes the superseded range-based catch-up certificates.
