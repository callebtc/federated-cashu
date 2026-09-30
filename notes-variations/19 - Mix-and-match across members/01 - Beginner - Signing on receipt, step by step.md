# 19.01 · Signing on receipt, step by step

Variation 1 of slide 19 (Mix-and-match across members) · lens: Beginner · deck `fcv-c-ordering` page 3 · 5 steps · script 136 words, about 60 s

## Script

Three members, n = 3. A signature needs t = 2 shares. A share is one member's partial signature on one output.

**[1]** The wallet has paid a mint quote for two outputs. It blinds three outputs: A, B and C.

**[2]** It asks m1 to sign A and B. m1 checks the request against the quote: two outputs, quote paid. The check passes, and m1 returns two shares.

**[3]** It asks m2 to sign B and C. The same check passes. B now has two shares, which is a complete signature.

**[4]** It asks m3 to sign C and A. The check passes again. A and C now also have two shares each.

**[5]** Every output has t = 2 shares, so the wallet completes three signatures for a quote that paid for two. Every member did its job correctly.

## Background

- **Mint quote (NUT-04)**: the wallet asks to mint an amount and receives a Lightning invoice. After payment it submits blinded outputs worth that amount and receives signatures on them.
- **Blinded output**: the value B′ the wallet wants signed. The member cannot see which token it belongs to.
- **n and t**: n is the number of members; t is how many members' shares are needed for one complete signature.
- **Share**: one member's partial signature on one output, C′ᵢ = kᵢ·B′. Any t shares on the same output combine into the full signature.
- **Signing on receipt**: a member returns shares as soon as its own check passes, without comparing the request with what other members received. This is the behaviour the page shows to be unsafe.
