# 23 · How do we generate keyshares

Question slide, no steps · script 57 words, about 25 s

## Script

How do we generate key shares without any one member ever knowing the aggregate key? If one party generated the key and handed out shares, that party would know the key, and the whole federation would depend on it. The next slides show how the members create the shares together, so the full key never exists anywhere.

## Background

- **Trusted dealer**: a single party that creates the key and distributes shares; simple, but that party knows the key.
- **DKG (distributed key generation)**: every member contributes randomness; the shares add up to a key nobody computes.
