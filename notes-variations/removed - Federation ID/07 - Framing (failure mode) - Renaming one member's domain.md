# removed.07 · Renaming one member's domain

Variation 7 of slide removed (Federation ID) · lens: Framing: failure mode · deck `fcv-e-membership-custody` page 9 · 4 steps · script 135 words, about 60 s

## Script

m2's domain, mint-a.example.com, expires, and its operator wants mint-a.net.

**[1]** Serving the new name from m2's reverse proxy does not help. Peers and wallets dial the URL in the roster, which is still the old name.

**[2]** If m2 edits its own config, it derives a different federation ID. Its envelopes and DKG transcripts no longer match the other members'.

**[3]** If wallets are told the new URL, the member's advertised config digest no longer matches the config the wallet imported.

**[4]** The only path is a new setup, with new proposal, authorization, federation ID and dual DKG; users move their ecash. A raw IP after a server move, or a regenerated iroh endpoint ID, ends the same way. An open question: hash only member ID and identity key, and publish URLs as an authenticated, rotatable advertisement. Not specified.

## Background

- **Reverse proxy**: a server in front of the mint that forwards requests. It can answer under additional names, but it does not change which URL peers and wallets dial.
- **Envelope**: the wrapper around every consensus operation. It contains the federation ID, so envelopes from a member with a different ID are rejected by the others.
- **Config digest check**: wallets compare each member's advertised config digest with the digest of the config they imported; any difference excludes the member.
- **Locator vs. identity**: a URL, IP address or iroh endpoint ID says where to reach a member; the identity key says who the member is. Today both are hashed into the federation ID.
- **iroh endpoint ID**: the public-key-based address of an iroh node. Regenerating the node key changes it.
- **Authenticated, rotatable advertisement**: a proposed design in which a member signs its current URLs with its identity key and can replace them without changing the federation ID. Not specified and not implemented.
