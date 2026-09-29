# removed.03 · Who can move the reserves

Variation 3 of slide removed (Funding backends) · lens: Graphical · deck `fcv-e-membership-custody` page 21 · 3 steps · script 113 words, about 50 s

## Script

Three lanes, five members.

**[1]** The top lane is issuing ecash. Any three of the five members produce a signature; here m1, m3 and m4.

**[2]** The middle lane is reserves held in one Lightning or on-chain node. The five members are greyed out. The node holds one key, and whoever controls that key moves the reserves. The three-of-five rule from the top lane does not apply to it.

**[3]** The bottom lane is reserves under FROST. Each member holds a key share, s₁ to s₅. The same three-of-five rule applies: m1, m3 and m4 together produce one Schnorr signature for a Bitcoin transaction. Issuance and custody now use the same members and the same threshold.

## Background

- **3 of 5**: a threshold of t = 3 in a federation of n = 5. Any three members can act; two cannot.
- **Single node custody**: a Lightning or on-chain node controlled by one private key. Its operator can spend without any other member.
- **Key share sᵢ**: member i's share of the treasury private key from the FROST DKG. No member holds the full key.
- **Schnorr signature**: the BIP340 signature scheme used by Taproot. A FROST signature by three members is one ordinary 64-byte Schnorr signature.
