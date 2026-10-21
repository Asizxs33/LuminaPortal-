# LuminaPortal Design System

## Direction

**Learning Route** translates contemporary campus wayfinding into a calm assessment workspace. Familiar web controls remain standard. The distinctive move is a route line that makes progress and the next action visible.

## Color

- Canvas: `#F5F7FB`
- Surface: `#FFFFFF`
- Ink: `#16213E`
- Muted ink: `#69758B`
- Border: `#D9E0EC`
- Primary cobalt: `#315CF5`
- Supporting cyan: `#73D2DE`
- Progress lime: `#B8E34A`
- Success: `#16845B`
- Warning: `#B96810`
- Danger: `#C73D4D`

Color communicates role and state. Cobalt is reserved for the current path and primary actions; lime marks completed progress; red appears only for errors and destructive actions.

## Typography

Use a compact, readable system sans stack. Headlines are heavy and tightly spaced; body copy remains regular with generous line height. Figures may use tabular numerals. Avoid all-caps section labels and decorative tracking.

## Layout

- Desktop shell: 264 px navigation rail plus flexible content canvas.
- Main content width: 1180 px maximum.
- Page spacing: 24 px mobile, 40 px desktop.
- Major sections use 32–40 px separation; related controls use 8–16 px.
- Surfaces use 14–20 px radii based on hierarchy, not one universal radius.
- Panels separate with hairline borders; shadows are reserved for floating or focused content.

## Components

- **Learning route:** nodes and connecting segments show completed, current, and upcoming steps.
- **Action card:** title, concise metadata, visible state, and one clear action.
- **Form field:** label above, 48 px minimum height, visible focus and error state.
- **Status badge:** semantic color plus text; never color alone.
- **Destructive control:** separated from routine actions and styled red only on focus or confirmation.

## Responsive Behavior

Navigation collapses to native bottom tabs on small screens. Multi-column panels stack by task priority. Primary actions remain at least 44 px high. The learning route may wrap labels but the progress direction stays left-to-right.

## Voice

Use direct, supportive Kazakh for primary product UI. Russian may remain inside imported assessment content. Avoid inflated claims, invented metrics, and vague calls to action.

## Accessibility

Maintain AA contrast, visible keyboard focus, explicit field labels, descriptive accessibility labels, and text alternatives for status. Do not rely on hover. Respect reduced motion by keeping transitions functional and short.
