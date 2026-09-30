# 21 · Network topology

Original slide, deck `fcv-d-flows-dkg` page 10 (main deck slide 21). Same text as `notes/21 - Network topology/notes.md`.

1.3 Ordering · 3 steps · script 100 words, about 45 s

## Script

**[1]** There are two networks. On the public plane, each member serves the normal Cashu HTTP API on its public mint URL. Wallets use only this plane; they fan out and aggregate responses client-side.

**[2]** On the private plane, under /federation/v1, members authenticate each other and run consensus, journal catch-up and DKG. Wallets never see it.

**[3]** Liveness differs per operation. Here n = 5, so c = 4. With two members offline, three remain. That is not enough to order new operations. Returning signature shares needs t members. Both planes run over HTTPS or iroh; the transport does not change the protocol.

## Background

- **Fan-out**: the wallet sends the same request to all members in parallel.
- **Liveness**: whether the system can still make progress. Safety (never doing something wrong) and liveness (eventually doing something) are separate properties.
- **Why ordering stalls**: consensus needs c = n − ⌊(n − 1)/3⌋ = 5 − 1 = 4 participating members; three are not enough.
- **iroh**: a peer-to-peer networking library that connects nodes directly by public key over QUIC.
- **DKG**: distributed key generation, section 1.4.
