# 23 · Distributed key generation

1.4 Keys and membership · 4 steps · script 129 words, about 55 s

## Script

The key shares are generated without a dealer.

**[1]** Each member j samples its own random polynomial fⱼ of degree t − 1.

**[2]** It sends the value fⱼ(i) privately to each member i.

**[3]** Member i adds up what it received. A sum of polynomials is again a polynomial f, and the sum member i holds is exactly f(i): its share.

**[4]** The joint secret k is f(0), the sum of all constant terms. Nobody computes it. The public key K = k·G₂ is published.

Each member also publishes commitments to its coefficients, the coefficients multiplied by G₂, so a receiver can check the value it got. The code calls this PedersenDkg; the commitments are Feldman-style. It runs once per amount. The trusted-dealer setup used in tests ends in the same state.

## Background

- **DKG (distributed key generation)**: the members jointly create a key pair so that each holds a share of the private key and nobody ever knows the whole private key.
- **Dealer**: in plain Shamir sharing, one party knows k and hands out shares. A DKG removes that party.
- **Feldman commitments**: a member publishes Aₗ = aₗ·G₂ for each coefficient aₗ of its polynomial. Receiver i checks fⱼ(i)·G₂ = Σₗ iˡ·Aⱼ,ₗ. This detects a wrong share without revealing the coefficients.
- **Pedersen DKG**: the DKG construction in which every member acts as a dealer of its own random polynomial and the shares are summed.
- **K from the commitments**: K = Σⱼ Aⱼ,₀, the sum of all members' constant-term commitments.
