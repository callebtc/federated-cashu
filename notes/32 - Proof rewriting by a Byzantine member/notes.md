# 32 · Proof rewriting by a Byzantine member

1.6 Client intent · 4 steps · script 115 words, about 50 s

## Script

This attack follows from the fan-out.

**[1]** The wallet sends its swap to every member, so every member sees the bearer proofs: the secret x and the signature C.

**[2]** A Byzantine member, m3, builds a swap of the same inputs to its own outputs X and Y, and submits it first.

**[3]** Consensus orders m3's swap as operation 57 and applies it. The wallet's swap, 58, fails with TokenAlreadySpent.

**[4]** The shares for X and Y are valid. A pre-v3 bearer proof carries no witness, so nothing binds it to the owner's outputs.

This was reported in audit SEC-2026-07-17-01. DKG protects the mint key k, not the users' bearer secrets. Consensus picks one operation, not necessarily the owner's.

## Background

- **Bearer proof**: a token (x, C) that anyone who holds it can spend.
- **Witness**: extra data that proves the right to spend a proof, typically a signature.
- **Why a single mint is not affected the same way**: with one operator, the operator is the party the user already trusts with every proof. In a federation, a single member receiving the proofs is not supposed to be able to act alone.

## Speaker note

- "Pre-v3" here means proofs without the nuts#443 rules (point secrets, transcript witnesses). On `bls-federation` the federated keysets already have v3 (BLS, `02`) IDs and other versions are rejected (`InvalidFederatedKeysetVersion` in `cdk-common/src/federation.rs`), but secrets still follow the old string rules, so the attack applies to the branch as it is. The audit finding is open.
