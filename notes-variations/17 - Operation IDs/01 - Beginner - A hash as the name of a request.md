# 17.01 · A hash as the name of a request

Variation 1 of slide 17 (Operation IDs) · lens: Beginner · deck `fcv-c-ordering` page 11 · 4 steps · script 134 words, about 55 s

## Script

A request is a byte string. This page uses a hash of those bytes as the request's name.

**[1]** The request: quote q1 and two blinded outputs, A and B, written as short JSON.

**[2]** SHA-256 is a hash function. It maps any byte string to 32 bytes, and the same input always gives the same output. This request hashes to 8ec8c56a and so on.

**[3]** Change one output from B to C. The hash is unrelated: 505895e0. A different request is a different operation.

**[4]** Send the first bytes again. The hash is 8ec8c56a again, identical to the first. A retry names the same operation.

The strings are shortened, and the hashes are real SHA-256 of these strings. CDK hashes the canonical envelope, which holds the federation ID, the version and the operation, behind a domain tag.

## Background

- **SHA-256**: a hash function with a 32-byte output. Any change to the input gives an unrelated output, and two inputs with the same output cannot be found in practice.
- **Operation**: one request as the federation orders it. Its ID is the hash of its canonical bytes.
- **Canonical encoding**: one fixed byte encoding per request, so equal requests always produce equal bytes and equal IDs.
- **Domain tag**: a fixed string hashed in front of the data, here `cdk-federation-operation-v1`, so a hash computed for this purpose cannot be confused with a hash of the same bytes for another purpose.
- **Retry**: sending the same request again after a failure or timeout. Because the ID repeats, a retry refers to the existing operation instead of creating a new one.

## Speaker note

- The two hashes are SHA-256 of the toy strings shown, computed for the slide and rechecked. They are not operation IDs of real envelopes.
