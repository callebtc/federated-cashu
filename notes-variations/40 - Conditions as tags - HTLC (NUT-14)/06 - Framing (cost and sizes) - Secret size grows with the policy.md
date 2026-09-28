# 40.06 · Secret size grows with the policy

Variation 6 of slide 40 (Conditions as tags - HTLC (NUT-14)) · lens: Framing: cost and sizes · deck `fcv-g-json-taproot` page 16 · 4 steps · script 127 words, about 55 s

## Script

Length of Proof.secret in characters, for the examples in the specs.

**[1]** A plain NUT-00 secret is 32 random bytes in hex: 64 characters. The NUT-11 P2PK example with one key: 195.

**[2]** The NUT-14 HTLC with one receiver key, a locktime and one refund key: 323.

**[3]** The NUT-11 complex example, 2-of-3 plus two refund keys: 500. The NUT-14 complex HTLC, three receiver keys plus two refund keys: 567. Each key adds 66 hex characters plus quotes and a comma.

**[4]** A v3 nutroot secret is a 33-byte point, 66 hex characters, whatever the policy. For JSON secrets the witness adds 128 hex characters per signature and 64 per preimage, and the whole policy is sent and revealed on every spend. CDK rejects secrets and witnesses longer than 1024 characters.

## Background

- **Hex characters**: two per byte. A 33-byte compressed key is 66 characters; a 64-byte signature 128; a 32-byte preimage 64.
- **Nutroot secret (v3)**: a compressed secp256k1 point that commits to all conditions through a tweak (NUT-10). Its size does not depend on the policy.
- **CDK limit**: `MAX_PROOF_CONTENT_LEN = 1024` in `crates/cdk/src/mint/verification.rs`, applied to the secret and to the serialized witness of every input.
- **Per-spend cost**: the full JSON secret and witness travel with every spend request and are visible to the mint.

## Speaker note

- The lengths are computed from the spec examples in compact JSON (no whitespace); the specs print them pretty-printed. Recomputed: 195, 323, 500, 567 match.
