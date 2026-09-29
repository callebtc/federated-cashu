# 53.03 · One secret, eight shapes

Variation 3 of slide 53 (What the specification covers) · lens: Graphical · deck `fcv-j-nutroot-use` page 13 · 8 steps · script 140 words, about 60 s

## Script

Each tile draws one use as the shape of its secret. Legend: T threshold, A after, H hashlock, C commit; a ring marks disclosure, a dashed key NUMS, blue a blinded key.

**[1]** Bearer: the secret is K itself, and its private key k travels with it.

**[2]** Pay to a key: K blinded from the receiver's static key, with E in spend info.

**[3]** Multisig: K aggregated from several keys, under the empty tweak.

**[4]** Refund: a blinded K plus an after leaf.

**[5]** HTLC: a blinded K plus a hashlock leaf, here with disclosure.

**[6]** Nutzap: a NUMS K with u disclosed, a threshold leaf with disclosure, and a commit leaf.

**[7]** Auditable lock: a NUMS K and exactly one threshold leaf with disclosure.

**[8]** Quote lock: a plain lock key, here with an after leaf so an unredeemed quote can be reclaimed after the locktime.

## Background

- **Shape of the secret**: every v3 secret is one 33-byte key. What differs is the internal key K and whether a tree of leaves is tweaked into it.
- **Blinded K (NUT-28)**: derived by the payer from the receiver's static key with a fresh ephemeral; E lets the receiver derive the private key.
- **Aggregated K**: a MuSig2 or FROST key nobody holds alone; it must carry at least the empty tweak.
- **NUMS K**: H + u·G, no key path; u is disclosed so holders can verify that.
- **Disclosure ring**: the leaf's witness becomes public through NUT-07 when that leaf is spent.
- **Quote lock (NUT-04)**: the key that signs a paid mint quote as a transaction input; it may commit leaves like any v3 key.

## Speaker note

- The HTLC and quote-lock tiles show optional choices: disclosure on a hashlock leaf is needed only when the preimage must be observable, and an after leaf on a quote lock is a MAY in NUT-04.
