import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendResetCodeEmail({
  to,
  name,
  code,
  role,
}) {
  const accountType = role === 'ADMIN' ? 'Admin' : 'Student';

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'CampusCare Password Reset Code',
    text: `Hello ${name},

Your CampusCare ${accountType} password reset code is:

${code}

This code will expire in 10 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
CampusCare Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #2563eb;">CampusCare</h2>

        <p>Hello <strong>${name}</strong>,</p>

        <p>
          We received a request to reset your CampusCare
          <strong>${accountType}</strong> account password.
        </p>

        <div style="
          background: #f3f4f6;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
          border-radius: 10px;
        ">
          <p style="margin: 0 0 8px;">Your verification code is:</p>
          <h1 style="letter-spacing: 8px; margin: 0;">
            ${code}
          </h1>
        </div>

        <p>
          This code will expire in <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not request this password reset, you can safely
          ignore this email.
        </p>

        <hr />

        <p style="color: #6b7280;">
          CampusCare Team
        </p>
      </div>
    `,
  });
}