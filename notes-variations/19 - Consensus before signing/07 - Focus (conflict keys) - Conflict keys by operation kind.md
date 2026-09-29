# 19.07 · Conflict keys by operation kind

Variation 7 of slide 19 (Consensus before signing) · lens: Focus: conflict keys · deck `fcv-c-ordering` page 25 · 4 steps · script 138 words, about 60 s

## Script

Conflict keys by operation kind. A conflict key is a value two different operations must not both claim.

**[1]** MintQuote locks its quote ID: one request and response per quote. A mint payment observation locks the quote, the observer, and the state or payment ID: one observation per member and state. Mint locks every quote ID in the request: one output set per quote.

**[2]** MeltQuote and Melt lock the quote ID. MeltQuotePayment locks quote, state and observer. KeysetRotation locks the keyset ID.

**[3]** Swap has no conflict key. Its lock is the proof state at apply.

**[4]** Keys are checked at three points. In the mempool, another operation with a held key gets ConflictingOperation. At finalization, a non-mint entry with a held key is stored as Rejected; mints are checked at apply. At apply, a swap with spent inputs gets TokenAlreadySpent.

## Background

- **Quote ID**: the identifier of a mint or melt quote (NUT-04, NUT-05).
- **Observer in the key**: each member's observation of a payment is a separate operation. Including the observer lets q different members' observations coexist while preventing one member from voting twice for the same state.
- **Payment ID variant**: for on-chain mint quotes the key uses the payment ID instead of the state, so each deposit is observed separately.
- **Every quote ID in the request**: a batch mint covers several quotes and locks all of them.
- **KeysetRotation**: the consensus operation that installs a new keyset; one rotation per keyset ID.
- **Spend lock for swaps**: the first applied swap marks its inputs spent; later swaps of the same inputs fail with `TokenAlreadySpent` and end Rejected.
- The table is the Cashu subset of `conflict_keys()` in `crates/cdk-common/src/federation/operation.rs`; on-chain and application operations have further keys.
