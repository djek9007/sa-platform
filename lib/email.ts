import nodemailer from "nodemailer";

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      `SMTP не настроен. Ссылка для восстановления пароля для ${email}: ${resetUrl}`
    );
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: email,
    subject: "Восстановление пароля — Системный и Бизнес-анализ",
    text: `Для восстановления пароля перейдите по ссылке: ${resetUrl}\n\nЕсли вы не запрашивали восстановление пароля, просто игнорируйте это письмо. Ссылка действительна в течение 1 часа.`,
    html: `
      <p>Вы запросили восстановление пароля для своего аккаунта.</p>
      <p><a href="${resetUrl}">Нажмите здесь, чтобы установить новый пароль</a></p>
      <p>Ссылка действительна в течение 1 часа. Если вы не запрашивали восстановление пароля, просто игнорируйте это письмо.</p>
    `,
  });
}
