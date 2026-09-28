# 17.03 · Many requests, two operations

Variation 3 of slide 17 (Operation IDs) · lens: Graphical · deck `fcv-c-ordering` page 13 · 4 steps · script 122 words, about 50 s

## Script

Many HTTP requests, two operations.

**[1]** The wallet fans out the same request, outputs A and B, to m1, m2 and m3. The bytes are identical, so all three hash to the same ID, 30cec45b. Three requests, one operation.

**[2]** A retry to m1 carries the same bytes and joins that operation. Four requests, still one operation.

**[3]** An attacker sends m2 outputs B and C for the same quote. Different bytes give a different ID, 6222b53b. That is a second operation.

**[4]** The log gets one entry per operation, not per HTTP request: entry 41 for the first, entry 42 for the second. Both claim the same quote, so only the first is issued. Entry 42 fails at apply because the quote is already issued.

## Background

- **Fan-out**: the wallet sends the same body to every member's public URL.
- **Operation ID**: SHA-256 over the domain tag and the canonical envelope. Identical bytes always give the identical ID.
- **Log entry**: one position in the ordered journal. Each operation ID appears once; duplicates join the existing entry.
- **Why entry 42 reaches the log**: a second mint on the same quote is refused only if it meets the first one in a member's pending queue. Otherwise it is ordered, and for mints the conflict is enforced at apply.

## Speaker note

- 30cec45b… and 6222b53b… are plain SHA-256 of toy JSON strings, computed for the slide, not domain-tagged operation IDs of real envelopes.
- Step 4 puts the attacker's mint in the log as entry 42. On the slide it goes to m2, which also received [A, B]. If [A, B] is still pending at m2, m2 refuses [B, C] with `ConflictingOperation` and it never reaches the log. It becomes entry 42 only if it is submitted where no conflicting operation is pending; then it fails at apply with `IssuedQuote` (`journal.rs` `prepare_finalized_appends`, `helpers.rs`). The script says it fails at apply, which matches the slide's picture.
