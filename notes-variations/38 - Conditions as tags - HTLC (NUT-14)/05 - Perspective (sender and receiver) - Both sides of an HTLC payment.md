# 38.05 · Both sides of an HTLC payment

Variation 5 of slide 38 (Conditions as tags - HTLC (NUT-14)) · lens: Perspective: sender and receiver · deck `fcv-g-json-taproot` page 15 · 5 steps · script 139 words, about 60 s

## Script

Sender S, the mint, and receiver R.

**[1]** Both read GET /v1/info. They need NUT-14 support, because a mint without it may treat the proof as anyone-can-spend, and NUT-07 support if S needs the witness later.

**[2]** S locks proofs with data equal to the hash h, pubkeys R, refund S and locktime T, and sends the token to R directly, not through the mint.

**[3]** R swaps the proofs with the preimage and a signature by R. The mint checks the preimage against h, verifies the signature, and returns new proofs.

**[4]** S calls POST /v1/checkstate. The mint answers SPENT, with the witness, which contains the preimage. S now knows the preimage, which is what an atomic swap or a linked Lightning payment needs.

**[5]** If R does not spend before T, S swaps the proofs back with a refund signature after T.

## Background

- **NUT-06 info**: `GET /v1/info` lists the NUTs the mint supports, including `"14"` and `"7"`.
- **NUT-07 state check**: `POST /v1/checkstate` takes a list of Y values and returns each proof's state (`UNSPENT`, `PENDING`, `SPENT`) and, for pre-v3 proofs, the witness used to spend it.
- **Atomic swap**: two HTLCs locked to the same hash. Claiming one reveals the preimage, which lets the other party claim the second.
- **Token transfer**: the locked token travels from S to R outside the mint, for example as a serialized token string.

## Speaker note

- Witness publication through NUT-07 as shown is the pre-v3 behaviour. On keysets `02` and later, NUT-07 returns the witness only for a leaf carrying `disclosure` mode `0x01` (NUT-07, NUT-14 note).
