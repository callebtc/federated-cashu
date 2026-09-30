# 31 · Proof rewriting by a Byzantine member

1.6 Client intent · 4 steps · script 118 words, about 50 s

## Script

This attack follows from the fan-out.

**[1]** The wallet sends its swap to every member, so every member sees the bearer proofs: the secret x and the signature C.

**[2]** A Byzantine member, m3, builds a swap of the same inputs to its own outputs X and Y, and submits it first.

**[3]** Consensus orders m3's swap first and applies it. The wallet's swap fails, because its inputs are already spent.

**[4]** The shares for X and Y are valid. A bearer proof today carries no witness, so nothing binds it to the owner's outputs.

This was reported in a security audit. The DKG protects the mint key, not the users' bearer secrets, and consensus picks one operation, not necessarily the owner's.

## Background

- **Bearer proof**: a token (x, C) that anyone who holds it can spend.
- **Witness**: extra data that proves the right to spend a proof, typically a signature.
- **Fan-out**: the wallet sends the same request to all members, so all of them see its contents.

## Speaker note

- The audit finding is SEC-2026-07-17-01 and is open. On `bls-federation`, federated keysets already use v3 IDs, but secrets still follow the old string rules, so the attack applies to the branch as it is.
