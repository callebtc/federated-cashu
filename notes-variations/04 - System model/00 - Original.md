# 04 · System model

Original slide, deck `fcv-a-bls` page 2 (main deck slide 04). Same text as `notes/04 - System model/notes.md`.

Setting · 2 steps · script 120 words, about 50 s

## Script

A standalone Cashu mint has one operator, one private key k per amount, and custody of the reserves.

**[1]** A federated mint replaces that operator with n members in a fixed roster. Four parameters describe it. t is the signing threshold: how many members must return a signature share for a token to be issued. c is the consensus threshold, c = n − ⌊(n − 1)/3⌋, the standard Byzantine fault tolerance bound. t is at most c. q is the payment observation quorum: how many members must independently see a payment before it counts. q is at least c.

**[2]** Wallets talk to every member directly and combine the responses themselves. Members order every operation with AlephBFT before they sign anything.

## Background

- **Roster**: the fixed list of members, with their URLs and identity keys, agreed at setup.
- **Threshold (t-of-n)**: any t of the n members can complete an action; t − 1 or fewer cannot.
- **Byzantine fault tolerance (BFT)**: a system stays correct even if some participants crash or behave arbitrarily, including lying. With n members, up to f = ⌊(n − 1)/3⌋ faulty members can be tolerated; the remaining c = n − f must agree. Examples: n = 4 gives f = 1, c = 3; n = 5 gives f = 1, c = 4; n = 7 gives f = 2, c = 5.
- **⌊x⌋ (floor)**: round down to the nearest integer.
- **AlephBFT**: a Rust library implementing an asynchronous BFT consensus protocol. All honest members output the same ordered list of items. "Asynchronous" means correctness does not depend on messages arriving within a time bound.
- **Observation quorum q**: a single member reporting "the invoice was paid" could be lying or mistaken. The payment counts only after q members have observed it.
