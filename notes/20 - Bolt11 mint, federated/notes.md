# 20 · Bolt11 mint, federated

1.3 Ordering · 6 steps · script 131 words, about 55 s

## Script

**[1]** The wallet creates a Bolt11 mint quote on the first healthy member.

**[2]** The quote is ordered through consensus, so every member learns it. The wallet polls until t members return it.

**[3]** The user pays the invoice. A member checks its payment backend when it gets a status request, when the backend reports a payment event, or on a periodic scan.

**[4]** Each observation is itself a consensus item. The quote counts as paid after q observations; here q = 3.

**[5]** The wallet asks all members for the quote status and accepts it once t members return identical responses.

**[6]** The wallet sends the blinded outputs to all members. Each member waits until the quote is paid in its own state. Then the Mint operation is ordered, and each member returns its signature shares.

## Background

- **Bolt11**: the Lightning invoice format (BOLT 11 specification).
- **Payment backend**: the Lightning or on-chain node a member uses to detect payments.
- **Observation**: one member's signed statement that it saw the payment. Requiring q of them prevents one member from declaring an unpaid quote paid.
- **Identical responses from t members**: the wallet does not trust a single member's answer about the quote state.
