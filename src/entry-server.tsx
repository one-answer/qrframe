// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.svg" />
          <title>二维码工坊</title>
          {assets}
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3811349067654166"
            crossorigin="anonymous"></script>
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-HE09ZDL92L"></script>
          <script>
            {
              `window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments)}
        gtag('js', new Date());

        gtag('config', 'G-HE09ZDL92L')`
            }
          </script>
        </head>
        <body class="bg-back-base text-fore-base [--un-default-border-color:fg-subtle]">
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
