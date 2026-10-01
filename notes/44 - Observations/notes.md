# 44 · Observations

Closing · 5 steps · script 88 words, about 40 s

## Script

To close, five observations.

**[1]** BLS gives us blind signatures that anyone can verify with the public key, and that a threshold of members can produce together.

**[2]** The federation was built with AI agents, under supervision, in about two weeks.

**[3]** The treasury works with anything that can sign with FROST. Today that is an on-chain wallet and Bark. Taproot channels may be next.

**[4]** Taproot is a very good design. Hiding scripts inside a key is worth copying.

**[5]** And we think nutroot is the future of spending conditions in Cashu.

## Background

- **Publicly verifiable**: with BLS, a pairing check against the mint's public key proves a signature is valid. Today's Cashu signatures can only be checked by the mint, or by the wallet with a separate DLEQ proof.
- **FROST treasury**: the reserves sit behind one Schnorr key that the members control together with FROST threshold signing. Any backend that accepts a Schnorr signature for a single key can hold the funds.
- **Bark**: an implementation of Ark, a layer-two protocol where users share on-chain outputs coordinated by a server.
- **Taproot channels**: Lightning channels whose funding output is a taproot key, so a channel could be funded by the federation's FROST key. Not implemented yet.
- **Nutroot**: the spending-condition scheme from part 2: the secret is a public key that commits to a tree of conditions, as in taproot.
