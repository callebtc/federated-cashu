# 37.01 · An HTLC, field by field

Variation 1 of slide 37 (Conditions as tags - HTLC (NUT-14)) · lens: Beginner · deck `fcv-g-json-taproot` page 11 · 5 steps · script 132 words, about 55 s

## Script

This is the example HTLC secret from NUT-14. HTLC stands for hash time-locked contract: a lock that opens with a secret value, or with a refund after a deadline.

**[1]** data is a hash: the SHA-256 of a secret 32-byte value called the preimage. Whoever shows the preimage opens the hash lock. NUT-14 gives an example pair: the preimage 00…01 hashes to ec4916dd….

**[2]** pubkeys names the receiver. To spend, the receiver shows the preimage and also signs.

**[3]** locktime is the deadline, in Unix seconds, written as a string. 1689418329 is 15 July 2023, 10:52:09 UTC.

**[4]** refund names the sender, who may sign after the deadline to take the funds back.

**[5]** On a time axis: the receiver can spend at any time, before and after the locktime. The sender can spend only after it.

## Background

- **Hash function, SHA-256**: maps any input to 32 bytes. Given the output, nobody can find an input that produces it; given the input, anyone can check it.
- **Preimage**: the input to the hash. Here exactly 32 bytes, written as 64 hex characters.
- **Hash lock**: the proof opens for whoever reveals a preimage of `data`.
- **Unix time**: seconds since 1 January 1970 UTC. NUT-11 tags store integers as strings, so the locktime is `"1689418329"`.
- **Why the receiver also signs**: with a `pubkeys` tag, knowing the preimage is not enough; the spend is bound to the receiver's key. Without `pubkeys`, the preimage alone spends.
- **Refund**: the sender's pathway, open only after the locktime.

## Speaker note

- The `data` value in the NUT-14 example secret (`02319220…3ca6c50c`) is not SHA-256 of the example preimage `00…01`; NUT-14 gives the pair `ec4916dd…` / `00…01` separately. Do not present the pair as the hash of this secret.
