# 26.07 · What the members sign before activation

Variation 7 of slide 26 (DKG message flow) · lens: Focus: transcript and activation · deck `fcv-d-flows-dkg` page 33 · 4 steps · script 139 words, about 60 s

## Script

What the members sign before activation.

**[1]** The transcript payload binds the setup method, pedersen_dkg; the federation ID and setup authorization; the thresholds n, t and c; member order and identity keys; the keysets with K and every Kᵢ per amount; and the public ceremony, hashes and reveals.

**[2]** The transcript hash is SHA-256 over length-prefixed bytes: a 4-byte length, 32, the domain string cdk-federation-dkg-transcript-v2, then the length of the canonical JSON and the JSON.

**[3]** Each member signs with its identity key, BIP340, 64 bytes. The message is a 4-byte length, 42, the 42-byte domain string, a 4-byte length, 32, and the transcript hash, hashed with SHA-256. All n signatures must verify over the same hash.

**[4]** Then each member sends a signed confirmation of ceremony ID, transcript hash and final config digest. Activation needs all n; no ecash is signed before.

## Background

- **Length prefix**: each field is preceded by its length as a 4-byte big-endian integer (0x00000020 = 32, 0x0000002a = 42), so field boundaries are unambiguous.
- **Domain string**: a fixed, versioned prefix that makes the hash specific to this use; the same bytes hashed for another purpose give a different result.
- **Canonical JSON**: a fixed serialization of the payload, so every member computes the same bytes and the same hash.
- **BIP340**: the Schnorr signature scheme on secp256k1 used by Taproot; signatures are 64 bytes.
- **Final config digest**: a hash of the finalized federation config with the new keysets. Confirming it shows every member will run the same config.
- **Activation**: each member installs the finalized config only after it holds valid confirmations from all members.

## Speaker note

- The signed message is 82 bytes before hashing. The domain strings are v2 on bls-federation; the older bls-federation-bdk-frost branch uses v1 strings.
- The activation confirmation also binds the federation ID, setup authorization and signer.
