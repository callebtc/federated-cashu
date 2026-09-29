# removed.04 · Funding backends compared

Variation 4 of slide removed (Funding backends) · lens: Explained via table · deck `fcv-e-membership-custody` page 22 · 2 steps · script 138 words, about 60 s

## Script

Four backends: who holds keys, what marks a quote paid, what moves funds.

**[1]** A single CLN, LND, BDK or Bark connector runs on one operator's node. A quote is paid when that node reports it, and funds move when that operator decides. Quorum observations against such a node still leave one trusted operator. This belongs in standalone CDK. The fakewallet with development single observation holds no real funds; one observation finalizes a quote. Tests only.

**[2]** Federated BDK is the on-chain treasury. Each member holds a FROST share and runs a watch-only BDK wallet. A deposit counts after q member observations at confirmation depth. Funds move only after an accepted TransactionProposal and t FROST signers. Federated Bark is the Lightning treasury: q observations, then an accepted action plan and t signers. Both derive keys from the same FROST root.

## Background

- **CLN, LND**: Core Lightning and the Lightning Network Daemon, two Lightning node implementations.
- **BDK**: Bitcoin Dev Kit, a library for on-chain Bitcoin wallets.
- **Bark**: the Bark wallet implementation of the Ark protocol, used here for the Lightning treasury.
- **fakewallet with development_single_observation**: a CDK test backend that pretends payments succeed, combined with a policy where one accepted observation finalizes a quote.
- **Observation quorum q**: the number of members that must independently report the same payment or deposit.
- **Confirmation depth**: the number of blocks on top of the block containing the deposit. The default is 6.
- **TransactionProposal**: the consensus operation that carries the exact unsigned Bitcoin transaction for a payout.
- **Action plan**: the consensus operation for Bark that fixes one exact send, claim, revocation, refresh or exit before members sign.
- **Standalone BDK mnemonic**: a single-operator seed phrase. It is rejected in federation mode, because it would give one operator the treasury key.
