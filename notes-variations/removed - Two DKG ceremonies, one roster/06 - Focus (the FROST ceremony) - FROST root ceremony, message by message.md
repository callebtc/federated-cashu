# removed.06 · FROST root ceremony, message by message

Variation 6 of slide removed (Two DKG ceremonies, one roster) · lens: Focus: the FROST ceremony · deck `fcv-e-membership-custody` page 32 · 5 steps · script 136 words, about 60 s

## Script

The FROST root ceremony for three members, message by message.

**[1]** Round 1 is a broadcast on /dkg/frost/round1. Each member sends commitments to its secret polynomial and a proof that it knows the constant term.

**[2]** Round 2 is confidential, on /dkg/frost/round2. Each member sends every other member its polynomial's value at that member's index: six messages for three members.

**[3]** Locally, each member converts the result to the untweaked root and checks its own share against its public verification share.

**[4]** Each member publishes the exact public root bytes on /dkg/frost/confirmations.

**[5]** If all confirmations are equal and the BLS ceremony is complete, the federation activates. Otherwise it aborts.

Each phase state is sealed with AES-256-GCM and persisted before sending. A phase advances only after its outbound batch is acknowledged, so a member that was partitioned still receives every package.

## Background

- **Polynomial commitments**: public points aⱼ·G for each coefficient aⱼ of a member's secret polynomial. They let receivers check round 2 values without learning the polynomial.
- **Proof of knowledge**: a Schnorr signature with the constant term a₀ as the key. It shows the sender knows a₀ and prevents a member from choosing its commitment as a function of others'.
- **Round 2 value fⱼ(i)**: member j's polynomial evaluated at member i's index. Member i's final share is the sum of the values it receives plus its own.
- **Verification share**: the public key of a member's share, sᵢ·G, computable by everyone from the commitments. A member checks that its secret share matches it.
- **AES-256-GCM**: authenticated encryption. Stored phase state is unreadable without the key, and any modification is detected.
- **Persist before send**: the member writes its phase state to disk before sending messages that depend on it, so a crash cannot produce a message the member later forgets.
- **Batch acknowledgement**: a member keeps resending a round's packages until every recipient has acknowledged them, instead of moving on once it has received its own inputs.
