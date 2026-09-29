# 55 · What the specification covers

Original slide, deck `fcv-j-nutroot-use` page 10 (main deck slide 55). Same text as `notes/55 - What the specification covers/notes.md`.

2.4 Using nutroot · table, no steps · script 142 words, about 60 s

## Script

Everything the current spec text covers, with the NUT that specifies it. Bearer tokens: a bare K, with k in spend info. Paying to a key: an internal key blinded from the receiver's static key, spent by key path. Multisig: a threshold leaf, or a MuSig2 or FROST internal key with at least the empty tweak. Timelocked refunds: an after leaf naming the refund keys. HTLCs: a hashlock leaf, with disclosure when the preimage must be observable. Binding to data: a commit leaf next to the real conditions, for example a Nutzap event digest. Auditable locks: a NUMS internal key with one threshold leaf, n = 1, with disclosure. Locked mint quotes: the paid quote is a signed input. Blind auth: a point secret signing a request transcript. Multi-party signing packages and spend receipts. And spend evidence as a tagged spend commitment.

## Background

- **Nutzap**: ecash sent over Nostr, locked to the recipient's key and published as an event.
- **Auditable lock**: a lock any third party can verify from the disclosed K, u and tree, without keys or the mint: only the named key can spend it.
- **NUT-20**: signature on mint quote. **NUT-29**: batched minting. **NUT-22**: blind authentication, tokens that authorize access to protected mint endpoints.
- **`nutspA` / `nutrcA`**: transport-string prefixes for a signing package (collecting cosigner signatures) and a spend receipt.
- **Spend commitment**: tagged_hash("Cashu_SpendCommitment", Y ‖ input_digest ‖ witness_hash), evidence of how a proof was spent.
