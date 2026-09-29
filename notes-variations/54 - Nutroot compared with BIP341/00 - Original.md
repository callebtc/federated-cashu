# 54 · Nutroot compared with BIP341

Original slide, deck `fcv-j-nutroot-use` page 19 (main deck slide 54). Same text as `notes/54 - Nutroot compared with BIP341/notes.md`.

2.4 Using nutroot · table, no steps · script 88 words, about 40 s

## Script

What nutroot borrows from BIP341 and where it differs. Keys: 32-byte x-only in Bitcoin, 33-byte compressed points in nutroot. The tweak: over x(P) in Bitcoin, over the full K and reduced modulo n in nutroot. Leaves: scripts with opcodes, versus four declarative condition types. Tree shape: chosen by the builder, versus fixed by sorting. Unknown data: Bitcoin reserves it for future upgrades; nutroot rejects it. Signed message: the sighash, versus the transaction digest. The structure is the same, but the keys and values are not interchangeable with Bitcoin's.

## Background

- **x-only key**: a public key given by its x-coordinate only (32 bytes).
- **OP_SUCCESS and the annex**: BIP341 and BIP342 reserve opcodes and a witness field for future soft forks. Nutroot has no such upgrade path: unknown fields fail.
- **Sighash**: the hash of the transaction data a Bitcoin signature commits to.
- **Other differences**: nutroot's control data is K and the path in a JSON witness, not a control block with parity; NUMS keys must be offset by a disclosed u.
