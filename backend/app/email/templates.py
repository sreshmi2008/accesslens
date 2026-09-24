import html


def _base_email(preheader: str, heading: str, body_html: str, button_label: str, button_url: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#020617;font-family:Arial,Helvetica,sans-serif;">
  <span style="display:none;font-size:1px;color:#020617;">{html.escape(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0"
               style="background:#0b1226;border:1px solid rgba(148,163,184,0.15);border-radius:16px;padding:32px;">
          <tr>
            <td>
              <p style="color:#67e8f9;font-size:12px;font-weight:700;letter-spacing:0.1em;margin:0 0 16px;">
                ACCESSLENS
              </p>
              <h1 style="color:#f8fafc;font-size:22px;margin:0 0 16px;">{html.escape(heading)}</h1>
              <div style="color:#cbd5e1;font-size:14px;line-height:1.6;">{body_html}</div>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="border-radius:10px;background:linear-gradient(135deg,#22d3ee,#7c3aed);">
                    <a href="{html.escape(button_url)}"
                       style="display:inline-block;padding:12px 24px;color:white;font-weight:700;
                              font-size:14px;text-decoration:none;">
                      {html.escape(button_label)}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;">
                Or paste this link into your browser:<br />
                <span style="color:#94a3b8;word-break:break-all;">{html.escape(button_url)}</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def verification_email_html(name: str, link: str) -> str:
    return _base_email(
        preheader="Verify your AccessLens account",
        heading=f"Hi {name}, verify your email",
        body_html=(
            "Click the button below to verify your AccessLens account. "
            "This link expires in 24 hours."
        ),
        button_label="Verify Email",
        button_url=link,
    )


def reset_password_email_html(name: str, link: str) -> str:
    return _base_email(
        preheader="Reset your AccessLens password",
        heading=f"Hi {name}, reset your password",
        body_html=(
            "We received a request to reset your AccessLens password. "
            "Click the button below to choose a new one. This link expires in 1 hour. "
            "If you didn't request this, you can ignore this email."
        ),
        button_label="Reset Password",
        button_url=link,
    )
