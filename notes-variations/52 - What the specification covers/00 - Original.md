# 52 · What the specification covers

Original slide, deck `fcv-j-nutroot-use` page 10 (main deck slide 52). Same text as `notes/52 - What the specification covers/notes.md`.

2.4 Using nutroot · table, no steps · script 85 words, about 35 s

## Script

What the current spec covers, with the NUT for each. Bearer tokens: a bare key, with k in spend info. Paying to a key: a blinded receiver key. Multisig: a threshold leaf, or a MuSig2 or FROST internal key. Timelocked refunds: an after leaf. HTLCs: a hashlock leaf. Binding to data: a commit leaf. Auditable locks: a NUMS key with one threshold leaf, readable by anyone. Locked mint quotes: the paid quote signs as an input. And blind auth: a point secret signs the request.

## Background

- **Nutzap**: ecash sent over Nostr, locked to the recipient's key; a typical use of commit leaves and auditable locks.
- **Auditable lock**: a lock any third party can verify from the disclosed K, u and tree: only the named key can spend it.
- **NUT-20**: signature on mint quote. **NUT-22**: blind authentication, tokens that authorize access to protected mint endpoints.
- **Also specified, not on the slide**: multi-party signing packages (`nutspA`), spend receipts (`nutrcA`), and spend commitments for evidence (NUT-07).
