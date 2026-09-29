# removed.07 · Two identities: the exact bytes and the claimed resource

Variation 7 of slide removed (Operation IDs) · lens: Framing: operation ID vs conflict key · deck `fcv-c-ordering` page 17 · 6 steps · script 140 words, about 60 s

## Script

The operation ID names the exact bytes. The conflict key names the resource a request claims.

**[1]** A retry of the same mint: same ID, same key. It joins the existing operation.

**[2]** Two output sets for quote q-7f3a: different IDs, same key. The second is refused with ConflictingOperation while the first is pending, and later fails at apply because the quote is issued.

**[3]** Mints on two different quotes differ in both, so both are ordered.

**[4]** Two swaps of P1 and P2 have no conflict key. Both are ordered; the second fails at apply with TokenAlreadySpent.

**[5]** Payment observations by m1 and m2 have different keys, because the key includes the observer. Both count toward the quorum.

**[6]** Proof Ys are deliberately not conflict keys. Otherwise a faulty member could order an invalid proof with a victim's Y first and lock out its owner.

## Background

- **Conflict key**: a value two different operations must not both claim, such as `Mint { quote }`. A retry with the same ID is not a conflict; it is the same operation.
- **Y**: Y = hash_to_curve(secret), the public identifier of a proof. The mint's spent-proof store is indexed by Y.
- **Payment observation**: one member's consensus item saying it saw the payment for a quote. The quote counts as paid after q distinct observations, so each observer needs its own key.
- **Why Ys are not keys**: the journal finalizer does not verify proof signatures; those are checked at apply. Reserving a Y at ordering would let a member order an invalid proof carrying someone else's Y and permanently exclude the valid owner. The transactional proof store at apply is the spend authority (code comment in `conflict_keys()`, `operation.rs`).

## Speaker note

- Row 2 says the second mint is refused with `ConflictingOperation`. That holds while the first is pending. After finalization the code accepts the Mint entry and apply rejects it with `IssuedQuote` (`journal.rs` `prepare_finalized_appends`; `helpers.rs` `validate_federation_mint_quote_states_for_signing`). The script states both.
