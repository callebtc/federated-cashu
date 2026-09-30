# 25.06 · Reveals without a prior hash round

Variation 6 of slide 25 (DKG message flow) · lens: Framing: failure mode · deck `fcv-d-flows-dkg` page 32 · 4 steps · script 136 words, about 60 s

## Script

The page removes the hash round to show why it exists. Toy group: powers of 4 modulo 107.

**[1]** m1 and m2 reveal first: A₁,₀ = 42 and A₂,₀ = 16. K is the product of the three constant commitments, so K = 30 times A₃,₀.

**[2]** m3 has not revealed. It computes K for candidate constant terms a₃,₀ from 1 to 6: 13, 52, 101, 83, 11 and 44.

**[3]** It keeps a candidate that gives K a property it wants, here an even K: a₃,₀ = 2, K = 52. It still delivers valid shares, because it knows its own polynomial.

**[4]** With the hash round, H₃, the hash of m3's reveal, is published before any reveal is sent. Choosing a₃,₀ after seeing 42 and 16 changes the reveal, which is then rejected as a reveal hash mismatch.

## Background

- **Last mover**: the member whose contribution comes last. Without a prior commitment it sees every other contribution and can choose its own to steer the result.
- **Biasing K**: the attacker cannot choose K exactly, but it can try many candidates and keep one with a property it can test, such as a bit pattern. "Even" is only the toy stand-in.
- **Commit–reveal**: first send the SHA-256 hash of the data, later send the data. Receivers check the data against the hash, so nobody can change their data after seeing others'.
- **K = Πⱼ Aⱼ,₀** in the toy group, K = Σⱼ Aⱼ,₀ on the curve: the public key is the combination of all constant-term commitments.

## Speaker note

- Toy numbers computed for the slide. Candidates 2 and 6 both give an even K (52 and 44); the slide picks 2.
- Q&A: the hash round fixes each polynomial, but a member that sees the others' reveals before sending its own can still withhold its reveal. The driver then times out, and recovery needs a new setup and ceremony. That gives it a choice between the current K and a fresh one, not a free choice of K.
