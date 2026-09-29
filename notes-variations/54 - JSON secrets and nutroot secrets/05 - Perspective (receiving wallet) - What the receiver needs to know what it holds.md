# 54.05 · What the receiver needs to know what it holds

Variation 5 of slide 54 (JSON secrets and nutroot secrets) · lens: Perspective: receiving wallet · deck `fcv-j-nutroot-use` page 32 · 5 steps · script 137 words, about 60 s

## Script

**[1]** A v1 or v2 JSON secret describes itself. The receiver reads kind, keys and locktime from the string; nothing can hide in it.

**[2]** A v3 secret is a 33-byte point that says nothing. Conditions arrive as spend info, wallet to wallet: here E and one after leaf.

**[3]** Check one: derive K from E, then K + t·G must equal the secret. The secret commits the tree, so a tree that reproduces it is complete.

**[4]** Check two: the wallet holds the key path, p + r₀ + t, and the after leaf passes the refund-horizon policy.

**[5]** Then sweep promptly. Bearer k: the sender holds the same scalar, and it can conceal a tree. E: the seed alone cannot recover the proof. A tree with neither: the key-path holder can spend any time, unless K is a NUMS offset.

## Background

- **Check one and check two (NUT-10)**: receive-time verification. One: the spend info reconstructs the secret. Two: the wallet can spend it, and every leaf passes its policy.
- **Provably complete**: the secret commits the root, the root commits every leaf; a disclosure that reproduces the secret leaves no room for another leaf.
- **p + r₀ + t**: the payee's static private key plus the slot-0 blinding scalar plus the tweak, mod n.
- **Refund horizon**: how soon the after leaf lets the payer reclaim; the receiver can require a minimum.
- **Bearer scalar concealing a tree**: a tweaked private key (k + t) and a bare key verify identically, so a sender could hand over a key whose public point commits leaves the receiver was not shown.
- **Seed recovery (NUT-13)**: proofs whose keys derive from the wallet seed can be restored from the seed alone; E is not seed-derived.
- **NUMS offset**: K = H + u·G, whose private key nobody knows, so no key-path holder exists.
