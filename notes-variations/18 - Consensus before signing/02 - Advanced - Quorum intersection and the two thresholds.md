# 18.02 · Quorum intersection and the two thresholds

Variation 2 of slide 18 (Consensus before signing) · lens: Advanced · deck `fcv-c-ordering` page 20 · 4 steps · script 137 words, about 60 s

## Script

Why t may be lower than c.

**[1]** n = 5 tolerates f = 1 faulty member, f being the floor of n minus 1, over 3. The consensus threshold is c = n − f = 4; the signing threshold is t = 3.

**[2]** Two consensus quorums of 4 share at least 2c − n = 3 members. That is at least f + 1, so an honest member is in both, and two conflicting orders cannot both finalize.

**[3]** Two signing sets of 3 share at least 2t − n = 1 member, here m3. That member may be faulty. Signers alone cannot exclude a second output set.

**[4]** So t members sign only what c members finalized. validate_bft_safety enforces t ≥ f + 1 and c ≥ n − f; ThresholdParams enforces t ≤ c ≤ n.

## Background

- **f = ⌊(n − 1)/3⌋**: the largest number of Byzantine (arbitrarily faulty) members a BFT protocol with n members tolerates. n = 5 gives f = 1.
- **Quorum intersection**: two subsets of sizes a and b in a set of n share at least a + b − n members. For two sets of c: 2c − n. For two sets of t: 2t − n.
- **Why f + 1 matters**: with at least f + 1 shared members, at least one of them is honest, and an honest member does not help finalize two conflicting orders.
- **Signing sets**: with t = 3 of 5, the sets {m1, m2, m3} and {m3, m4, m5} share only m3. If m3 is faulty, the two sets have no honest member in common, so signers alone cannot prevent two output sets.
- **`validate_bft_safety`**: rejects profiles with t < f + 1 or c < n − f (`crates/cdk-common/src/federation/config.rs`). `ThresholdParams::validate` requires t ≤ c ≤ n.
- **Signers act only on finalized entries**: shares are produced only at apply of an accepted entry.
