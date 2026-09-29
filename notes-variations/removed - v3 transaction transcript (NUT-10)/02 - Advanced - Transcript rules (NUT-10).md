# removed.02 · Transcript rules (NUT-10)

Variation 2 of slide removed (v3 transaction transcript (NUT-10)) · lens: Advanced · deck `fcv-f-client-intent` page 12 · 3 steps · script 137 words, about 60 s

## Script

The normative transcript rules of NUT-10, in three groups.

**[1]** Structure. A transaction MUST have at least one input and one output, and MUST NOT repeat a proof Y or a mint quote ID. Containers group by ascending type and keep request order within a type; field records inside a container strictly ascend. Container 0x05 never appears in a transaction: it is the sole container of a NUT-22 request transcript.

**[2]** Encoding. Integers are minimal big-endian, and a leading zero byte MUST be rejected. Points are raw, 48 bytes on v3. Y stands in for the secret.

**[3]** Binding. A mint quote input commits the amount issued now, at most paid minus issued. A melt quote output commits its amount plus the selected fee reserve, read from the mint's own quote state. Outputs are bound as sent, blank change included.

## Background

- **Container stream versus field stream**: the transcript's top level is a stream of containers, one per input or output; inside a container, the fields form a stream whose types must strictly ascend.
- **Why no repeated Y or quote ID**: it guarantees that input IDs differ, so no two inputs sign the same message.
- **0x05, authorized request (NUT-22)**: method, target and body hash of an HTTP request, signed by a blind authentication token. It is never a transaction input.
- **amount_paid − amount_issued (NUT-04)**: the part of a mint quote still available to mint; partial mints are allowed.
- **fee_reserve, fee_options, fee_index (NUT-05, NUT-30)**: the reserve a melt quote sets aside for routing fees; with `fee_options`, the request's `fee_index` selects one entry.
- **Blank change (NUT-08)**: outputs with amount 0 that the mint fills with any overpaid fee reserve.
- **v3 mint, one keyset (NUT-04)** and **batch `quote_amounts` (NUT-29)**: all outputs of a v3 mint share one keyset; a v3 batch must carry `quote_amounts` and its outputs must sum to exactly their total.

## Speaker note

- Specified in cashubtc/nuts#443; not implemented on the federation branches.
