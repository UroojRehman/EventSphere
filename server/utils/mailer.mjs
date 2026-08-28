import nodemailer from "nodemailer";

const hasMailConfig = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
);

const transporter = hasMailConfig
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })
    : null;

export const sendContactEmails = async ({ name, email, subject, message }) => {
    if (!transporter) return false;

    const adminEmail = process.env.CONTACT_ADMIN_EMAIL || process.env.SMTP_USER;
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    await Promise.all([
        transporter.sendMail({
            from,
            to: adminEmail,
            replyTo: email,
            subject: `Contact form: ${subject}`,
            text: `New message from ${name} <${email}>\n\n${message}`
        }),
        transporter.sendMail({
            from,
            to: email,
            subject: "We received your EventSphere message",
            text: `Hi ${name},\n\nThanks for contacting EventSphere. We received your message about ${subject} and will get back to you soon.\n\nYour message:\n${message}`
        })
    ]);

    return true;
};

export const sendPasswordResetEmail = async ({ name, email, resetUrl }) => {
    if (!transporter) return false;
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    await transporter.sendMail({
        from,
        to: email,
        subject: "Reset your EventSphere password",
        text: `Hi ${name},\n\nUse this link to reset your EventSphere password: ${resetUrl}\n\nThis link expires in 30 minutes. If you did not request this, you can ignore this email.`
    });
    return true;
};
