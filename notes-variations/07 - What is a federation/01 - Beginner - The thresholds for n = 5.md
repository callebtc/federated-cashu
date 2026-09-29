# 07.01 · The thresholds for n = 5

Variation 1 of slide 07 (What is a federation) · lens: Beginner · deck `fcv-a-bls` page 3 · 5 steps · script 140 words, about 60 s

## Script

Four numbers describe a federation, here with five members.

**[1]** n = 5: five members in a fixed roster, m1 to m5. Each holds a share of the signing key for every amount.

**[2]** f = 1: the number of members that may be Byzantine, meaning they deviate arbitrarily from the protocol, including sending conflicting messages. f is the floor of (n − 1)/3, here the floor of 4/3, which is 1.

**[3]** c = 4: the number of members needed to commit an operation to the shared order. c = n − f = 4.

**[4]** t = 3: the number of shares needed for one signature. Any three members give the same result. t must lie between f + 1 and c.

**[5]** q = 4: the number of matching payment observations before a quote counts as paid. q is at least c.

## Background

- **Roster**: the fixed list of members, with their URLs and identity keys, agreed at setup.
- **Byzantine member**: a member that may crash, lie, or send different messages to different peers. The protocol must stay correct as long as at most f members behave this way.
- **⌊x⌋ (floor)**: round down to the nearest integer. ⌊4/3⌋ = 1, ⌊6/3⌋ = 2.
- **Why f = ⌊(n − 1)/3⌋**: Byzantine fault-tolerant consensus needs n ≥ 3f + 1. The largest f that satisfies this for n = 5 is 1; for n = 7 it is 2.
- **Commit to the shared order**: members run AlephBFT, a consensus protocol that outputs the same ordered list of operations at every honest member. An operation is committed when c members have agreed on its position.
- **Signing threshold t**: each member holds a share kᵢ of the key k. Any t shares combine to the same signature; t − 1 shares reveal nothing about it. t ≥ f + 1 means the f possibly Byzantine members cannot sign alone. t ≤ c means every set that can commit an operation can also sign it.
- **Observation quorum q**: one member reporting "the invoice was paid" could be wrong or lying. The quote is marked paid only after q members report matching observations.

## Speaker note

- In the code (`bls-federation`, `ThresholdParams::validate_bft_safety`), t ≥ f + 1 and c ≥ n − f are checked by the production safety profile; the purely structural check only requires 1 ≤ t ≤ c ≤ n. The slide's "allowed range" is the production range.
