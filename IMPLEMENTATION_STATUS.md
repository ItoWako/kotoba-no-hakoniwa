# Implementation status

## Current phase: implementation cleanup

This package preserves the completed v8 design and user flow while separating tanka generation from the screen component.

### Completed
- v8 visual design and transitions preserved
- 12-photo no-scroll selection layout preserved
- archive interaction preserved
- thank-you screen before returning to the waiting screen preserved
- tanka generation moved behind `src/services/tankaService.ts`
- full experience continues to work with local mock tanka generation and no API key
- fallback tanka keeps the exhibition flow moving if generation fails

### Next phase
Replace the implementation inside `src/services/tankaService.ts` with a request to a server-side Claude endpoint. Do not place an Anthropic API key in frontend/browser code.

After Claude integration:
1. tune the tanka prompt/output format
2. connect archive persistence/database
3. perform exhibition-machine testing and error handling
