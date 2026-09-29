# 25.01 · A federation ID from three roster rows

Variation 1 of slide 25 (Federation ID) · lens: Beginner · deck `fcv-e-membership-custody` page 3 · 5 steps · script 132 words, about 55 s

## Script

A federation is defined by its roster, the list of its members.

**[1]** Each member has an ID, a public URL where wallets reach it, and an identity key: a public key that authenticates the member to its peers.

**[2]** The roster also fixes two thresholds. t equals 2: two members must contribute a share to each ecash signature. c equals 3: three members must agree before an operation is ordered.

**[3]** Here the roster is written out as one string. This encoding is illustrative; the real byte encoding is on the next variation.

**[4]** SHA-256 maps the string to 32 bytes. That value is the federation ID.

**[5]** Append .org to m2's URL. The new hash has no visible relation to the old one. A changed roster therefore gives a different federation, not an edited one.

## Background

- **Roster**: the fixed list of members of one federation. For each member it records a numeric member ID, a public mint URL for wallets, a federation API URL for member-to-member traffic, and an identity public key.
- **Identity key**: a secp256k1 key pair per member. Peers verify signatures made with it on member-to-member messages. It is separate from the member's BLS and FROST key shares.
- **t (signature threshold)**: the number of members whose BLS signature shares are combined into one ecash signature.
- **c (consensus threshold)**: the number of members that must take part for an operation to be ordered.
- **SHA-256**: a hash function that maps any input to 32 bytes. Equal inputs give equal outputs; changing one character gives an output with no usable relation to the previous one; finding two inputs with the same output is infeasible.
- **Federation ID**: the SHA-256 hash that identifies a federation. Consensus messages, DKG results and wallet checks all carry it, so a changed input produces a federation that the old members and wallets do not accept.

## Speaker note

- The string `fed:v1|t=2|c=3|m1,…` and the key prefixes (4c1f, 9a07, e21b) are illustrative. Both hashes on the slide are computed live in the browser over that string (`useSha256(ROSTER_A / ROSTER_B)`), not over the real transcript of `derive_federation_id`. The real transcript also contains the setup authorization, n and each member's federation API URL (variation 02).
