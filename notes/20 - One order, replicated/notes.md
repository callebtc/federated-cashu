# 20 · One order, replicated

1.3 Ordering · 4 steps · script 136 words, about 60 s

## Script

The same attack as on the previous slide: the quote paid for two outputs, and each member received a different pair.

**[1]** Members no longer sign what they receive. Each member submits its request into AlephBFT, as it arrived, in no particular order.

**[2]** AlephBFT outputs one order, and every honest member gets the same list: first A and B, then B and C, then C and A.

**[3]** Every member applies the list in that order. The first request uses the quote. The second and third find the quote already used and fail, on every member.

**[4]** Members sign only the outputs of the operation that was applied. A and B get shares from all three members, C gets none. Paid for two, signed two. Each share is bound to its operation, so t can be lower than c.

## Background

- **AlephBFT**: a consensus protocol. Members feed in items in any order; all honest members output the same ordered list.
- **Operation ID**: SHA-256 of the canonical request (federation, kind, quote or inputs, outputs). An exact retry has the same ID and joins the existing operation.
- **Apply**: the deterministic step that executes an ordered operation against the member's database.
- **Conflict key**: for mints and melts, the quote ID. A member refuses to queue a second operation whose key is held by a pending one (`ConflictingOperation`). A conflicting mint that is ordered anyway fails at apply (`IssuedQuote`).
- **Why t < c is safe**: an honest member only returns a share for an operation that consensus accepted, which needs c members.

## Speaker note

- Which request comes first is decided by AlephBFT, not by the wallet. The slide shows [A, B] winning; any one of the three could win, and the other two fail.
