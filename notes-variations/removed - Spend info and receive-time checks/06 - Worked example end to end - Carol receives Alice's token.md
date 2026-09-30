# removed.06 · Carol receives Alice's token

Variation 6 of slide removed (Spend info and receive-time checks) · lens: Worked example end to end · deck `fcv-i-nutroot-spend` page 32 · 5 steps · script 139 words, about 60 s

## Script

**[1]** Carol receives the V4 vector token: secret 02d310a4…, spend info E = 022f8bde…, and a tree with one after leaf: key 4, time 1755561600.

**[2]** She derives K from E with her static key 3. Zx is the x-coordinate of 3·E. The slot-0 scalar r₀ is SHA-256 over Cashu_P2BK_v1, Zx and 0x00: 7dfb649b…. K = 3·G + r₀·G = 03a3e12c….

**[3]** Check 1: the leaf parses, the root is 9ed9c0b8…, the tweak b3b7846b…. K + t·G = 02d310a4…, the secret. No leaf is hidden.

**[4]** Check 2: she holds the key path, p′ = (3 + r₀ + t) mod n = 31b2e906…. The refund leaf lets Alice, key 4, spend from 2025-08-19. Carol compares that date with her minimum refund horizon.

**[5]** She sweeps P to a seed-derived secret: E is not seed-derivable, and the refund path stays open until the swap.

## Background

- **ECDH**: Zx = x(3·E). Alice computes the same value from her ephemeral private key (key 5 in the vector) and Carol's static public key, since 3·(5·G) = 5·(3·G).
- **Slot 0**: the NUT-28 blinding index of the internal key; leaf keys use slots 1 and up.
- **K = (3 + r₀)·G**: Carol's static key shifted by r₀·G. Only Carol and Alice can compute r₀; only Carol knows 3.
- **p′**: Carol's key-path private key, 3 + r₀ + t mod n.
- **Minimum refund horizon**: how far in the future a refund must unlock for Carol to accept the payment.
- **Sweep**: swap to a secret derived from Carol's seed, which closes Alice's refund path and makes the proof recoverable.
