export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>WAVENOX — System Offline</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #111215; color: #FFFFFF; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; -webkit-font-smoothing: antialiased; }
      .showroom { max-width: 440px; width: 100%; text-align: center; }
      .brand { font-size: 13px; font-weight: 700; letter-spacing: 0.36em; text-transform: uppercase; color: #FFFFFF; margin-bottom: 32px; }
      .code { font-size: 12px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: #F57C00; margin-bottom: 8px; }
      h1 { font-size: 28px; font-weight: 500; letter-spacing: -0.02em; margin: 0 0 12px; color: #FFFFFF; }
      p { font-size: 14px; line-height: 1.6; color: #9CA3AF; margin: 0 0 32px; }
      .actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
      a, button { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 24px; border-radius: 4px; font-size: 13px; font-weight: 500; letter-spacing: 0.04em; text-decoration: none; cursor: pointer; border: 1px solid transparent; transition: all 150ms ease; }
      .primary { background: #FFFFFF; color: #171A20; }
      .primary:hover { opacity: 0.9; }
      .secondary { background: #1B1E24; color: #FFFFFF; border-color: #2C323C; }
      .secondary:hover { background: #23272F; }
    </style>
  </head>
  <body>
    <div class="showroom">
      <div class="brand">WAVENOX</div>
      <div class="code">Telemetry Exception</div>
      <h1>System Offline</h1>
      <p>An unexpected exception occurred while rendering this interface. Reconnecting telemetry or returning to the showroom will restore normal operation.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Retry Connection</button>
        <a class="secondary" href="/">Return to Showroom</a>
      </div>
    </div>
  </body>
</html>`;
}
