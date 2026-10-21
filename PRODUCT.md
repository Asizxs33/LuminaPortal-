# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Inferred from the repository: students who discover, take, and review timed assessments.
- Inferred from the repository: administrators who create tests, manage students, and review results.

## Product Purpose

LuminaPortal centralizes online assessment: administrators publish tests and monitor outcomes; students find assigned work, complete it, and understand their results. Success means a student can enter a test with confidence and an administrator can operate the platform without losing data or context.

## Positioning

Inferred from the repository: a bilingual Kazakh and Russian assessment workspace with document-derived tests, code questions, automated evaluation, and role-specific dashboards in one product.

## Operating Context

- Browser-first responsive application deployed on Vercel.
- Students commonly enter from a phone or laptop and complete timed tests.
- Administrators manage tests, student roles, results, and reward balances.
- Existing test content includes Kazakh and Russian copy and image-based source questions.

## Capabilities and Constraints

- Preserve the existing Expo Router and React Native Web stack.
- Preserve student and administrator roles, registration, authentication, test creation, test taking, results, and the two document-derived informatics tests.
- Security-sensitive administration actions require authenticated administrator access.
- Existing production data must not be reset or replaced by seed data.
- Inferred open decision: whether the interface should eventually use one language consistently or expose an explicit language switcher.

## Brand Commitments

- Product name: LuminaPortal.
- Inferred from current copy: confident, supportive, education-focused language without childish gamification.
- Existing primary brand association: blue and indigo.

## Evidence on Hand

- Current application routes and UI in `react-native-app/app`.
- Existing document-derived test screenshots in `react-native-app/assets`.
- No approved testimonials, customer logos, usage benchmarks, or photography are available; future work must not invent them.

## Product Principles

1. Make the next learning action obvious.
2. Show progress and consequences before a student commits.
3. Keep administrative power visible, authenticated, and recoverable.
4. Use real assessment content as the product's proof.
5. Treat mobile and desktop as first-class study environments.

## Accessibility & Inclusion

Inferred requirement: maintain readable contrast, keyboard-accessible controls on web, visible focus states, clear validation, and layouts that remain usable on small screens.
