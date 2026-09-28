# 25.04 · What each hash covers

Variation 4 of slide 25 (Federation ID) · lens: Graphical · deck `fcv-e-membership-custody` page 6 · 4 steps · script 134 words, about 55 s

## Script

The public federation config drawn as one document with eleven rows.

**[1]** The five upper rows feed one SHA-256: the setup authorization, n, t and c, and the three member entries with their URLs and keys. The result is the federation ID, A.

**[2]** All eleven rows feed a second SHA-256, including the wallet protocol version, the observation and checkpoint policies, the FROST wallet config, the BLS keysets and the setup transcript. The result is the config digest, D.

**[3]** A keyset rotation changes the BLS keysets row. The digest becomes D′. The federation ID stays A, because keysets are not part of the roster.

**[4]** Changing m2's URL changes a roster row. Both hashes change: the ID becomes A′ and the digest D″. A roster change therefore creates a new federation, while a keyset rotation does not.

## Background

- **FederationConfig**: the public configuration every member and wallet holds: roster, thresholds, wallet protocol version, keysets, payment observation policy, checkpoint policy, optional FROST wallet config and optional setup transcript.
- **Setup transcript**: the signed public record of the setup ceremony, kept for audit and for checking later DKG compatibility.
- **Observation policy**: how many members must report the same payment before a mint or melt quote changes state.
- **Checkpoint policy**: the consensus-configured intervals at which members cut quorum-signed checkpoints of the journal.
- **FROST wallet config**: the public parameters of the threshold treasury, such as network, confirmation depth, fee policy and descriptors.
- **Keyset rotation**: a consensus operation that changes the BLS keysets and nothing in the roster, so only the digest moves.
