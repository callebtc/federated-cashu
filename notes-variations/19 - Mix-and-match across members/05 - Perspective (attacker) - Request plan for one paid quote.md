# 19.05 · Request plan for one paid quote

Variation 5 of slide 19 (Mix-and-match across members) · lens: Perspective: attacker · deck `fcv-c-ordering` page 7 · 5 steps · script 140 words, about 60 s

## Script

The attacker's plan, with n = 3 and t = 2. An honest wallet sends every member one identical body; the attacker sends each a different one.

**[1]** It pays one mint quote for two outputs and blinds three: A, B and C.

**[2]** It sends m1 a mint request for quote q with outputs A and B. Checked against the quote, this request is valid.

**[3]** It sends m2 the outputs B and C, and m3 the outputs C and A. Each member checks only its own request, and each request is valid.

**[4]** It collects the shares. No member has seen another member's request.

**[5]** It groups the shares by output: A from m1 and m3, B from m1 and m2, C from m2 and m3. Each has t = 2, so it interpolates three signatures for a quote that paid for two.

## Background

- **Fan-out**: an honest wallet sends the same request body to every member and combines the answers itself.
- **Blinding**: the wallet multiplies its secret point by a random factor before sending it, so members cannot link the output to the later token.
- **Valid request**: for a mint, the quote is paid and the outputs add up to the quoted amount. Each window of two outputs satisfies this.
- **Interpolation**: combining t shares of one output with Lagrange weights into the full signature k·B′.
- **The only requirement of the attack**: members do not compare requests before signing.
