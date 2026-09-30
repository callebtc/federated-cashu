# 26.03 · Commit, reveal, deliver, sign

Variation 3 of slide 26 (DKG message flow) · lens: Graphical · deck `fcv-d-flows-dkg` page 29 · 4 steps · script 118 words, about 50 s

## Script

Four rounds of one ceremony with three members. Each panel shows one round's messages; the timeline below fills as rounds complete.

**[1]** Commitment round: each member sends every member the SHA-256 hash of its reveal. There is no broadcast channel; each arrow is a separate signed request.

**[2]** Reveal round: once all hashes are in, each member sends every member its coefficient commitments Aⱼ,ₗ, points in G₂.

**[3]** Delivery round: member j sends each member i the private value fⱼ(i). The arrows carry the sender's colour, because every pair gets a different value.

**[4]** Signature round: every member signs the same transcript hash with its identity key. Only when all three signatures are over one hash does the ceremony continue to activation.

## Background

- **Commit–reveal**: first send a hash of the data, later the data. Nobody can change its polynomial after seeing the others' reveals.
- **No broadcast channel**: nothing guarantees that a message sent to all members is the same for everyone. The code sends one signed request per receiver, itself included.
- **Coefficient commitments Aⱼ,ₗ = aⱼ,ₗ·G₂**: public points that let a receiver check its private value.
- **Transcript hash**: SHA-256 over the whole public ceremony. Equal signatures over one hash show that every member saw the same public messages.

## Speaker note

- The page leaves out the readiness barrier before the first round, the activation after the last, and the FROST rounds that run before the ceremony is complete.
