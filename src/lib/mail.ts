import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: parseInt(process.env.NODEMAILER_PORT!),
  auth: {
    user: process.env.NODEMAILER_EMAIL_USER,
    pass: process.env.NODEMAILER_EMAIL_PASSWORD,
  },
});

export async function sendEmailVerificationEmail(email: string, token: string) {
  const emailVerificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_ENDPOINT}`;
  const url = `${emailVerificationUrl}?token=${token}`;

  try {
    console.log(`Sending email for account activation to ${email}`);
    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL_USER,
      to: email,
      subject: "Activate your account",
      html: `<p>Click <a href="${url}">here</a> to activate your account.</p>`,
    });
    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error(`Error sending email!`, error);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetPasswordUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_RESET_PASSWORD_ENDPOINT}`;
  const url = `${resetPasswordUrl}?token=${token}`;

  try {
    console.log(`Sending email to reset password to ${email}`);
    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL_USER,
      to: email,
      subject: "Reset your password",
      html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
    });
  } catch (error) {
    console.error(`Error sending email!`, error);
  }
}
