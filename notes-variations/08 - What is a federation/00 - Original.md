# 08 · What is a federation

Original slide, deck `fcv-a-bls` page 2 (main deck slide 08). Same text as `notes/08 - What is a federation/notes.md`.

Setting · 2 steps · script 104 words, about 45 s

## Script

A Cashu mint today is one operator with one key and custody of the reserves.

**[1]** A federation replaces the single mint with n members. t of them must sign each token. The members agree on every operation through consensus, and c of them are needed for that. This changes the security assumption. A Byzantine fault tolerant system keeps working correctly as long as at most f members fail or lie, where f is n minus one, divided by three, rounded down. Put differently: more than two thirds of the members must be honest.

**[2]** Wallets talk to every member directly and combine the responses themselves.

## Background

- **Roster**: the fixed list of members, with their URLs and identity keys, agreed at setup.
- **Threshold (t-of-n)**: any t of the n members can complete an action; t − 1 or fewer cannot.
- **Byzantine fault tolerance (BFT)**: a system stays correct even if some participants crash or behave arbitrarily, including lying. With n members, up to f = ⌊(n − 1)/3⌋ faulty members can be tolerated; c = n − f must agree. Examples: n = 4 gives f = 1, c = 3; n = 5 gives f = 1, c = 4; n = 7 gives f = 2, c = 5.
- **⌊x⌋ (floor)**: round down to the nearest integer.
- **Consensus**: a protocol by which all honest members agree on the same ordered list of operations. The federation uses AlephBFT, a Rust library for asynchronous BFT consensus.

## Speaker note

- Your outline says the system "survives as long as the majority remains honest". The BFT bound is stronger: more than two thirds must be honest (n ≥ 3f + 1). The script uses the two-thirds statement.
