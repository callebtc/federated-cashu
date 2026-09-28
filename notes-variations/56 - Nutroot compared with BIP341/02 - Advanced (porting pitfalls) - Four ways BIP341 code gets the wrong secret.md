# 56.02 · Four ways BIP341 code gets the wrong secret

Variation 2 of slide 56 (Nutroot compared with BIP341) · lens: Advanced: porting pitfalls · deck `fcv-j-nutroot-use` page 21 · 6 steps · script 137 words, about 60 s

## Script

The NUT-10 worked example: K has odd y, one after leaf. Each wrong row applies one BIP341 habit; its secret was computed.

**[1]** Specification: Cashu_NutrootTweak over the 33-byte K and the root, t mod n. The secret is 02d310a4….

**[2]** The x-only K in the tweak preimage, as BIP341 hashes x(P): 029faf21….

**[3]** The BIP341 tag TapTweak: 0371dcff….

**[4]** K lifted to even y, as x-only code does: 03fda2b2….

**[5]** A TapLeaf-style leaf hash, with 0xc0 and a length byte, as the root: 031ced43….

**[6]** Four rules no vector exercises. A tweak at or above n, probability about 3.7·10⁻³⁹, reduces mod n. The tweaked private key is k + t mod n, with no negation first. The control block has no leaf version and no parity bit. Secrets compare as 33 bytes: 02‖x and 03‖x are two secrets, both spendable by one scalar.

## Background

- **x-only key**: a key given by its 32-byte x-coordinate; BIP341 hashes x(P). Nutroot hashes all 33 bytes of K, including the parity byte.
- **lift_x / even y**: BIP340 code turns an x-coordinate into the point with even y. K here starts with 03, odd y; lifting yields 02a3e12c…, a different point.
- **Tag names**: the tag string is hashed into the prefix, so TapTweak and Cashu_NutrootTweak give unrelated tweaks for the same input.
- **TapLeaf-style hash**: hash_TapLeaf(0xc0 ‖ compact_size ‖ script); 0x31 is 49, the leaf length. Nutroot hashes the leaf bytes alone under Cashu_NutrootLeaf.
- **Probability**: (2^256 − n) / 2^256 ≈ 3.7·10⁻³⁹, the chance a SHA-256 output is at or above the curve order.
- **No negation**: BIP341's tweak_seckey negates the private key when the internal key has odd y. Nutroot's secret is the full point K + t·G, so its private key is (k + t) mod n directly.
- **Two secrets per scalar**: key-path signatures verify against the x-coordinate, so 02‖x and 03‖x verify with one scalar while being distinct secrets with separate Y and spent-state entries.

## Speaker note

- The four wrong secrets are computed for the slide, not in the spec. Recomputed each (x-only preimage, TapTweak tag, even-y lift with the correct t, TapLeaf hash as root, each with the rest per spec): all four match. 3.7·10⁻³⁹ also checks.
