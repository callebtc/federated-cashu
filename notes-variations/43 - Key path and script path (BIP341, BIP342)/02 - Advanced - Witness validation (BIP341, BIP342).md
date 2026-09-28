# 43.02 · Witness validation (BIP341, BIP342)

Variation 2 of slide 43 (Key path and script path (BIP341, BIP342)) · lens: Advanced · deck `fcv-g-json-taproot` page 28 · 5 steps · script 139 words, about 60 s

## Script

BIP341 witness validation.

**[1]** No witness elements: fail. With two or more, if the last starts with 0x50, it is the annex and is removed.

**[2]** One element left: key path. 64 bytes is a signature with SIGHASH_DEFAULT. At 65 bytes the last byte is the hash type, and 0x00 is invalid there. BIP340 verifies it against the output key.

**[3]** Two or more: script path. The control block is 33 + 32m bytes, m at most 128; p must lift to a point. The verifier hashes the leaf, folds in each path hash smaller first, rejects t ≥ n, and checks x(Q) and parity.

**[4]** Leaf version 0xc0 runs BIP342 tapscript: OP_SUCCESS opcodes succeed; CHECKSIGADD replaces CHECKMULTISIG; MINIMALIF is consensus; a sigops budget; stack limits; one true element at the end.

**[5]** Other leaf versions succeed without further rules, reserved for soft forks.

## Background

- **Annex**: an optional last witness element starting with 0x50, reserved for future use and covered by the signature.
- **SIGHASH_DEFAULT (0x00)**: signs the whole transaction like SIGHASH_ALL, with a 64-byte signature. A 65th byte selects another hash type. 0x00 there is invalid, so a third party cannot turn a 64-byte signature into a 65-byte one and change the transaction's wtxid and fee rate.
- **Leaf version**: `c[0] & 0xfe`; the low bit is the parity of y(Q).
- **OP_SUCCESSx**: a set of reserved opcodes; if one appears, the script succeeds, so future soft forks can give them meaning.
- **OP_CHECKSIGADD**: adds 1 to a counter for each valid signature; it replaces OP_CHECKMULTISIG, which cannot be batch-verified.
- **MINIMALIF**: the argument to OP_IF / OP_NOTIF must be exactly empty or exactly 0x01. It is only a standardness rule in P2WSH.
- **Sigops budget**: 50 plus the witness size in bytes; each signature opcode with a non-empty signature costs 50.
- **Stack limits**: at most 1000 elements on stack and altstack together, each at most 520 bytes.
- **Unknown leaf versions**: validation succeeds, so a soft fork can later assign rules to them.
