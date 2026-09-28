# 19.06 · State written by one accepted swap

Variation 6 of slide 19 (Federated swap) · lens: Framing: what each member stores · deck `fcv-c-ordering` page 32 · 4 steps · script 139 words, about 60 s

## Script

What one accepted swap writes at each member.

**[1]** A journal entry, FederationJournalEntry: index, operation ID, the exact swap envelope, conflict keys, empty for a swap, the order digests before and after, consensus evidence, and the application state Applied.

**[2]** One share row per output, FederationSignatureShareRecord. It binds the share kᵢ·B′ to the operation ID, the accepted index and the consensus evidence, and records the output index, keyset, amount, the blinded value B′ and this member's ID.

**[3]** In the same transaction, the mint state: P1 and P2 spent, the blinded messages and signatures for A and B, the completed operation with amounts and fee, and Applied.

**[4]** A retry is answered from the share rows. Restore is a readiness-gated read of the same rows. On catch-up a member replays the entry and writes its own rows. Other members' shares are never stored.

## Background

- **Order digest**: a running hash over the log; each entry's digest is computed from the previous digest, the index and the operation ID. Two members with equal digests have the same order.
- **Consensus evidence**: where AlephBFT finalized the item: the session, the global item index, the unit's position in the session's finalized order, and the member and unit index of the unit that carried it.
- **Application state**: the local result of applying the entry: Accepted, Applying, Applied, Failed or Rejected. It is excluded from the order digest.
- **Share row**: this member's partial signature for one output, stored with enough context to answer retries and restores without signing again.
- **Restore (NUT-09)**: a wallet re-requests signatures for outputs it already submitted, for example after losing local state.
- **Shares are not consensus items**: shares go only to the wallet; the log orders operations, not signatures.
