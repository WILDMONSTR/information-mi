# T05 AI A / AI B handoff records

This directory preserves the AI A handoff and AI B evidence. The implementation and the fixed 10-test script remain at the repository root on branch `ai-b-marketprices-hardening`.

## Version references
- Baseline: `923612383174f094754909254a57b54a03c4f4a6`
- AI A branch: [ai-a-marketprices-hardening](../tree/ai-a-marketprices-hardening)
- AI A commit: [cbe1410bcc1ac41a5c5573f9572b3fe3736034df](../commit/cbe1410bcc1ac41a5c5573f9572b3fe3736034df)
- AI B branch: [ai-b-marketprices-hardening](../tree/ai-b-marketprices-hardening)
- AI B current evidence commit: [bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388](../commit/bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388)

## Files
- `AI_A_T05_검사결과_사용량.md`: AI A existing test and usage record.
- `AI_B_T05_인수인계_완료기록.md`: AI B status, test-evidence limits, chronology, and gate-by-gate assessment.
- `AI_B_T05_검사실행기록.log`: environment caveat and reported test output.
- `AI_B_T05_검사실행기록.actual.txt`: raw 10-test output.
- `AI_B_입력_매니페스트.txt`: expected inputs and original handoff SHA-256.
- `ai-b-marketprices-hardening.patch`: submitted AI B patch.

## Important caveats
The available evidence does not prove AI A or AI B stayed within the 30-minute limit or the total request/call cap. The Claude session input/attachment transcript was not provided, so the exact AI B inputs cannot be independently verified. A reconstructed Node.js v22.16.0 test harness printed 10 PASS lines, but used a stand-in file for `public/js/market.js`; do not treat that output as strict proof of T05-C17. No deployment or merge to main was performed.
