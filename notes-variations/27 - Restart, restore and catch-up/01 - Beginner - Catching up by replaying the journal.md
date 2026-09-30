# 27.01 · Catching up by replaying the journal

Variation 1 of slide 27 (Restart, restore and catch-up) · lens: Beginner · deck `fcv-e-membership-custody` page 11 · 5 steps · script 133 words, about 55 s

## Script

A member's journal is the list of operations the federation accepted, in consensus order.

**[1]** m1 and m3 hold all six entries, from number 0, a MintQuote, to number 5, a Melt. Below each journal is its digest d₆, a hash over the first six entries.

**[2]** m2 restarts from a backup that ends after entry 2. Its digest is d₃, so it is behind.

**[3]** Peers send the missing entries 3 to 5.

**[4]** m2 applies them in the same order. The same operations in the same order produce the same state, so m2's digest becomes d₆. Equal digests mean equal histories. In the implementation m2 checks this against a checkpoint signed by a quorum of members, not against one peer.

**[5]** Only then does m2 serve wallets and sign again. The operation sequence here is illustrative.

## Background

- **Journal**: the ordered list of operations the federation accepted. Every member applies the same list in the same order.
- **Consensus order**: the single order fixed by the consensus protocol (AlephBFT). Members do not reorder entries locally.
- **Digest dₙ**: a hash chain over the first n entries. Each step hashes the previous digest, the entry's index and its operation ID, so a changed, missing or reordered entry changes every later digest.
- **Deterministic replay**: applying the same operations in the same order always gives the same state, so a restored member ends in the same state as its peers.
- **Quorum-signed checkpoint**: a statement of the journal position and its digests, signed with the identity keys of at least c members. A restoring member accepts history only up to such a checkpoint.
- **Serving and signing**: answering wallet requests and producing signature shares. Both stay closed until the member is current.

## Speaker note

- The slide says m2's digest "now equals the peers'". In the code a restoring member does not rely on one peer's digest: catch-up pages are bounded by a quorum-signed checkpoint (at least c identity-key signatures), and the checkpoint is promoted only when the local journal, finalized-item and application frontiers equal it (`bls-federation:docs/federated-cashu-checkpoint-architecture.md`). The script says this in one sentence.
