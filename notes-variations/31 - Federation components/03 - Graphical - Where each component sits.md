# 31.03 · Where each component sits

Variation 3 of slide 31 (Federation components) · lens: Graphical · deck `fcv-f-client-intent` page 40 · 7 steps · script 121 words, about 50 s

## Script

One figure: the wallet, five members, AlephBFT and the treasury. Each numbered tag lights up where a component lives.

**[1]** Pairing check, in the wallet: it verifies each unblinded signature against the mint's public key.

**[2]** Key shares, at the members: each holds one share of the signing key.

**[3]** Operation IDs and one order, at AlephBFT: members submit operations and all receive the same order.

**[4]** Fan-out and aggregation, in the wallet: it sends each request to every member and combines the shares.

**[5]** DKG, among the members, who create the shares without any machine seeing the key.

**[6]** FROST, at the treasury: t members sign bitcoin transactions.

**[7]** Input witnesses, in the wallet: each v3 input signs its input digest. This one is specified, not implemented.

## Background

- **Pairing check**: a BLS12-381 equation that confirms a signature from the public key alone.
- **Key share**: a member's Shamir share k_i of the signing key k.
- **Operation ID**: a deterministic identifier of an operation's content; shares are bound to it.
- **Aggregation**: Lagrange interpolation of t signature shares into one signature, done by the wallet.
- **Treasury**: the bitcoin backing the tokens, held on-chain (BDK) and over Lightning (Bark), spent only with a FROST signature by t members.

## Speaker note

- Tag 7 is specified in cashubtc/nuts#443, not implemented on the federation branches.
