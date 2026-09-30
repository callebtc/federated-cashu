# 29 · Ecash, bitcoin, consensus

Setting · continuous animation, no steps · script 113 words, about 50 s

## Script

A federated mint runs two ledgers at once. One is ecash: quotes, blinded outputs, spent proofs. The other is bitcoin: the Lightning and on-chain funds that back the ecash. Neither can move on its own. Minting ecash depends on a bitcoin payment being observed. Melting ecash leads to a bitcoin payment being signed. Both are driven by the same consensus: every member sees the same operations in the same order, applies the same rules, and only then signs, with BLS shares for ecash and FROST shares for bitcoin. Threshold signatures alone would not be enough. What makes this a federation is that the state of both ledgers advances in lockstep, on every member.

## Background

- **Two ledgers**: the ecash state (issued, spent) lives in each member's database; the bitcoin state lives on the Lightning network and the blockchain. The mint keeps them consistent.
- **Coupling**: a mint quote is paid on the bitcoin side before ecash is issued; a melt burns ecash and triggers a bitcoin payment.
- **Consensus**: AlephBFT gives every member the same ordered list of operations; deterministic rules turn that list into the same state everywhere.
- **The animation**: the rotating ticks around "consensus" stand for the ordered log; the pulses for consensus rounds. The two strands never stop and each ends where it begins.
