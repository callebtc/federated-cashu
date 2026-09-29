# removed.05 · Which changes need a new federation

Variation 5 of slide removed (Federation ID) · lens: Framing: decision table · deck `fcv-e-membership-custody` page 7 · 3 steps · script 134 words, about 55 s

## Script

Each row is a change an operator might want, the hash that covers it, and its path.

**[1]** Roster changes are in both hashes: adding, removing or replacing a member, rotating an identity key, changing t or c, a public mint URL, or a federation API URL, including a switch between HTTPS and iroh. Each needs a new setup. A membership change also needs new BLS and FROST DKGs.

**[2]** Policy changes are in the config digest only: payment observation policy, checkpoint policy, wallet protocol version, on-chain policy. They also need a new setup; the FROST root cannot change in place.

**[3]** Two changes avoid a new setup. Rotating a BLS keyset is a KeysetRotation, ordered through consensus. Renewing a TLS certificate for the same name is local. There is no membership operation and no URL update.

## Background

- **New setup**: a new proposal, approval by every member, a new setup authorization and federation ID, and new BLS and FROST DKGs. Existing ecash stays with the old federation; users move it.
- **Dual DKG**: the two distributed key generation ceremonies run over one roster: BLS12-381 for ecash signing, FROST on secp256k1 for the treasury.
- **iroh**: a peer-to-peer transport addressed by endpoint IDs. A roster URL can use `iroh://`; the traffic is the same HTTP-shaped API carried over iroh instead of TCP.
- **Why policy changes need a new setup**: the code has no operation that amends policy. The only config change applied through consensus is KeysetRotation.
- **Immutable FROST root**: root refresh and in-place rotation are unsupported. Replacing the custody key requires a separate wallet and a threshold-authorized migration.
- **TLS certificate**: proves control of a DNS name to HTTPS clients. It is not part of either hash, so renewing it for the same name changes nothing.
