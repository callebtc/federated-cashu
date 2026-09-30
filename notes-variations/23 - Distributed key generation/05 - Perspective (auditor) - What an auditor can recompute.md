# 23.05 · What an auditor can recompute

Variation 5 of slide 23 (Distributed key generation) · lens: Perspective: auditor · deck `fcv-d-flows-dkg` page 23 · 4 steps · script 137 words, about 60 s

## Script

An auditor holds only the public ceremony record. Toy group: powers of 4 modulo 107, written multiplicatively; a product stands for a sum of points.

**[1]** The record has three 32-byte hashes. The auditor hashes each reveal and compares it with the hash that member sent before.

**[2]** The key K is the product of the constant-term commitments: 42 times 16 times 64 is 101 modulo 107.

**[3]** Each public share follows from the reveals alone. For m2, each sender's constant commitment is multiplied by its linear commitment squared, for x = 2. The factors 30, 44 and 34 give K₂ = 47.

**[4]** The transcript hash recomputes, and 3 Schnorr signatures verify under the roster's identity keys. Not in the record: the private values, the shares and any coefficient. A member signs only after its own deliveries passed the check.

## Background

- **Public ceremony record**: the signed setup transcript, carried in the public federation config as an optional field documented as being for audit, and validated when the config is imported.
- **Multiplicative notation**: in the toy group, g^a stands for a·G₂, a product of group elements for a sum of points, and a power for multiplication by a scalar.
- **K₂ = Πⱼ Aⱼ,₀ · Aⱼ,₁^2**: the commitments of each sender evaluated at x = 2. Additively: K₂ = Σⱼ (Aⱼ,₀ + 2·Aⱼ,₁).
- **Transcript signatures**: BIP340 Schnorr signatures by each member's secp256k1 identity key over the transcript hash. The keys are in the roster.
- **Why the private checks are not auditable**: the values fⱼ(i) are secret, so only receiver i can check them. Its transcript signature, given after it derived and checked its share, is the evidence.

## Speaker note

- All record values (42, 16, 64, 101, 57, 47, 35, …) are toy values computed for the slide, not test vectors.
