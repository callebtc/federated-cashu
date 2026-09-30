# 21.02 · Applying an accepted swap

Variation 2 of slide 21 (Federated swap) · lens: Advanced · deck `fcv-c-ordering` page 28 · 3 steps · script 136 words, about 60 s

## Script

The apply step for an accepted swap, from apply_federation_swap.

**[1]** Before any database transaction: the inputs are non-empty, verify against the aggregate v3 keys and meet their spending conditions; the outputs are on v3 keysets; inputs balance outputs including fees. The balance check runs here at apply, not at admission.

**[2]** Inside one transaction, input state and existing output signatures decide. Unspent inputs, no signatures: mark the inputs spent, sign, and store share rows, messages, signatures and the completed operation. Spent inputs with all signatures of this completed swap: a replay, which re-derives this member's shares. Spent otherwise: TokenAlreadySpent. Pending or reserved inputs: TokenPending.

**[3]** Success writes Applied in the same transaction; an error rolls everything back. Both token errors are definitive, so the entry ends Rejected with the error stored. The public route only reads stored share rows.

## Background

- **Aggregate v3 keys**: the federation's BLS public keys per amount; a proof verifies against them like a single-mint v3 proof.
- **Spending conditions**: locks on a proof, such as P2PK (NUT-11) or HTLC (NUT-14), checked with their witnesses.
- **Fees**: per-input fees of the input keysets (NUT-02); inputs must equal outputs plus fees.
- **Proof states**: Unspent, Pending, Reserved, PendingSpent and Spent. Only Unspent inputs can be spent by a new swap.
- **Other rows of the table**: Unspent inputs with all output signatures present return `BlindedMessageAlreadySigned`; with some present, an error for partially persisted signatures.
- **Replay**: re-applying the same accepted entry, for example after a crash or during catch-up. It recomputes the same shares and stores the same rows.
- **Rollback**: an aborted transaction leaves no writes behind.
- **Public route**: per output index it reads the share row matching this member, B′, keyset and amount (`persisted_swap_share_response`).
