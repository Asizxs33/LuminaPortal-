# iPhone layout and fullscreen compatibility

Local changes, 2026-10-23:

- The mobile app shell follows `100dvh`, with a fallback for older browsers. The test uses a compact header, scrollable question content, and bottom actions padded for the safe-area inset.
- Answer rows wrap long text; question navigation retains touch targets of at least 44px. Web form inputs use 16px text to avoid unwanted focus zoom.
- Fullscreen uses capability detection, including WebKit-prefixed APIs and Home Screen standalone mode. Unsupported or rejected fullscreen requests no longer block exam start. Only an actual transition out of active fullscreen records a fullscreen-exit event. Browser switching and server timing remain unchanged.
- Unsupported fullscreen is recorded once per exam attempt as informational, without presenting it as a violation. The server already excludes `fullscreen_unavailable` from its violation count.
- The compatibility gate explains Safari → Share → Add to Home Screen for opening the existing installable web app without Safari's browser panels. This is a standalone web app mode, not a guarantee that the browser can be forced into fullscreen.

Verification: frontend TypeScript and web export passed; `node node_modules/tsx/dist/cli.mjs server/scripts/check-fullscreen.ts` passed 10 capability/unsupported/denied/standalone cases. Browser UI checks used an isolated fixture with `Permissions-Policy: fullscreen=()` to exercise unsupported fullscreen, at 393×852 and 375×667. Start, answer selection, next/back, and numbered question navigation worked; document width stayed within viewport and bottom navigation remained visible. No real exam was started. No physical iPhone/WebKit test was performed.

WebKit reference: https://bugs.webkit.org/show_bug.cgi?id=206854
