# 28 · Funding backends

1.5 Custody · 2 steps · script 126 words, about 55 s

## Script

The ecash issuer is federated. This slide is about where the reserves are held.

**[1]** If the backend is one CLN, LND or BDK node, one operator holds its keys. That operator can mark unpaid quotes as paid, refuse or redirect melts, and spend the reserves. Consensus among members does not constrain a key they do not hold.

**[2]** Threshold custody: the treasury key P is a FROST t-of-n key on secp256k1, held by the same members that sign ecash. Invoices, payments and withdrawals become consensus operations. Spending needs t FROST signers from the same roster. The treasury threshold is not weaker than the ecash threshold.

Two backends: federated BDK for an on-chain treasury, and federated Bark for Lightning. The single-observation mode and fakewallet are for tests only.

## Background

- **CLN, LND**: Core Lightning and the Lightning Network Daemon, two Lightning node implementations.
- **BDK**: Bitcoin Dev Kit, a library for on-chain Bitcoin wallets.
- **Bark**: the Bark wallet implementation of the Ark protocol; used here for the Lightning treasury.
- **FROST**: Flexible Round-Optimized Schnorr Threshold signatures. t of n members produce one ordinary BIP340 Schnorr signature, verifiable like a single-key signature.
- **Melt (NUT-05)**: redeeming ecash for an outgoing payment made by the mint.
- **fakewallet**: a CDK payment backend that pretends every payment succeeds, used for testing.
