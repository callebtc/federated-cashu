# 24 · Commit, reveal, deliver, sign

1.4 Keys and membership · 4 steps · script 122 words, about 50 s

## Script

The same ceremony as message rounds: four rounds among the members.

**[1]** Commit. Every member sends every other member a hash of what it will reveal. Nobody can change its contribution after seeing the others.

**[2]** Reveal. Every member publishes public commitments to its random polynomial. Others check them against the hashes from round one.

**[3]** Deliver. Every member sends each other member a private value, its polynomial evaluated at that member's ID. These values become the key shares.

**[4]** Sign. Every member hashes the whole public transcript and signs it. All members must have seen the same messages before the keys are activated. Round three is the step from the previous slide: each member receives one value from every other member and adds them up.

## Background

- **Commit–reveal**: first publish a hash of your data, then the data. Others verify the match; nobody can adapt their data after seeing others'.
- **a·G₂**: a commitment to a polynomial coefficient a. It reveals nothing about a but lets receivers check the values they get.
- **fⱼ(i)**: member j's polynomial evaluated at member i's ID; sent privately to member i.
- **Transcript**: all public messages of the ceremony; signing its hash confirms every member saw the same ones, since there is no broadcast channel.
- **Before and after**: the code also runs a readiness check before round one and an activation step after round four (next slide).
