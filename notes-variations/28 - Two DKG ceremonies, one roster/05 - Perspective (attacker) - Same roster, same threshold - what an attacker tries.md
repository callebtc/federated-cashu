# 28.05 · Same roster, same threshold: what an attacker tries

Variation 5 of slide 28 (Two DKG ceremonies, one roster) · lens: Perspective: attacker · deck `fcv-e-membership-custody` page 31 · 5 steps · script 137 words, about 60 s

## Script

An attacker wants custody weaker than issuance. Five attempts, each rejected by a named check.

**[1]** Run the FROST DKG with threshold 2 while BLS needs 3. Two members could then move reserves that three are needed to issue against. The FROST context copies signature_threshold, and validate_against rejects any difference.

**[2]** Add a participant outside the roster. The participant set must equal the roster, or the ceremony fails with a roster-or-threshold mismatch.

**[3]** Pair a FROST root from another ceremony. FederationDualDkgResult validate requires the same federation, setup authorization, member and ceremony ID on both sides.

**[4]** Send two different packages to one receiver. That is rejected as equivocation, and activation needs byte-identical root confirmations from every configured member.

**[5]** Replay a message into another ceremony or epoch. Every message binds federation, ceremony, root epoch, protocol, ciphersuite, threshold, ordered roster, sender and receiver.

## Background

- **FederationFrostDkgContext**: the struct that fixes the FROST ceremony parameters. Its threshold is copied from the BLS `signature_threshold` and its participants from the roster.
- **validate_against**: compares federation ID, setup authorization, threshold and participant set with the public config; any difference is a `DkgTranscriptMismatch`.
- **FederationDualDkgResult**: one member's BLS result and FROST result together. `validate` requires both to carry the same federation, setup authorization, member ID and ceremony ID.
- **Equivocation**: sending different messages for the same ceremony, message kind, sender and receiver. The second payload is rejected.
- **Byte-identical confirmation**: every member publishes the exact public root bytes it computed; activation requires all of them to be equal.
- **Root epoch**: a version number of the FROST root. It is part of every message, so a message from one epoch is invalid in another.
- **Ciphersuite**: the FROST variant, here `secp256k1_sha256_tr_v1` (secp256k1, SHA-256, Taproot-compatible).
