# 40.02 · Malformed, unsatisfiable, inert

Variation 2 of slide 40 (Condition leaves) · lens: Advanced · deck `fcv-h-nutroot-tree` page 20 · 4 steps · script 139 words, about 60 s

## Script

**[1]** Malformed: reject. An unknown field type, every odd type included; a known field on the wrong leaf type; fields not strictly ascending; n of zero or above the key count; no key, an invalid point, or a shared x-coordinate; a body over 512 bytes; disclosure other than 0a000101; a non-minimal integer; time above 2⁵³ − 1.

**[2]** Unsatisfiable: the path is disabled. A version other than 00, a type of 0x05 or above, or a commit leaf revealed in a witness. The commitment still verifies.

**[3]** Inert: a commit leaf in a receiver's tree parses and grants nothing. The mint sees it only as a sibling hash.

**[4]** Where the verdict lands. The mint parses the one revealed leaf and fails closed. The receiver, at check 1, requires every disclosed leaf to parse; an unknown version, type or field rejects the proof.

## Background

- **Fail closed**: anything the verifier does not understand counts against the spend. Nothing unknown is skipped.
- **Odd field types**: reserved for a possible future class of ignorable annotations. Until that class is defined, an odd field is unknown and rejects.
- **Minimal integers**: integers are big-endian with no leading zero byte; zero encodes as zero bytes. A leading zero is non-canonical and rejects, so each value has one encoding.
- **2⁵³ − 1**: the upper bound on `time`, 9007199254740991, the largest integer a 64-bit floating-point number represents exactly.
- **Same x-coordinate**: signatures verify against x only, so `02‖x` and `03‖x` would be one signer counted twice toward n.
- **Unsatisfiable versus malformed**: an unknown leaf type disables only that path of that proof at the mint. The vector with a type 0x05 leaf beside an after leaf still verifies the commitment, and the after leaf still spends.
- **Why the receiver is stricter**: check 1 decides whether to accept value. A leaf the receiver cannot parse may be spend power it cannot evaluate, so the proof is refused.
