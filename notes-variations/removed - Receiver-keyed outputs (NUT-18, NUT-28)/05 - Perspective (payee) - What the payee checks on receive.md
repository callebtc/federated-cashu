# removed.05 · What the payee checks on receive

Variation 5 of slide removed (Receiver-keyed outputs (NUT-18, NUT-28)) · lens: Perspective: payee · deck `fcv-j-nutroot-use` page 7 · 6 steps · script 140 words, about 60 s

## Script

**[1]** Gate one: read E. The request is receiver-keyed, so E must be present. Missing E, or E where nothing was blinded, rejects.

**[2]** Gate two: derive K. Zx = x(p·E), then r₀, then K = P + r₀·G. A disclosed K that differs rejects.

**[3]** Gate three: the tree must match l one to one, in any order, with blind-me keys replaced by points. An extra leaf, a missing leaf or any other changed byte rejects. An extra leaf is spend power nobody requested.

**[4]** Gate four, NUT-10 check one: every leaf parses, and K + t·G equals the secret.

**[5]** Gate five, check two: every leaf meets policy, for example a minimum refund horizon. Otherwise the payment is not received.

**[6]** Gate six: sweep by key path with p + r₀ + t. Until then the proof needs E, which the seed cannot restore.

## Background

- **Check one (NUT-10)**: the spend info must reconstruct the secret. The secret commits the tree, so a disclosed tree that reproduces it is complete: no hidden leaf can exist.
- **Check two (NUT-10)**: the wallet can spend the proof, and every disclosed leaf passes the wallet's acceptance policy.
- **Refund horizon**: how soon an after leaf lets the payer take the money back. A payee can require a minimum.
- **Why the derived K wins**: the payee computes K from E and her own key. A different disclosed K would bind the tree to a key she does not control.
- **Extra leaf**: NUT-18's example is a payer clawback behind a short after leaf; this is why the tree must equal l exactly.
- **Points in place of b keys**: the payee cannot compute another key's blinding. Whether the point is key 4's real blinding is checked by key 4's owner (NUT-28 value matching).
- **Sweep**: swap to secrets derived from the payee's own seed (NUT-13). E is wallet data, not derivable from the seed, so an unswept proof is lost with that data.
