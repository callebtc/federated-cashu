# 20 · Federated swap

1.3 Ordering · 5 steps · script 116 words, about 50 s

## Script

A federated swap, as data flow.

**[1]** The wallet sends the same swap request, inputs P1 and P2, to every member. Each member first checks the proofs and their spending conditions.

**[2]** Each member submits the request to AlephBFT. It comes out as one operation in the shared order, here number 41.

**[3]** Every member applies operation 41: it checks the balance including fees and marks P1 and P2 as spent. A second swap of the same inputs would now fail with TokenAlreadySpent.

**[4]** Each member signs the new outputs with its key share and returns its signature shares.

**[5]** The wallet takes t shares per output, combines them with Lagrange weights, unblinds, and holds the new tokens A and B.

## Background

- **Swap (NUT-03)**: exchange existing proofs for new ones of the same total value minus fees.
- **Admission**: cheap checks before consensus: unique inputs, valid v3 outputs, proofs and conditions verify.
- **Who submits**: members compute a publisher order from the operation ID; the first-ranked member submits and the others step in after 3 s per rank.
- **C = r⁻¹·Σ λᵢ·C′ᵢ**: combine the shares with Lagrange weights λᵢ, then remove the blinding factor r.
- **Lagging members**: a member behind the log returns no shares; after catching up it serves the stored shares of the accepted operation, never new ones.
