# data.gov.in Agriculture

This directory does **not** store dummy or snapshot mandi prices.

Runtime answers come only from verified live `data.gov.in` Agriculture
resources (AGMARKNET, DES crop production, IMD rainfall, horticulture,
fertilizer subsidy, land-use). Example:

`https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`

Transient HTTP 5xx/429 are retried. If the live call still fails, the pipeline
reports the error. It does not invent prices and it does not replay a committed
JSON fixture.
