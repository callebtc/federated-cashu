# 25 · Federation ID

1.4 Keys and membership · 1 step · script 132 words, about 55 s

## Script

The federation ID is a SHA-256 over a domain string and the setup transcript. The transcript contains the setup authorization, the thresholds, and for each member its ID, both URLs and its identity key.

**[1]** Change one DNS name, m2 moves to .org, and the ID changes completely.

So all of these require a new federation: adding, removing or replacing a member; rotating an identity key; changing t or c; the payment observation policy; the Bitcoin network; the FROST epoch; the wallet protocol version; switching between HTTPS and iroh; or a DNS name in the roster. The only mutation of the public signing surface that goes through consensus is KeysetRotation.

Open design questions: separating a member's locator from its identity, genesis versus policy amendments, repairing a member versus replacing it, and migrating users.

## Background

- **Domain string**: a fixed prefix in the hash input that makes the result specific to this use.
- **Both URLs**: the member's public mint URL (for wallets) and its private federation URL (for members).
- **FROST epoch**: a version number of the treasury key; a new treasury key ceremony starts a new epoch.
- **Locator vs. identity**: a URL says where to reach a member; the identity key says who it is. Today both are hashed into the ID, so a DNS change counts as a new federation.
- **Genesis**: the initial configuration a federation starts from.
