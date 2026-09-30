# 43.08 · The commit leaf

Variation 8 of slide 43 (Condition leaves) · lens: Focus: the commit leaf · deck `fcv-h-nutroot-tree` page 26 · 5 steps · script 139 words, about 60 s

## Script

**[1]** The commit leaf from the vectors, 37 bytes: version 00, type 04, and one hash record, field 0x08, 32 bytes. Nothing else: no keys, no disclosure.

**[2]** The hash is SHA-256 of "external data". The leaf sits beside a real condition, the auditable threshold leaf for key 3. Their leaf hashes are 20cccc22… and b957f8b5….

**[3]** The commit leaf changes the root, 14147412…, and with K = H + 7·G the secret, 0217b907…. The secret commits to those 32 bytes.

**[4]** Spends go through the threshold leaf. Key 3 reveals it with path 20cccc22…, so the mint sees the commitment as one sibling hash.

**[5]** A witness revealing the commit leaf must be rejected. It grants no spend power, and a receiver treats it as inert. The use: bind a proof to external data, for example the Nostr event a Nutzap pays for.

## Background

- **Commit leaf (type 0x04)**: binds the tree to 32 bytes the application defines. What the digest covers is for the protocol using it to say.
- **Why it changes the secret**: the commit leaf's hash is part of the root, so a proof built with a different digest has a different secret.
- **Sibling hash**: the commit leaf is paired with the threshold leaf; `20cccc22…` sorts before `b957f8b5…`, so it goes first in the branch.
- **Inert**: parses, adds no spend path and removes none.
- **Nutzap**: a Cashu payment announced as a Nostr event. Committing to a digest of the event ties the proof to that event, so it cannot be presented as payment for another.
- **K = H + 7·G**: the NUMS offset internal key of the auditable-lock vector, `028edfeb…`; no key path exists.
