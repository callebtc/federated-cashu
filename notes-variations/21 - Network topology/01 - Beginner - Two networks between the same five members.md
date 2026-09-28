# 21.01 · Two networks between the same five members

Variation 1 of slide 21 (Network topology) · lens: Beginner · deck `fcv-d-flows-dkg` page 11 · 4 steps · script 129 words, about 55 s

## Script

Five members, n = 5, and a signing threshold t = 3. The same five members appear twice, once for each network.

**[1]** On the public plane, the wallet sends the same request to each member's public URL. That is a star: one link per member, 5 links.

**[2]** The members also connect to each other, on a private network. Every pair of members has a link: n times n minus 1, divided by 2, gives 10 links. Wallets never use this network.

**[3]** On the private network the members agree on one order of operations before anyone signs. That agreement is consensus.

**[4]** Each member then answers the wallet on the public plane with its signature share. Here m1, m2 and m4 answer. t = 3 shares combine into one signature, C′.

## Background

- **Public plane**: the normal Cashu HTTP API that each member serves on its public mint URL. Wallets use only this.
- **Private plane**: the member-to-member API under /federation/v1, used for consensus, catch-up and key generation. Members authenticate each other there.
- **Star and full mesh**: a star connects one centre to every node (n links); a full mesh connects every pair, n(n − 1)/2 links. For n = 5: 5 and 10.
- **Consensus**: the members order every operation with AlephBFT before they sign, so all honest members apply the same operations in the same order.
- **Signature share**: member i returns kᵢ·B′. Any t of them, combined by the wallet with Lagrange weights, give the blind signature C′ = k·B′.
