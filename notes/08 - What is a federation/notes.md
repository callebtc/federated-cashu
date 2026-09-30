# 08 · What is a federation

Setting · 5 steps · script 94 words, about 40 s

## Script

A Cashu mint today is one operator. Everyone trusts that one operator with the keys and the funds.

**[1]** A federation splits it into several independent members, here five.

**[2]** The members only act together. Any four of the five are enough to keep the mint honest: one member can fail or lie, and the rest still agree on what is correct.

**[3]** It does not matter which one is missing.

**[4]** Any four will do.

**[5]** A wallet talks to every member directly and combines their answers itself. It never needs to trust a single one of them.

## Background

- **Byzantine fault tolerance (BFT)**: the system stays correct while up to f members crash or behave arbitrarily. With n members, f = ⌊(n − 1)/3⌋; for five members that is one, so four must agree.
- **Quorum**: the set of members that must agree before the mint changes state. Any quorum of four works; which member is missing does not matter.
- **Signing threshold**: separately, t members must sign each token; t is at most the quorum size.
- **Wallet fan-out**: the wallet sends the same request to all members and combines the responses; members also talk to each other to agree on the order of operations.

## Speaker note

- More than two thirds of the members must be honest, not just a majority. The slide shows that with 4 of 5.
