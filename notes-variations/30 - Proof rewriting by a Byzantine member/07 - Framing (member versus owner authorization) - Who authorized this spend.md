# 30.07 · Who authorized this spend

Variation 7 of slide 30 (Proof rewriting by a Byzantine member) · lens: Framing: member versus owner authorization · deck `fcv-f-client-intent` page 9 · 5 steps · script 137 words, about 60 s

## Script

Each artifact in the swap pipeline attests one fact. The question is which artifact comes from the owner of the inputs.

**[1]** The envelope signature is made with the submitting member's identity key. It attests that a roster member submitted the operation.

**[2]** The consensus order comes from AlephBFT among the members. It attests which operation spending these inputs came first.

**[3]** The signature shares come from t members and are bound to the operation ID. They attest that the federation signed the outputs of the accepted operation.

**[4]** For a bearer proof under pre-v3 rules, the owner produces nothing. Consensus picks one operation, not necessarily the owner's, and DKG protects the mint key, not the users' secrets.

**[5]** v3 fills this row. The key of each v3 input signs its input digest, which attests that these inputs pay exactly these outputs.

## Background

- **Identity key**: each member's long-term signing key for federation traffic. It is separate from its BLS signing share.
- **t**: the signing threshold, the number of member shares the wallet needs to form one signature.
- **Operation ID binding**: on the branch, a member signs outputs only through `FederationAcceptedSigningRequest`, which checks that the outputs are exactly those of the accepted journal entry with that operation ID.
- **DKG (distributed key generation)**: the members jointly create the signing key so that no machine ever holds all of it. It protects the mint key; it does nothing for secrets the users send.
- **Input witness (v3)**: a BIP-340 signature by the input's own key over its input digest, which commits to the whole transaction.

## Speaker note

- Row 4 in its v3 form (step 5) is specified in cashubtc/nuts#443, not implemented on the federation branches.
- "Pre-v3" means the rules before nuts#443; the branch's keysets are already version 02 (BLS) but still use bearer and NUT-11 secrets.
