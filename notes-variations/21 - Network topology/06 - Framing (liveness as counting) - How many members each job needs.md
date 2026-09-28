# 21.06 · How many members each job needs

Variation 6 of slide 21 (Network topology) · lens: Framing: liveness as counting · deck `fcv-d-flows-dkg` page 16 · 4 steps · script 136 words, about 60 s

## Script

Five members, so f, the number of faulty members tolerated, is ⌊(n − 1)/3⌋ = 1, and the consensus threshold c = n − f = 4. The example chooses t = 3 and q = 4. Each row is one job.

**[1]** All five online: every job runs.

**[2]** m5 goes offline. Four still meet c: ordering continues, four observers can mark a quote paid, and ordered operations get three shares. A DKG cannot run; it needs all five.

**[3]** m4 also goes offline. Three is below c. Nothing new is ordered, so no quote becomes paid and nothing new is signed, although three members could produce t shares.

**[4]** The rules: t between f + 1 and c, here 2 to 4. q between c and n, here 4 or 5. A DKG needs every roster member throughout.

## Background

- **f = ⌊(n − 1)/3⌋**: the largest number of Byzantine members a BFT protocol with n members tolerates. ⌊x⌋ means round down.
- **c = n − f**: the number of members AlephBFT needs to order new items.
- **t ≥ f + 1**: f colluding members alone cannot produce a signature, and any t identical answers include an honest member.
- **t ≤ c**: config validation rejects a signing threshold above the consensus threshold. t may be below c because members sign only operations that were already ordered.
- **q ≥ c**: among q matching payment observations at most f come from Byzantine members.
- **DKG**: distributed key generation. Every roster member contributes a polynomial and receives a value from every other member, so the ceremony needs all n.
