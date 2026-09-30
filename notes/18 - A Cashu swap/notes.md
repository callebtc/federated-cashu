# 18 · A Cashu swap

1.3 Ordering · 5 steps · script 110 words, about 45 s

## Script

To see the problem, look at what a Cashu swap is.

**[1]** The inputs are tokens the wallet already holds, here two tokens of 4 sats.

**[2]** The outputs are new tokens the mint should sign: blinded, so the mint cannot see them. Here, two new tokens of 4 sats.

**[3]** The wallet can put any outputs into the transaction: other tokens of 4 sats,

**[4]** or a single token of 8. The mint only checks that the amounts add up.

**[5]** So a member that signs on its own cannot know whether another member was just asked to sign different outputs for the same inputs. All members must see transactions in the same order.

## Background

- **Swap (NUT-03)**: exchange existing proofs for new ones of the same total value, minus fees.
- **Blinded outputs**: the mint signs messages it cannot read; that is what keeps Cashu private, and also why a member cannot tell two requests apart by their content.
- **Next slide**: what goes wrong when members sign without a shared order.
