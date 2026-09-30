# 40 · Condition leaves

2.3 Nutroot secrets · 5 steps · script 122 words, about 50 s

## Script

Nutroot has four leaf types. A leaf is a declarative condition, not a script.

**[1]** threshold: n of the listed keys must sign.

**[2]** after: from a given time on, n of the listed keys must sign. This is the refund case.

**[3]** hashlock: the SHA-256 preimage of a hash, plus n key signatures. This is the HTLC case. Every spendable leaf names at least one key, so a preimage alone never spends.

**[4]** commit: never spendable. It binds external data into the secret, for example an event digest.

**[5]** On the wire, a leaf is bytes: a version, a type, then type-length-value fields. This after leaf is 49 bytes: n = 1, one key, a Unix time. Unknown versions, types or fields make a leaf unsatisfiable.

## Background

- **Declarative**: the leaf states conditions with fixed meanings; there are no opcodes and no stack.
- **TLV**: type–length–value records: a type byte, a two-byte length, then the value.
- **Fail closed**: anything not understood makes the leaf unsatisfiable instead of being skipped.
- **Limits**: fields strictly ascending, body at most 512 bytes; two keys with the same x-coordinate reject, because signatures are checked against x only.
- **1755561600**: 2025-08-19 00:00 UTC.
