# 42.06 · Rejection vectors

Variation 6 of slide 42 (Condition leaves) · lens: Framing: what fails and why · deck `fcv-h-nutroot-tree` page 24 · 5 steps · script 139 words, about 60 s

## Script

Rejection vectors from the spec. Most start from threshold_1of1_key3; the failing bytes are highlighted.

**[1]** leaf_unknown_field appends field 09, four bytes, deadbeef. 0x09 is odd. Odd types are reserved and none is allocated, so the field is unknown and the leaf is malformed.

**[2]** disclosure has one valid encoding, 0a000101. Mode 00, an empty value, or the unallocated mode 02 each make the leaf malformed.

**[3]** leaf_0_unknown_type has type 0x05. It is unsatisfiable: a witness revealing it is rejected, although its commitment verifies. Only its path is disabled.

**[4]** A commit leaf revealed in a witness is rejected. It has no satisfaction rule and is never a spend path.

**[5]** Signature lists are bounded. A key-path witness has exactly one entry; a script-path witness has at most as many entries as the leaf lists keys. Listing a valid signature twice makes the witness invalid.

## Background

- **Malformed**: the leaf violates the encoding and is rejected wherever it is parsed: by the mint when revealed, by the receiver at check 1.
- **Unsatisfiable**: the leaf parses as far as needed, but no witness can satisfy it; only that spend path is lost.
- **Odd field types**: reserved for a possible future ignorable-annotation class; until it is defined they are unknown.
- **Why disclosure has one encoding**: private leaves then have one serialization, and other modes stay reserved for future policies.
- **leaf_0_unknown_type**: from the two-leaf vector under internal key 6. Its sibling, an after leaf for key 3, is spendable once its time passes.
- **Distinct keys**: Schnorr signatures are randomized, so thresholds count distinct listed keys with a valid signature, not signature entries.
