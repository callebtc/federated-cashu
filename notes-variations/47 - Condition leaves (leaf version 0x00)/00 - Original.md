# 47 · Condition leaves (leaf version 0x00)

Original slide, deck `fcv-h-nutroot-tree` page 18 (main deck slide 47). Same text as `notes/47 - Condition leaves (leaf version 0x00)/notes.md`.

2.3 Nutroot secrets · 5 steps · script 145 words, about 60 s

## Script

A leaf is a declarative record, not a script. This is the after leaf from the vector, 49 bytes.

**[1]** One byte leaf version, 0x00, then one byte leaf type, 0x02 for after. Other versions and unknown types are unsatisfiable.

**[2]** Then field records, each type, two-byte length, value. Field 0x02 is n, the signature threshold, one byte, from 1 up to the number of keys.

**[3]** Field 0x04 holds the keys, 33-byte compressed points, in one record. Two keys with the same x-coordinate reject.

**[4]** Field 0x06 is the time, Unix seconds, minimal big-endian.

**[5]** These exact bytes are the leaf everywhere: in spend info, in the witness, and as hash input.

Four leaf types: threshold, after, hashlock, commit. Commit is never satisfiable; it binds external data. Fields are strictly ascending, unknown fields reject, the body is at most 512 bytes. Every spendable leaf names at least one key.

## Background

- **Declarative**: the leaf states conditions with fixed meanings; there is no program to execute, no opcodes, no stack.
- **Fail closed**: anything not understood makes the leaf unsatisfiable instead of being skipped.
- **Why the same x-coordinate rejects**: signatures are checked against the x-coordinate only, so 02‖x and 03‖x would be the same signer counted twice toward n.
- **1755561600**: 2025-08-19 00:00 UTC.
- **disclosure (field 0x0a)**: optional; mode 0x01 makes the mint publish the exercised witness.
- **"A preimage alone is never spend power"**: a hashlock leaf also requires n key signatures, so learning a published preimage does not let anyone spend.
