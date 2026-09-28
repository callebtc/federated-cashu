# 16.07 · How many outputs one quote can yield

Variation 7 of slide 16 (Mix-and-match across members) · lens: Framing: counting shares · deck `fcv-c-ordering` page 9 · 5 steps · script 138 words, about 60 s

## Script

This page counts shares, assuming each member signs at most one request per quote.

**[1]** Each of n members signs one request of w paid outputs: n·w shares.

**[2]** An output needs t shares, so at most the floor of n·w over t outputs complete; the floor rounds down. The main slide, n = 3, t = 2, w = 2, gives 3.

**[3]** n = 4, t = 3, w = 3 is the regression test: 4 outputs for 3 paid.

**[4]** For large w the yield approaches n over t times the paid amount: n = 5, t = 3 with 10 paid gives 16; n = 7, t = 5 gives 14.

**[5]** With ordering, one output set per quote is accepted, so the yield is w, independent of n and t. Cyclic windows reach the bound in every row.

## Background

- **⌊x⌋ (floor)**: round down to the nearest integer. ⌊5·10/3⌋ = ⌊16.7⌋ = 16.
- **Why the bound holds**: the attacker receives n·w shares in total and each completed output uses t of them, so no more than ⌊n·w/t⌋ outputs can complete.
- **Cyclic windows**: member i, counting from 0, signs w consecutive outputs starting at position i·w, wrapping around a list of ⌊n·w/t⌋ outputs. This spreads the shares evenly so that every output gets at least t.
- **Ratio n/t**: ⌊n·w/t⌋ / w tends to n/t as w grows. With n = 5 and t = 3 the attacker approaches 5/3 of the paid amount.
- **Ordered yield**: the conflict key on the quote admits one output set per quote, so exactly w outputs are signed.

## Speaker note

- The bound, the table values and the enumeration were computed for the slide (`vc_calc.py` in the scratchpad), not taken from the code or the spec. They were rechecked and are correct.
