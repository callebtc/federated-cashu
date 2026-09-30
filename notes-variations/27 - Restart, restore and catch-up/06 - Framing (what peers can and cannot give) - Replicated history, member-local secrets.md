# 27.06 · Replicated history, member-local secrets

Variation 6 of slide 27 (Restart, restore and catch-up) · lens: Framing: what peers can and cannot give · deck `fcv-e-membership-custody` page 16 · 4 steps · script 139 words, about 60 s

## Script

A restoring member, m2, gets two kinds of material from two different places.

**[1]** Peers can send history: finalized AlephBFT items and journal pages, retained from genesis, and quorum-signed checkpoints.

**[2]** m2 accepts that history only against a checkpoint signed by at least c members with their identity keys. It replays the pages and promotes the checkpoint when its journal, finalized-item and application frontiers equal it.

**[3]** Secrets come only from m2's own backup: the identity secret key, which authenticates it on the private plane; the BLS key shares for every keyset, including rotated ones; the sealed FROST root share and the key that opens it; and Bark receive secrets if Bark is enabled.

**[4]** If these are lost, the seat cannot sign. The other members keep serving until a new roster runs setup. Copying another member's private config is never an option.

## Background

- **Finalized AlephBFT items**: the ordered output of the consensus protocol. The journal is derived from them deterministically, so peers can supply them and m2 can check them.
- **Quorum-signed checkpoint**: a commitment to the journal order digest, finalized-item digest, application digest and materialized-state digest at one boundary, signed by at least c distinct members with their identity keys. It replaces the earlier range-based catch-up certificates.
- **Identity secret key**: signs m2's messages on the private member-to-member plane. Without it, peers cannot authenticate m2.
- **BLS key shares**: m2's shares of the ecash signing keys, one set per keyset, including keysets that were rotated out.
- **Sealed FROST root share**: m2's share of the treasury key, stored encrypted with AES-256-GCM. The sealing key is needed to open it.
- **Bark receive secrets**: member-local secrets needed to claim incoming Lightning payments when the Bark backend is enabled.
- **Why copying fails**: another member's secrets belong to a different seat; activation and proof-of-possession checks fail.

## Speaker note

- The left box says "Catch-up certificates: range, ordered operation IDs, order digest, state digest, signer", and its "Accepted when" text says "a consensus-threshold quorum of certificates agrees and both digests match after replay". The canvas label reads "certificates, digests ✓". Range-based catch-up certificates were replaced by quorum-signed checkpoints (`bls-federation:docs/federated-cashu-checkpoint-architecture.md`; `docs/federated-cdk-checkpoint-implementation-plan.md`). The script describes checkpoints. If this variation is used, change the slide text. The page's deck note also says "History with certificates".
- "Both digests match after replay": in the code, catch-up promotion checks frontier equality (journal, finalized-item, application); the materialized-state digest is compared by the operator audit (`checkpoint_catch_up.rs`, `checkpoint_manager.rs`).
- Bark receive secrets as member-local backup material: from `bls-federation:docs/FEDERATION_NOTES.md`.
