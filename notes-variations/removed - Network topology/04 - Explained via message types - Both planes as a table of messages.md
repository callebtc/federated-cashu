# removed.04 · Both planes as a table of messages

Variation 4 of slide removed (Network topology) · lens: Explained via message types · deck `fcv-d-flows-dkg` page 14 · 3 steps · script 132 words, about 55 s

## Script

Every message on both planes, with its route and direction.

**[1]** Public rows are ordinary Cashu routes. Mint, swap, melt and restore go from the wallet to all n members. Quote creation goes to one member at a time. Quote status goes to all n.

**[2]** Private rows start with consensus. A member sends an operation envelope to its peers on /federation/v1/operations. AlephBFT units travel member to member on the aleph-bft routes. Catch-up and checkpoints use the journal and checkpoints routes.

**[3]** Key generation, both BLS and FROST, goes from each member to every member under dkg. FROST signing goes from a coordinator to the selected signers. Wallet fan-out, key generation, FROST rounds, status and catch-up are not consensus items. Consensus orders the facts they depend on, such as the operations a wallet request triggers.

## Background

- **Operation envelope**: the canonical encoding of one request, identified by its SHA-256 hash, the operation ID. Operations are the consensus items that mint, melt, swap and quote changes go through.
- **AlephBFT units**: the protocol messages AlephBFT exchanges to agree on one order of items.
- **Catch-up and checkpoints**: a lagging member verifies a quorum-signed checkpoint and fetches the missing journal suffix from peers.
- **FROST**: a threshold Schnorr signature scheme; here it controls the federation's on-chain treasury key. A coordinator runs the signing rounds with a fixed set of selected signers.
- **What consensus orders instead**: FROST rounds are not items, but their input and output are ordered as TransactionProposal and TransactionSigned; key generation is not an item, but adopting a new keyset is ordered as KeysetRotation.

## Speaker note

- The table leaves out the config, status and local-status routes of the private plane. The note is accurate: the operation kinds contain no item for fan-out, key generation, FROST rounds, status or catch-up (crates/cdk-common/src/federation/operation.rs).
