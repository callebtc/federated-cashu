# removed.05 · Rebuilding a requested tree

Variation 5 of slide removed (The fold fixes the shape) · lens: Perspective: payer and payee · deck `fcv-h-nutroot-tree` page 32 · 5 steps · script 140 words, about 60 s

## Script

**[1]** The payee's request carries its static public key, field k; the requested leaves, field l, in slot order; and field b, the keys to blind. It carries no tree shape.

**[2]** The payer derives the internal key: the payee's key blinded at slot 0 with a fresh ephemeral key E, or, when k is the NUMS point, K = H + u·G.

**[3]** The payer reproduces every leaf of l byte for byte, with the keys tagged in b replaced by their blinded forms. If it cannot, it must refuse to pay.

**[4]** It computes the root by sort, pair, promote, and P = K + t·G. The leaf list alone fixes the tree.

**[5]** It sends the proof with secret P and spend info. The payee runs check 1 and verifies the tree is exactly l, in any order, with no extra leaf.

## Background

- **NUT-18**: payment requests; the payee publishes what it wants to receive. The `nutroot` option has fields `k` (static receiver key), `l` (serialized leaves, in slot order) and `b` (keys to blind).
- **NUT-28 slots**: blinding uses a per-slot scalar; slot 0 is the internal key, slots 1 onward the leaf keys in transmitted order.
- **Ephemeral key E**: a fresh keypair per output. The payee combines E with its private key to derive the same blinding.
- **NUMS request**: `k` may be the NUMS point H; the payer then uses K = H + u·G with a fresh u and returns u in spend info.
- **Exactly l**: the disclosed leaves and `l` match one-to-one, order-insensitive, byte-identical except for keys tagged in `b`. An extra leaf is spend power the payee never requested, for example a payer clawback behind a short after leaf.
