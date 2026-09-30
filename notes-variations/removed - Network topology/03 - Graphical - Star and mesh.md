# removed.03 · Star and mesh

Variation 3 of slide removed (Network topology) · lens: Graphical · deck `fcv-d-flows-dkg` page 13 · 4 steps · script 118 words, about 50 s

## Script

One wallet on the left, five members on the right.

**[1]** The wallet fans out one request to the five public URLs.

**[2]** The members exchange messages among themselves on the private plane, under /federation/v1, in a full mesh. Ordering needs c = 4 members. For n = 5, c = n − ⌊(n − 1)/3⌋ = 4.

**[3]** After the operation is ordered, m1, m2 and m3 return their shares. t = 3 shares give the signature C′.

**[4]** m4 and m5 go offline. Three members remain. That is enough to produce t = 3 shares, but it is below c = 4, so no new operation can be ordered. Members only sign ordered operations, so nothing new is signed either.

## Background

- **Fan-out**: the wallet sends the same request to all members in parallel.
- **c, the consensus threshold**: c = n − f with f = ⌊(n − 1)/3⌋ tolerated faulty members. For n = 5: f = 1, c = 4.
- **t, the signing threshold**: the number of signature shares that combine into one signature. t may be below c because signing follows ordering.
- **Liveness vs safety**: with three members online the federation stops making progress, but it does not sign anything that was not ordered.
