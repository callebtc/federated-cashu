# 17.04 · operation_id() in cdk-common

Variation 4 of slide 17 (Operation IDs) · lens: Explained via code · deck `fcv-c-ordering` page 14 · 4 steps · script 94 words, about 40 s

## Script

operation_id() in cdk-common, file federation/operation.rs. Four parts.

**[1]** ensure_supported_version rejects any envelope whose version is not the current one, 6. Nothing is hashed for an unknown version.

**[2]** unsigned_canonical_bytes serializes a struct with three fields: version, federation ID and operation. canonical_json_bytes sorts every object's keys. The authorization signature is not in this struct, so it does not affect the ID.

**[3]** operation_id_from_canonical builds a transcript. append_hash_bytes writes the value's length as a 4-byte big-endian integer, then the value. It appends the domain tag cdk-federation-operation-v1, then the canonical bytes.

**[4]** The SHA-256 of that transcript is the 32-byte FederationOperationId.

## Background

- **`FEDERATION_OPERATION_VERSION`**: the envelope format version, currently 6. A mismatch returns `OperationVersionMismatch`.
- **`canonical_json_bytes`**: converts the value to JSON, sorts the keys of every object recursively, and writes compact bytes.
- **Authorization signature**: the submitting member's signature over the unsigned envelope. It is checked separately; it is excluded from the ID so that every member wrapping the same request gets the same ID.
- **`append_hash_bytes`**: writes `len as u32` in big-endian, then the bytes. Length prefixes make the concatenation unambiguous.
- **Domain tag**: the constant `FEDERATION_OPERATION_HASH_VERSION = b"cdk-federation-operation-v1"`, 27 bytes. It separates operation IDs from any other SHA-256 use.
- **SHA-256**: 32-byte hash; `Sha256Hash::hash` from the `bitcoin` hashes crate.
