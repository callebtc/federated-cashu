# 25 · DKG message flow

1.4 Keys and membership · 7 steps · script 135 words, about 60 s

## Script

The messages of one ceremony.

**[1]** Readiness: every member confirms it runs the same ceremony ID and keyset policy.

**[2]** Commitment: each member first sends a SHA-256 hash of its reveal. No member can then choose its polynomial after seeing the others.

**[3]** Once all hashes are in, members reveal their coefficient commitments in G₂, for every amount.

**[4]** Each member delivers fⱼ(i) point to point, on the private plane.

**[5]** Each receiver checks every value against the sender's commitments and sums its share. K is the sum of the constant-term commitments.

**[6]** Every member signs the public transcript hash with its identity key.

**[7]** Activation: all members confirm the same transcript hash and final config digest. No ecash is signed before activation. The FROST treasury rounds follow.

There is no broadcast channel. Every message is a signed request to every member.

## Background

- **Commit–reveal**: first publish a hash of your data, later publish the data. Others can verify the data matches the hash, and nobody can change their data after seeing others'.
- **Why the commitment round matters**: a member that sees all other contributions first could pick its own polynomial to influence the resulting key.
- **Transcript hash**: a hash over all public messages of the ceremony. Signing it confirms every member saw the same messages.
- **Identity key**: each member's long-term signing key, listed in the roster.
- **No broadcast channel**: nothing guarantees that a message sent to all members is the same for everyone. The transcript signatures and the activation check make every member confirm the same transcript before the keys are used.
