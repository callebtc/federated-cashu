# 17.06 · Retries and the operation ID

Variation 6 of slide 17 (Operation IDs) · lens: Framing: retry after a lost response · deck `fcv-c-ordering` page 16 · 5 steps · script 138 words, about 60 s

## Script

A retry after a lost response.

**[1]** The wallet sends a swap: inputs P1 and P2, outputs A and B. m1 derives the operation ID op₁, and consensus finalizes it as entry 41.

**[2]** The response is lost. The wallet cannot tell whether the swap was applied.

**[3]** It resends the same bytes. They give the same op₁, which is already entry 41. m1 returns the shares stored for entry 41.

**[4]** If the wallet instead regenerates its outputs, A and C, the bytes change and so does the ID: op₂. Its inputs were spent by entry 41, so op₂ fails at apply with TokenAlreadySpent.

**[5]** A safe retry resends the exact bytes. For a mint, new outputs on the same quote share the conflict key: refused with ConflictingOperation while the first mint is pending, failing at apply once the quote is issued.

## Background

- **Lost response**: the request reached the member and was processed, but the answer did not reach the wallet, for example after a timeout.
- **Idempotent retry**: sending the same request again has the same effect as sending it once. Here the same bytes map to the same operation, whose shares are already stored.
- **Stored shares**: the share rows written at apply, keyed by operation ID and output index. A retry reads them; it does not sign again.
- **`TokenAlreadySpent`**: the apply result when a swap's inputs are already spent by an earlier entry.
- **Conflict key for a mint**: `Mint { quote }`. It is enforced in the pending queue; at finalization a mint entry with a held key is still accepted and then rejected at apply.

## Speaker note

- The slide's step 5 note says a mint with new outputs on the same quote is refused with `ConflictingOperation`. In the code that holds only while the first mint is still pending: the pending key is released at finalization, `prepare_finalized_appends` in `journal.rs` accepts Mint entries despite a held key, and apply then rejects with `IssuedQuote` (`validate_federation_mint_quote_states_for_signing` in `crates/cdk/src/mint/federation/helpers.rs`). In this lost-response scenario the first mint is already finalized, so the regenerated mint would fail at apply with `IssuedQuote`. The script states both cases.
