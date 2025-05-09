export function generateBaseEmailTemplate({
  title,
  preheaderText,
  content,
  footerText = "© File Manager. All rights reserved.",
}: {
  title: string
  preheaderText: string
  content: string
  footerText?: string
}) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <style>
        @media only screen and (max-width: 600px) {
          .main-container {
            width: 100% !important;
            padding: 10px !important;
          }
          .content {
            padding: 15px !important;
          }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #333333;
          background-color: #f5f5f5;
        }
        .preheader {
          display: none;
          max-height: 0;
          overflow: hidden;
          font-size: 1px;
          line-height: 1px;
          color: #ffffff;
        }
        .main-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #4f46e5;
          padding: 20px;
          text-align: center;
        }
        .header img {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 30px;
          background-color: #ffffff;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        .button {
          display: inline-block;
          background-color: #4f46e5;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: 600;
          margin: 20px 0;
        }
        .info-box {
          background-color: #f3f4f6;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
        }
        .divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 20px 0;
        }
        h1, h2, h3 {
          color: #111827;
        }
        p {
          margin: 10px 0;
          line-height: 1.5;
        }
        .text-center {
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="preheader">${preheaderText}</div>
      <div class="main-container">
        <div class="header">
          <h1 style="color: #ffffff; margin: 0;">File Manager</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          ${footerText}
        </div>
      </div>
    </body>
    </html>
  `
}
