# T05 AI A/B handoff and evidence

This folder holds AI B handoff docs and the T05 evidence. Application source remains at the repository root.

- Baseline: `923612383174f094754909254a57b54a03c4f4a6`
- AI A branch/commit: `ai-a-marketprices-hardening` / `cbe1410bcc1ac41a5c5573f9572b3fe3736034df`
- AI B branch: `ai-b-marketprices-hardening`
- AI B source/evidence commit before documentation: `bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388`

## Artifacts
- `AI_B_T05_인수인계_요약.md` — status and next steps
- `AI_B_T05_검사실행기록.log` and `.actual.txt` — test record and caveat
- `AI_B_입력_매니페스트.txt` — expected input manifest
- `AI_B_한페이지_실행인수인계.docx` — quick-start handoff
- `T05_AI_A_AI_B_증거묶음.zip` — compact evidence archive

## Limits
Reconstructed harness reported T05-C01–C10 PASS, but `public/js/market.js` was a syntax-valid stand-in, not the exact repository file; strict T05-C17 is not proven. Actual Claude session attachment listing, start/end timestamps, and request/call counts were not supplied. Therefore T05-C13/C14 and T05-C50–C53 remain unproven. No deployment or merge to `main` was performed.
