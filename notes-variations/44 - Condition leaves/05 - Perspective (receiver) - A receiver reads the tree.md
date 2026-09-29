# 44.05 · A receiver reads the tree

Variation 5 of slide 44 (Condition leaves) · lens: Perspective: receiver · deck `fcv-h-nutroot-tree` page 23 · 5 steps · script 138 words, about 60 s

## Script

The three-leaf vector, read by the receiver who holds key 3. Each line says who can spend, and from when.

**[1]** Key path. K is 03a3e12c…. The receiver derives it from its static key 3 and the sender's ephemeral key E, and it must match any disclosed K. The key path belongs to the receiver.

**[2]** threshold, n = 1, key 3: a leaf the receiver satisfies alone.

**[3]** after, n = 1, key 4: the sender's refund key can spend from 2025-08-19, 00:00 UTC. From that date both parties can spend.

**[4]** hashlock, n = 1, key 3: the receiver's only with the preimage of a1…a1.

**[5]** Acceptance: the tree must reproduce the secret, which is check 1, and the refund date must leave enough time under the receiver's policy. Then the receiver sweeps to seed-derived secrets before key 4 can spend.

## Background

- **Static key and E (NUT-28)**: the sender blinds the receiver's static key with an ephemeral key E. The receiver computes the same blinding from its private key and E. A derived K that differs from a disclosed K rejects.
- **Check 1 and check 2**: check 1, the spend info reconstructs the secret; check 2, the wallet can spend the proof and every disclosed leaf passes its acceptance policy.
- **Refund horizon**: how far in the future a refund leaf unlocks. A receiver can reject a proof whose sender could reclaim it too soon.
- **Sweep**: swap the received proof for new proofs on the receiver's own seed-derived secrets, so the after leaf no longer applies.
- **Hashlock**: needs a preimage of the hash plus a signature by key 3.

## Speaker note

- The vector time 2025-08-19 is in the past at the talk date. A real receiver with a refund-horizon policy would reject a proof with this after leaf, because key 4 can spend immediately. Present it as the vector's scenario.
- The three-leaf vector gives only K; the derivation of `03a3e12c…` from static key 3 and E (key 5) comes from the receiver-keyed worked example, which uses the same K.
