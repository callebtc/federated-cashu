# 43 · Key path and script path (BIP341, BIP342)

Original slide, deck `fcv-g-json-taproot` page 26 (main deck slide 43). Same text as `notes/43 - Key path and script path (BIP341, BIP342)/notes.md`.

2.2 Taproot · 3 steps · script 142 words, about 60 s

## Script

**[1]** Key path: one 64-byte signature by the tweaked private key q = p + t, with BIP340's parity negation. The tree is never revealed; the spend looks like any single-key spend.

**[2]** Script path, here for script B. The witness contains B's inputs, the script, and a control block. The control block holds the leaf version combined with the parity of Q, the internal key x(P), and the sibling hashes on the path: hash(C), then hash(A). That is 33 bytes plus 32 per level, up to 128 levels.

**[3]** The verifier hashes leaf B, combines it with hash(C), then with hash(A), tweaks x(P) with the result, and compares with Q and the parity bit. Only then does it run script B. Unexecuted scripts stay hidden as hashes. An internal key with no known discrete log, H or H + r·G, disables the key path.

## Background

- **Parity negation**: BIP340 keys have even y. If P + t·G has odd y, the signer uses the negated private key. The parity bit in the control block tells the verifier which case applies.
- **Control block**: the data in a script-path witness that lets the verifier recompute Q from the revealed script.
- **Discrete log**: the private key k of a point k·G. "No known discrete log" means nobody can sign for the key.
- **NUMS point H**: "nothing up my sleeve". H = lift_x(SHA256(G)), a point derived from a hash so that nobody can know its private key. BIP341 recommends H + r·G with a fresh random r, so observers cannot tell that the key path is disabled; revealing r proves it to a chosen verifier.
- **lift_x**: take a 32-byte x-coordinate and return the curve point with that x and even y.
