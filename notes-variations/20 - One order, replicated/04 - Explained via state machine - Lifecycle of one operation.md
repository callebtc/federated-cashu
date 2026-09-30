# 20.04 · Lifecycle of one operation

Variation 4 of slide 20 (One order, replicated) · lens: Explained via state machine · deck `fcv-c-ordering` page 22 · 4 steps · script 136 words, about 60 s

## Script

The lifecycle of one operation as a state machine.

**[1]** A submitted operation waits in the mempool, the local queue of operations not yet ordered. A resubmission with the same operation ID joins the pending entry. Another operation with the same conflict key is refused with ConflictingOperation.

**[2]** AlephBFT finalizes the entry at an index i. It becomes Accepted. If it is not a mint and its key is already held by an earlier entry, it is stored as Rejected instead. Mint conflicts are checked at apply.

**[3]** Accepted entries are applied. On success, the state change, the shares and the Applied status commit in one database transaction.

**[4]** Definitive errors, such as TokenAlreadySpent, end Rejected with the error response stored. Other errors end Failed and are retried on replay. Shares are produced only inside apply, never for Rejected entries.

## Background

- **State machine**: a fixed set of states and allowed transitions. Here: pending, finalized, Accepted or Rejected, Applying, then Applied, Rejected or Failed.
- **Mempool**: the member's queue of submitted operations waiting to be ordered. It tracks pending operation IDs and the conflict keys they hold.
- **Finalized at index i**: consensus has fixed the entry's position in the log; it cannot move.
- **Database transaction**: a group of writes that commits completely or not at all.
- **Definitive error**: a deterministic rejection that every member reaches, such as `TokenAlreadySpent`, `TokenPending` or `IssuedQuote`. The stored response is returned on replay and to retries.
- **Failed and replay**: a transient error, such as storage contention, leaves the entry Failed; replay resets it to Accepted and applies it again.
