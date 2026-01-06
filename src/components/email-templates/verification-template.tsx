interface EmailVerificationTemplateProps {
  name: string;
  verificationCode: string;
}

export const EmailVerificationTemplate: React.FC<
  EmailVerificationTemplateProps
> = ({ name, verificationCode }) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Verification</title>
    </head>
    <body
      style={{
        margin: 0,
        padding: 0,
        backgroundColor: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <table
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        style={{ backgroundColor: "#f8fafc", padding: "40px 0" }}
      >
        <tr>
          <td align="center">
            <table
              width="600"
              cellPadding="0"
              cellSpacing="0"
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <tr>
                <td
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding: "40px 60px",
                    textAlign: "center",
                  }}
                >
                  <h1
                    style={{
                      color: "#ffffff",
                      fontSize: "28px",
                      margin: "0",
                      fontWeight: "600",
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    🔐 Verify Your Email
                  </h1>
                </td>
              </tr>

              {/* Content */}
              <tr>
                <td style={{ padding: "60px" }}>
                  <h2
                    style={{
                      color: "#1f2937",
                      fontSize: "24px",
                      margin: "0 0 20px 0",
                      fontWeight: "600",
                    }}
                  >
                    Hi {name}! 👋
                  </h2>

                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "16px",
                      lineHeight: "1.6",
                      margin: "0 0 30px 0",
                    }}
                  >
                    Welcome to our platform! To complete your registration and
                    secure your account, please verify your email address using
                    the verification code below.
                  </p>

                  {/* Verification Code Box */}
                  <div
                    style={{
                      backgroundColor: "#f3f4f6",
                      border: "2px dashed #d1d5db",
                      borderRadius: "8px",
                      padding: "30px",
                      textAlign: "center",
                      margin: "30px 0",
                    }}
                  >
                    <p
                      style={{
                        color: "#374151",
                        fontSize: "14px",
                        margin: "0 0 10px 0",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        fontWeight: "600",
                      }}
                    >
                      Your Verification Code
                    </p>
                    <div
                      style={{
                        fontSize: "36px",
                        fontWeight: "800",
                        color: "#667eea",
                        letterSpacing: "8px",
                        fontFamily: "Monaco, Consolas, monospace",
                        textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      {verificationCode}
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#fef3c7",
                      border: "1px solid #f59e0b",
                      borderRadius: "6px",
                      padding: "16px",
                      margin: "20px 0",
                    }}
                  >
                    <p
                      style={{
                        color: "#92400e",
                        fontSize: "14px",
                        margin: "0",
                        lineHeight: "1.5",
                      }}
                    >
                      ⚡ <strong>Important:</strong> This code will expire in 10
                      minutes and can only be used once.
                    </p>
                  </div>

                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "16px",
                      lineHeight: "1.6",
                      margin: "30px 0 0 0",
                    }}
                  >
                    If you didn&#39;t create an account with us, you can safely
                    ignore this email.
                  </p>
                </td>
              </tr>

              {/* Footer */}
              <tr>
                <td
                  style={{
                    backgroundColor: "#f9fafb",
                    padding: "30px 60px",
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "14px",
                      textAlign: "center",
                      margin: "0",
                      lineHeight: "1.5",
                    }}
                  >
                    This is an automated message. Please do not reply to this
                    email.
                    <br />© 2024 Your Company Name. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
);
