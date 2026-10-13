# T05 AI A / AI B handoff records

This directory preserves code, handoff documentation, the submitted AI B patch, the reported test output, and a transparent record of verification gaps. The code and the fixed 10-test script are at the repository root on this separate AI B branch.

## Version references
- Baseline: `923612383174f094754909254a57b54a03c4f4a6`
- AI A branch: [ai-a-marketprices-hardening](../tree/ai-a-marketprices-hardening)
- AI A result commit: [cbe1410bcc1ac41a5c5573f9572b3fe3736034df](../commit/cbe1410bcc1ac41a5c5573f9572b3fe3736034df)
- AI B branch: [ai-b-marketprices-hardening](../tree/ai-b-marketprices-hardening)
- Current documentation commit: [7618fdcfc169aef14ade9d838f18a3f01e4379b2](../commit/7618fdcfc169aef14ade9d838f18a3f01e4379b2)
- AI B source snapshot commit: [bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388](../commit/bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388)

## Files
- [`AI_B_한페이지_실행인수인계.docx`](./AI_B_한페이지_실행인수인계.docx): verified, compact Word one-page handoff.
- [`AI_A_T05_검사결과_사용량.md`](./AI_A_T05_검사결과_사용량.md): AI A's existing test and usage record.
- [`AI_B_T05_인수인계_완료기록.md`](./AI_B_T05_인수인계_완료기록.md): AI B status, test evidence limits, chronology, and gate-by-gate assessment.
- [`AI_B_T05_검사실행기록.log`](./AI_B_T05_검사실행기록.log): test output with environment caveat.
- [`AI_B_T05_검사실행기록.actual.txt`](./AI_B_T05_검사실행기록.actual.txt): the 10-test output lines.
- [`AI_B_입력_매니페스트.txt`](./AI_B_입력_매니페스트.txt): expected inputs and SHA-256 of the original AI A handoff DOCX.
- [`ai-b-marketprices-hardening.patch`](./ai-b-marketprices-hardening.patch): original submitted AI B patch.
- [`information-mi_AI-A_종료_인수인계_전문.md`](./information-mi_AI-A_종료_인수인계_전문.md): Markdown transcription of the original AI A handoff document. It is not byte-identical to the source DOCX; the source SHA-256 is recorded inside the transcript and manifest.

## Important caveats
The available evidence does not prove AI A or AI B stayed within the 30-minute limit or total request/call cap. The Claude session's actual input/attachment transcript was not provided, so the exact AI B inputs cannot be independently verified. A reconstructed Node.js v22.16.0 test harness printed 10 PASS lines, but used a stand-in file for `public/js/market.js`; do not treat that output as strict proof of T05-C17. The repository comparison shows 129 changed lines across two code/test files and no new dependency. No deployment or merge to `main` was performed.
