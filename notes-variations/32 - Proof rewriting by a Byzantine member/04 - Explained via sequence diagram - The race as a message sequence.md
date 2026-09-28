# 32.04 · The race as a message sequence

Variation 4 of slide 32 (Proof rewriting by a Byzantine member) · lens: Explained via sequence diagram · deck `fcv-f-client-intent` page 6 · 5 steps · script 120 words, about 50 s

## Script

Time runs downward. The columns are the wallet, three members and the consensus layer.

**[1]** The wallet sends one swap, P1 and P2 into A and B, to every member.

**[2]** m3 wraps the same inputs with its own outputs, X and Y, in an envelope and submits it to consensus. An envelope is the operation plus the submitting member's signature.

**[3]** m1 wraps and submits the wallet's swap. It reaches consensus later.

**[4]** Every member receives the same order: 57 is m3's swap, 58 the wallet's. Members apply 57, mark P1 and P2 spent and sign X and Y. Operation 58 conflicts on its inputs.

**[5]** m1 returns TokenAlreadySpent to the wallet. That error is the only part of the race the wallet sees.

## Background

- **Sequence diagram**: each vertical line is a participant; each horizontal arrow is a message, and later messages are drawn lower.
- **Envelope**: the member-signed wrapper in which a member submits a wallet request to consensus.
- **Conflict on inputs**: two operations that spend the same proof. The member applies the first and rejects the second.
- **TokenAlreadySpent**: the error for a proof whose Y is already marked spent (Cashu error code 11001, "Proofs already spent").
- **Why the wallet cannot tell**: it sees the same error as for an honest double spend of its own proofs.
