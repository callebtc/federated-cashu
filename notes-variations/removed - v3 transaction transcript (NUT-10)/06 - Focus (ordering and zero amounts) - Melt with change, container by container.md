# removed.06 · Melt with change, container by container

Variation 6 of slide removed (v3 transaction transcript (NUT-10)) · lens: Focus: ordering and zero amounts · deck `fcv-f-client-intent` page 16 · 4 steps · script 136 words, about 60 s

## Script

The melt-with-change vector, container by container.

**[1]** The request body names the melt quote first, then the 8-sat proof, then two blank outputs. Blank outputs are NUT-08 blinded messages with amount zero, used to return unspent fee reserve.

**[2]** The transcript ignores the request's field order. It groups containers by ascending type: the proof, 01, then the two blanks, 03, and the melt quote, 04, last.

**[3]** A blank's amount is zero, and zero encodes as an empty value: field 01, length 0000. The container length is therefore 90, 005a. A 4-sat output has one amount byte and length 91.

**[4]** The melt quote output binds the quote amount plus the fee reserve, 8 plus 0, and the quote ID as 15 UTF-8 bytes. 356 bytes, digest 9443ab45. The input ID matches the swap's; the input digest, 1604341e, does not.

## Background

- **Melt quote (NUT-05)**: the mint's offer to make an external payment; it states the amount and a fee reserve for routing fees.
- **Blank outputs (NUT-08)**: blinded messages whose value the mint sets after payment, carrying any overpaid fee back to the wallet.
- **Zero as an empty value**: minimal big-endian encoding writes 0 as zero bytes, so the amount record is `01 0000`, three bytes, one less than `01 0001 04`.
- **Quote ID**: written as UTF-8 bytes; `quote-melt-0001` is 15 bytes (`000f`).
- **Same input ID, different input digest**: the proof container is identical to the swap's, but the transaction digest differs, so the signed message differs.

## Speaker note

- NUT-08 prescribes zero blank outputs when the fee reserve is 0; the vector includes two anyway to show the zero-amount encoding and the ordering.
- Specified in cashubtc/nuts#443; not implemented on the federation branches.
