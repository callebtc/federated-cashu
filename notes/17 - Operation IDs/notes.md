# 17 · Operation IDs

1.3 Ordering · 3 steps · script 96 words, about 40 s

## Script

The fix starts by naming the exact request.

**[1]** A request becomes an envelope: the federation, the kind of operation, the quote or the inputs, and the outputs. Its SHA-256 hash is the operation ID.

**[2]** A different output set, B and C instead of A and B, is a different envelope, and so a different operation.

**[3]** An exact retry with the same bytes maps to the same operation ID. It joins the existing operation instead of creating a second one.

Signature shares carry the operation ID they belong to. The hashes on the slide are computed live.

## Background

- **SHA-256**: a hash function. Any change to the input produces an unrelated 32-byte output, and two different inputs with the same output cannot be found in practice.
- **Envelope**: the canonical encoding of one request. Canonical means the same request always produces the same bytes, so equal requests get equal IDs.
- **Idempotent retry**: sending the same request twice has the same effect as sending it once.
