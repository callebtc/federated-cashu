# 30.06 · Nonce lifecycle in the FROST key manager

Variation 6 of slide 30 (On-chain melt - intent to broadcast) · lens: Focus: nonce lifecycle · deck `fcv-e-membership-custody` page 40 · 4 steps · script 138 words, about 60 s

## Script

The FROST key manager keeps each signing nonce as a durable record.

**[1]** Generated: the secret nonces exist and are sealed. Reserved: one authorization slot owns the nonce. CommitmentSent: the public commitment may have left this participant.

**[2]** Signing: the hash of the exact signing package is locked, and the secret nonces are removed from storage. ShareProduced: the signature share is cached but not yet marked delivered. Consumed: terminal, and an exact retry returns the cached share.

**[3]** Any non-terminal state can move to Burned, with one of nine reasons, such as Timeout, AmbiguousResponse or RestartRecovery. Burned and Consumed are terminal.

**[4]** The reason: a Schnorr signature is s equals k plus e times x. One nonce k under two challenges gives x equals s₁ minus s₂ over e₁ minus e₂. So uncertainty burns, and a new attempt uses a fresh nonce.

## Background

- **Nonce**: a secret random value used once per signature. In FROST each signer uses a pair of nonces and publishes commitments to them in round one.
- **Authorization slot**: one input of one accepted transaction. A nonce is reserved for exactly one slot.
- **Signing package**: the message, the set of signers and all their nonce commitments, fixed for round two. Its hash is locked so the nonce can only be used with that exact package.
- **Nonce-reuse equation**: with s₁ = k + e₁x and s₂ = k + e₂x (same k, different challenges e), subtracting gives x = (s₁ − s₂)/(e₁ − e₂) mod n. In FROST this reveals the signer's share.
- **Burn reasons**: Aborted, AmbiguousResponse, Timeout, CoordinatorLost, SignerSetChanged, InvalidPackage, RestartRecovery, ReplacedAttempt, InternalFailure (`NonceBurnReason` in `crates/cdk-frost/src/nonce.rs`).
- **Compare-and-swap store**: each state change is written only if the stored record still has the expected revision, so two concurrent attempts cannot both advance the same nonce.
- **Main-slide shorthand**: the main slide's vacant → reserved → published → consumed summarizes these six states.
