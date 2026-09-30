# 08 · What is a federation

Setting · 8 steps · script 109 words, about 45 s

## Script

A Cashu mint today is one operator. Everyone trusts that one operator with the keys and the funds.

**[1]** A federation splits it into several independent members.

**[2]** The size is a choice. Three members work.

**[3]** So do twenty-one.

**[4]** For this talk we use five.

**[5]** The members only act together. Any four of the five are enough to keep the mint honest: one member can fail or lie, and the rest still agree on what is correct.

**[6]** It does not matter which one is missing.

**[7]** Any four will do.

**[8]** A wallet talks to every member directly and combines their answers itself. It never needs to trust a single one of them.

## Background

- **Federation size**: n is set when the federation is created. With n members, BFT tolerates ⌊(n − 1)/3⌋ faulty ones: none with three, one with five, six with twenty-one. More members tolerate more faults but add messages per operation.
- **Byzantine fault tolerance (BFT)**: the system stays correct while up to f members crash or behave arbitrarily. With n members, f = ⌊(n − 1)/3⌋; for five members that is one, so four must agree.
- **Quorum**: the set of members that must agree before the mint changes state. Any quorum of four works; which member is missing does not matter.
- **Signing threshold**: separately, t members must sign each token; t is at most the quorum size.
- **Wallet fan-out**: the wallet sends the same request to all members and combines the responses; members also talk to each other to agree on the order of operations.

## Speaker note

- More than two thirds of the members must be honest, not just a majority. The slide shows that with 4 of 5.
