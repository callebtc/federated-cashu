# 30.03 · Two swaps, one set of inputs

Variation 3 of slide 30 (Proof rewriting by a Byzantine member) · lens: Graphical · deck `fcv-f-client-intent` page 5 · 5 steps · script 123 words, about 55 s

## Script

The wallet holds two proofs, P1 and P2. The members submit operations to AlephBFT, the consensus protocol that fixes one order for all of them.

**[1]** The wallet sends its swap, P1 and P2 into outputs A and B, to all three members.

**[2]** m3 builds a second swap from the same inputs into its own outputs, X and Y, and submits it to AlephBFT.

**[3]** m1 submits the wallet's swap. It arrives after m3's.

**[4]** AlephBFT places m3's swap at position 57 and the wallet's at 58. Operation 57 is applied and spends P1 and P2. Operation 58 finds them spent.

**[5]** Only X and Y receive signatures. A and B are never signed. One set of inputs produced two well-formed swaps, and the order selected m3's.

## Background

- **AlephBFT**: the asynchronous Byzantine fault tolerant consensus protocol the federation uses. Members submit operations; every honest member receives the same total order.
- **#57, #58**: positions in the agreed order. Operations are applied in this sequence; the numbers are illustrative.
- **Why the order decides**: both swaps are valid in isolation. Applying the first marks P1 and P2 spent, so the second fails its spent check.
- **Red versus blue coins**: X and Y are m3's outputs and get signed; A and B are the wallet's outputs and stay unsigned.
