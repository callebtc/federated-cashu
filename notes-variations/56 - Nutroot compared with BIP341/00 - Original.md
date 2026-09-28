# 56 · Nutroot compared with BIP341

Original slide, deck `fcv-j-nutroot-use` page 19 (main deck slide 56). Same text as `notes/56 - Nutroot compared with BIP341/notes.md`.

2.4 Using nutroot · table, no steps · script 144 words, about 60 s

## Script

What nutroot borrows from BIP341 and where it differs. Keys: 32-byte x-only output keys, versus 33-byte compressed secrets with signatures checked against x. The tweak: BIP341 hashes x(P) and rejects a tweak at or above the curve order; nutroot hashes the full K and reduces mod n. Leaves: tapscript with opcodes and a stack, versus declarative TLV records. Tree shape: chosen per leaf with depth up to 128, versus fixed by the sorted fold with at most 8 leaves. Control: leaf version, parity, x(P) and path, versus K and path in the JSON witness. Unknown data: Bitcoin keeps upgrade paths through OP_SUCCESS and the annex; nutroot rejects unknown fields. NUMS: suggested H + r·G, versus required H + u·G with u disclosed. Signed message: the sighash, versus the input digest. The commitment structure is borrowed; the keys and values are not interchangeable with Bitcoin's.

## Background

- **OP_SUCCESS**: reserved tapscript opcodes that make a script succeed immediately, reserved for future soft forks.
- **Annex**: an optional witness field reserved in BIP341 for future use.
- **Not interchangeable**: different tags, a different tweak input, and a different signed message, so a nutroot key or signature has no meaning on Bitcoin and vice versa.
