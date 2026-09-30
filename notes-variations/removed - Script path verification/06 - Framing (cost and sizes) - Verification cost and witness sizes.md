# removed.06 · Verification cost and witness sizes

Variation 6 of slide removed (Script path verification) · lens: Framing: cost and sizes · deck `fcv-i-nutroot-spend` page 16 · 3 steps · script 139 words, about 60 s

## Script

**[1]** A leaf body is at most 512 bytes, so a leaf is at most 513 bytes and lists at most 15 keys. A tree has at most 8 leaves, so a path has at most 3 hashes. That limits a tree to 120 leaf keys, inside NUT-28's 255 slots. A preimage is at most 32 bytes, and signatures never outnumber listed keys.

**[2]** Per script-path input, the verifier does one length check; at most five tagged hashes, one scalar multiplication t·G and one point addition; one pass over at most 513 bytes; at most one SHA-256, then BIP-340 checks against the listed keys.

**[3]** Computed witness lengths: key path 147 characters, Alice's refund leaf 350, a hashlock leaf with two path hashes and a preimage 617, and a 15-key threshold leaf with three path hashes about 3300. All stay under 4096.

## Background

- **15 keys**: the keys record is a 3-byte header plus 33 bytes per key. With the type byte and the n record, 15 keys fit in a 512-byte body and 16 do not.
- **120 leaf keys**: 8 leaves × 15 keys.
- **NUT-28's 255 slots**: the blinding slot index is one byte; slot 0 is the internal key, leaving 255 for leaf keys.
- **Five tagged hashes**: one leaf hash, up to three branch hashes, one tweak.
- **Scalar multiplication**: computing t·G, the most expensive part of the commitment check; there is exactly one per input.
- **Compact JSON**: the witness string without whitespace, hex-encoded values.

## Speaker note

- All lengths are computed for the slide, not spec vectors. I reproduced 147, 350, 617 and 3302. The 3302 case is a 15-key threshold leaf with disclosure (508-byte leaf), 3 path hashes and 15 signatures. A 513-byte leaf (for example an after leaf with 15 keys and a 6-byte time) gives 3312 by the same count, so "largest valid" on the slide is slightly low. Both are under 4096, which the spec states for every valid witness. The script says "about 3300".
- The witness does not say which signature belongs to which key, and the spec does not define the matching. Trying every pair costs at most 15 × 15 = 225 BIP-340 verifications (my arithmetic, not a spec statement). Avoid calling it "a few signature checks".
