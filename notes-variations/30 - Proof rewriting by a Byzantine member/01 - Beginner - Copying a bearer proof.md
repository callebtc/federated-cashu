# 30.01 · Copying a bearer proof

Variation 1 of slide 30 (Proof rewriting by a Byzantine member) · lens: Beginner · deck `fcv-f-client-intent` page 3 · 5 steps · script 136 words, about 60 s

## Script

A proof P is two values: x, a random string the wallet chose, and C, the mint's signature on x. P is worth 8 sat, and anyone who shows both values can spend it.

**[1]** The wallet swaps P into two new 4-sat outputs, A and B, and sends this swap to every member.

**[2]** Every member, m3 included, now holds x and C.

**[3]** m3 writes its own swap: the same P, into outputs X and Y that m3 controls. Its swap enters the agreed order first.

**[4]** Members agree on one order, and P can be spent once. Entry 1, m3's swap, is applied. Entry 2, the wallet's, is rejected: P is already spent.

**[5]** The federation signs X and Y. The 8 sat now sit in m3's outputs. Nothing in P names the outputs the wallet asked for.

## Background

- **Proof (x, C)**: the Cashu token unit. x is the secret, C the mint's blind signature on it. Before v3 there is no further condition: whoever presents x and C spends the proof.
- **Swap (NUT-03)**: the wallet hands in proofs and receives signatures on new outputs of the same total value, minus fees. The old proofs are marked spent.
- **Outputs A, B, X, Y**: blinded messages. The mint signs them without seeing the secrets inside; whoever made them can unblind the signatures into new proofs.
- **Fan-out**: a federated wallet sends the same request to every member, because each member holds only a share of the signing key.
- **Agreed order**: the members run a consensus protocol (AlephBFT) that gives every member the same sequence of operations. Each member applies operations in that sequence, so the first operation that spends P wins everywhere.
- **Why the wallet cannot prevent it**: the attack needs only what the wallet must send to every member anyway.

## Speaker note

- This is audit finding SEC-2026-07-17-01 (`bls-federation:docs/federated-cashu-security-audit-2026-07-17.md`), still open on the branch.
