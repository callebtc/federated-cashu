# removed.02 · Operation ID: construction and rules

Variation 2 of slide removed (Operation IDs) · lens: Advanced · deck `fcv-c-ordering` page 12 · 3 steps · script 136 words, about 60 s

## Script

The operation ID is SHA-256 of a length-prefixed transcript.

**[1]** A 4-byte big-endian length, 27, then the domain tag cdk-federation-operation-v1. Then the payload length, 52, and the payload: canonical JSON with sorted keys. The payload is a toy; b154a1d8 was computed for these bytes.

**[2]** The real payload is the JSON of federation ID, operation and version, with every object's keys sorted. The authorization signature is excluded, so every member derives the same ID. The version must be 6; any other is rejected before hashing. No supplied ID is trusted: admission, signing and catch-up recompute it.

**[3]** Envelopes above 1 MiB are not admitted. Key order in incoming JSON does not change the ID, and a golden vector pins the version 6 encoding. The ID names bytes, not intent; the conflict key relates two output sets for one quote.

## Background

- **Length prefix**: each field is preceded by its length as a 4-byte big-endian integer (`00 00 00 1b` = 27). The concatenation can then be split in only one way, so different field pairs cannot produce the same transcript.
- **Big-endian**: most significant byte first.
- **Canonical JSON with sorted keys**: the envelope is serialized with every object's keys in sorted order, so the same content always gives the same bytes, whatever order a client used.
- **Authorization signature**: the submitting member's signature over the envelope. It differs per member, so it is left out of the ID.
- **Golden vector**: a stored expected encoding; the test `canonical_operation_encoding_matches_v6_golden_vector` fails if the version 6 bytes ever change.
- **1 MiB**: 1024 · 1024 bytes, `FEDERATION_MAX_OPERATION_ENVELOPE_BYTES`, measured on the canonical bytes.
- **Recomputation points**: consensus admission, `FederationAcceptedSigningRequest` for signing, and `CatchUpOperationIdMismatch` in the journal for catch-up.
- **Conflict key**: a value naming the claimed resource, such as the quote ID. Two output sets for one quote have two IDs and the same key.

## Speaker note

- The payload `{"kind":"Mint",...}` is a toy; the real encoding (see the golden vector) uses `"type":"mint"` and includes `federation_id` and `version`. The hash b154a1d8… is computed for the toy bytes and rechecked, not a spec or code vector.
