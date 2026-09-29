# 45.04 · A leaf parser, step by step

Variation 4 of slide 45 (Condition leaves) · lens: Explained via a parser · deck `fcv-h-nutroot-tree` page 22 · 6 steps · script 139 words, about 60 s

## Script

A parser sketch over the hashlock leaf, 77 bytes. The verdicts follow NUT-10; the order of checks is illustrative.

**[1]** Byte 0 is the version. Anything but 00 is unsatisfiable.

**[2]** Byte 1 is the type, here 03, hashlock. A type outside 1 to 4 is unsatisfiable. A body over 512 bytes is malformed.

**[3]** The record loop reads a type and a two-byte length. The type must be greater than the previous one and allowed for this leaf type, and the value must fit in the remaining bytes; otherwise the leaf is malformed. First record: n = 1.

**[4]** Second record: keys, 33 bytes, key 3.

**[5]** Third record: hash, 32 bytes of a1.

**[6]** Then the value checks: n at most the number of keys, a valid point, a 32-byte hash. The leaf is valid: key 3 signs, with the preimage of a1…a1.

## Background

- **`ALLOWED[kind]`**: the fields each leaf type may carry. threshold: n, keys, disclosure. after: n, keys, time, disclosure. hashlock: n, keys, hash, disclosure. commit: hash only.
- **`typ <= last`**: enforces strictly ascending field types, which also forbids a repeated field.
- **Bounds check**: `i + 3 + ln > len(b)` catches a length that runs past the end of the leaf.
- **Body**: the bytes after the version byte, `len(b) - 1`; at most 512.
- **`check_values`**: the per-field rules: n from 1 to the number of keys, every key a valid point with no shared x-coordinate, hash exactly 32 bytes, disclosure exactly mode 0x01, integers minimal, required fields present.
- **Preimage**: the hashlock is satisfied by a value whose SHA-256 equals the hash field, at most 32 bytes, together with n signatures.
