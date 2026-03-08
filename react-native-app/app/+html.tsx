// Learn more https://docs.expo.dev/router/reference/static-rendering/#root-html

import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kk">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* Viewport: viewport-fit=cover removes safe area white bars */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />

        {/* ===== PWA / iOS Standalone Mode ===== */}
        {/* These two tags hide Safari URL bar + toolbar when opened from Home Screen */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* black-translucent = status bar blends with app. Use 'default' for white bar */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LuminaPortal" />

        {/* ===== App Icon (shown on Home Screen) ===== */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* ===== Theme color (browser toolbar color on Android Chrome) ===== */}
        <meta name="theme-color" content="#4848e5" />
        <meta name="msapplication-TileColor" content="#4848e5" />
        <meta name="msapplication-TileImage" content="/assets/images/icon.png" />

        {/* ===== App metadata ===== */}
        <title>LuminaPortal</title>
        <meta name="description" content="Студенттерге арналған онлайн тестілеу платформасы" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
