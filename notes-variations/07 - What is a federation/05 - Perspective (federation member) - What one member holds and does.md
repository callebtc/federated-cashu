# 07.05 · What one member holds and does

Variation 5 of slide 07 (What is a federation) · lens: Perspective: federation member · deck `fcv-a-bls` page 7 · 4 steps · script 139 words, about 60 s

## Script

**[1]** A member holds a BLS key share kᵢ per amount, with public share Kᵢ = kᵢ·G₂ in the public config; a secp256k1 identity key that authenticates its messages to other members; and the public config: roster, n, t, c and the aggregate keys K.

**[2]** `public_mint_url` is the ordinary Cashu API for wallets. `federation_api_url` carries envelopes, consensus messages and catch-up for the other members.

**[3]** It returns a share only when the operation is accepted in the consensus order and it has applied it, verifying inputs against K and marking them spent. The share covers only that operation's outputs: C′ᵢ = kᵢ·B′.

**[4]** Alone, at n = 5, it can verify any v3 proof with K and any member's share with Kⱼ. It cannot sign, t = 3, commit an operation, c = 4, or mark a quote paid, q ≥ 4.

## Background

- **Key share kᵢ**: member i's point on a secret polynomial whose value at 0 is the signing key k. One share exists per amount, because each amount has its own key.
- **Public share Kᵢ = kᵢ·G₂**: published so anyone can check that member's signature shares with e(C′ᵢ, G₂) = e(B′, Kᵢ).
- **Aggregate key K**: the public key of the whole federation for one amount, K = k·G₂. Proofs verify against it like against any v3 key.
- **Identity key**: a secp256k1 key pair per member, listed in the public config, used to authenticate traffic between members. It is separate from the BLS shares.
- **Catch-up**: a member that fell behind verifies a quorum-signed checkpoint, fetches the missing part of the operation history from peers in bounded pages, replays it deterministically, and serves signing routes only after it has reached the checkpoint.
- **Why a member can verify alone**: v3 verification is a pairing check with public keys. No private key is needed.

## Speaker note

- "Catch-up" on this slide means the current checkpoint-based recovery (`bls-federation:docs/federated-cashu-checkpoint-architecture.md`). Range-based catch-up certificates are superseded; if asked, describe quorum-signed checkpoints.
