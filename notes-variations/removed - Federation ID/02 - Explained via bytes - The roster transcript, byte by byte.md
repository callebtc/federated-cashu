# removed.02 · The roster transcript, byte by byte

Variation 2 of slide removed (Federation ID) · lens: Explained via bytes · deck `fcv-e-membership-custody` page 4 · 4 steps · script 134 words, about 55 s

## Script

This is the exact byte string that derive_federation_id hashes, for a toy roster of three.

**[1]** The header: a 4-byte length, 0x18, then the 24-byte domain string cdk-federation-roster-v1. Then the 32-byte setup authorization, the hash of the setup proposal every member approved. Then n, t and c as 2-byte integers: 3, 2 and 3.

**[2]** Then each member in ascending ID order: its 2-byte member ID, then the public mint URL, the federation API URL and the 33-byte compressed identity key, each preceded by a 4-byte length. The toy identity keys are 1·G, 2·G and 3·G.

**[3]** SHA-256 over these 357 bytes gives the federation ID, starting c256f6d7.

**[4]** Append .org to m2's public URL. Its length prefix changes from 0x17 to 0x1b, the input grows to 361 bytes, and the ID becomes 83a0f863, unrelated to the first.

## Background

- **Length prefix**: a 4-byte count written before a variable-length field. It makes the encoding unambiguous: without it, "ab" followed by "c" and "a" followed by "bc" would give the same bytes.
- **Big-endian (BE)**: the most significant byte first. The u16 value 3 is `0003`; the u32 length 23 is `00000017`.
- **Domain string**: a fixed label at the start of the hash input, here `cdk-federation-roster-v1`. It makes this hash distinct from every other SHA-256 use in the system, and the `v1` allows a later format change.
- **Setup authorization**: a 32-byte hash of the setup proposal that every enrolled member signed an approval for (in version 1 it equals the proposal hash). It ties the federation ID to that exact approved proposal.
- **Compressed public key**: a secp256k1 point written as 33 bytes: one byte for the parity of y (`02` or `03`) and 32 bytes of x.
- **1·G, 2·G, 3·G**: the generator point G multiplied by 1, 2 and 3. Their private keys are 1, 2 and 3, so they are test keys only; they make the example reproducible.
- **Member order**: members are hashed in ascending member ID, so the result does not depend on the order in which the roster was listed.

## Speaker note

- Both hashes and both byte counts were computed for the slide from the encoding in `crates/cdk-common/src/federation/config.rs` (`derive_federation_id`) over a toy roster (setup authorization 32 × `0x01`, keys 1·G to 3·G). They are not code test vectors. I recomputed them independently: 357 bytes → `c256f6d7…e8c1e412`, 361 bytes → `83a0f863…eca1f293`. Both match the slide.
