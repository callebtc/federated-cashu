# removed.02 · The private plane: signing, replay, routes

Variation 2 of slide removed (Network topology) · lens: Advanced · deck `fcv-d-flows-dkg` page 12 · 4 steps · script 134 words, about 55 s

## Script

What makes the private plane private.

**[1]** Every request on /federation/v1 is a FederationSignedRequest: version, federation ID, sender, receiver, sequence, kind, body hash, payload, and a Schnorr signature by the sender's identity key from the roster. The signature covers the kind.

**[2]** Replay handling depends on the message class. Effectful DKG messages keep durable replay state. Status, catch-up, readiness and AlephBFT use volatile windows per kind. SubmitOperation has no transport watermark; the operation ID makes retries idempotent.

**[3]** Transport is HTTPS or iroh, with the same routes. DKG traffic refuses plain HTTP except explicit loopback development. Body limits are 1 MiB for DKG and 512 KiB for FROST signing. Public submit routes fail closed while the member lags, catches up or is halted.

**[4]** The routes: operations, AlephBFT, journal, checkpoints, status, config, DKG, FROST DKG and FROST signing.

## Background

- **Identity key**: each member's secp256k1 key, listed in the roster and hashed into the federation ID. The request signature is BIP340 Schnorr over a domain-tagged transcript of version, federation ID, sender, receiver, sequence, kind and body hash.
- **Body hash**: SHA-256 over a domain string and the canonical JSON payload, so the signature covers the payload.
- **Sequence and replay window**: the receiver remembers the sender's sequence numbers and rejects replays. Durable state is stored in the same database transaction as the DKG record, so it survives a restart; volatile windows live in memory.
- **Transport watermark**: a highest-seen sequence number. Operation submissions skip it, because resubmitting the same operation ID is harmless.
- **iroh**: a peer-to-peer library that connects nodes by public key over QUIC; a member address is written iroh://<endpoint-id>.
- **Fail closed**: wallet-facing submit routes return an error unless the member's sync status is healthy and a live AlephBFT session exists.

## Speaker note

- "Every request on /federation/v1 is signed": GET /federation/v1/config is an unsigned public read of the federation config. The POST routes take signed requests (crates/cdk-axum/src/federation.rs).
- The deck note calls the route list complete. The default build also serves /local-status, and feature-gated builds add wallet/transactions/* (federation-bdk) and bark/*, frost/bark/* (federation-bark).
- The plain-HTTP refusal is checked by the sending DKG driver for every member's federation URL and blocks all DKG traffic, not only secret shares.
- The volatile replay windows also cover checkpoint, FROST signing and operator message kinds.
