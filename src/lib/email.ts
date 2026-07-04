import nodemailer from "nodemailer";

let _transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
    });
  }
  return _transporter;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await getTransporter().sendMail({
      from: `"رابطة خريجي جامعة أفريقيا العالمية" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().substring(0, 500),
      headers: {
        "List-Unsubscribe": `<mailto:${process.env.SMTP_USER || process.env.EMAIL_USER}?subject=unsubscribe>`,
        "X-Mailer": "AIUAG-Mailer",
        "Precedence": "bulk",
      },
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiuag.vercel.app";
const LOGO_URL = "https://2wn58psscop8hf2b.public.blob.vercel-storage.com/%D8%B4%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D8%B1%D8%A7%D8%A8%D8%B7%D8%A9.jpg";
const YEAR = new Date().getFullYear();

function wrap(content: string, preheader: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>AIUAG</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${preheader}</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 20px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
${content}
</table>
<table width="580" cellpadding="0" cellspacing="0">
<tr><td style="background:#1A3A6B;padding:28px 32px;text-align:center;border-radius:0 0 16px 16px;">
<img src="${LOGO_URL}" width="48" height="48" alt="AIUAG" style="border-radius:50%;margin-bottom:12px;" />
<div style="color:#ffffff;font-size:15px;font-weight:700;margin-bottom:4px;">رابطة خريجي جامعة أفريقيا العالمية</div>
<div style="color:rgba(255,255,255,0.55);font-size:12px;margin-bottom:16px;">تعزيز الروابط المهنية والاجتماعية بين الخريجين</div>
<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:14px;">
<a href="https://www.facebook.com" style="display:inline-block;margin:0 4px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.1);line-height:32px;text-align:center;text-decoration:none;">
<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
</a>
</div>
<div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:14px;">&copy; ${YEAR} جميع الحقوق محفوظة</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function headerRow(title: string, subtitle: string): string {
  return `<tr><td style="background:linear-gradient(135deg,#1A3A6B 0%,#2B5EA7 100%);padding:40px 32px;text-align:center;">
<img src="${LOGO_URL}" width="56" height="56" alt="AIUAG" style="border-radius:50%;border:3px solid rgba(255,255,255,0.2);margin-bottom:16px;" />
<div style="color:#ffffff;font-size:22px;font-weight:700;margin-bottom:6px;">${title}</div>
<div style="color:rgba(255,255,255,0.65);font-size:13px;">${subtitle}</div>
</td></tr>`;
}

function bodyRow(content: string): string {
  return `<tr><td style="padding:36px 32px;text-align:center;">
${content}
</td></tr>`;
}

function alertBox(text: string, color: "amber" | "red" | "green"): string {
  const styles = {
    amber: { bg: "#fffbeb", border: "#fbbf24", text: "#92400e" },
    red: { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b" },
    green: { bg: "#ecfdf5", border: "#6ee7b7", text: "#065f46" },
  };
  const s = styles[color];
  return `<div style="background:${s.bg};border:1px solid ${s.border};color:${s.text};border-radius:10px;padding:14px 18px;margin:20px 0;font-size:13px;line-height:1.7;text-align:right;">${text}</div>`;
}

function infoBox(label: string, value: string): string {
  return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;margin:8px 0;text-align:right;">
<div style="font-size:11px;color:#94a3b8;margin-bottom:2px;">${label}</div>
<div style="font-size:15px;color:#1e293b;font-weight:600;" dir="ltr">${value}</div>
</div>`;
}

function btn(text: string, url: string, color: "blue" | "gold"): string {
  const bg = color === "gold"
    ? "background:linear-gradient(135deg,#D4A843,#E8C76A);color:#1A3A6B;"
    : "background:linear-gradient(135deg,#1A3A6B,#2B5EA7);color:#ffffff;";
  return `<div style="margin:24px 0;">
<a href="${url}" style="display:inline-block;${bg}padding:13px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 3px 12px rgba(0,0,0,0.15);">${text}</a>
</div>`;
}

function divider(): string {
  return `<div style="height:1px;background:linear-gradient(to right,transparent,#e2e8f0,transparent);margin:20px 0;"></div>`;
}

export function getWelcomeEmailHtml(name: string, email: string): string {
  const content = `${headerRow("مرحباً بك في عائلتنا", "رابطة خريجي جامعة أفريقيا العالمية")}
${bodyRow(`
<div style="width:64px;height:64px;border-radius:50%;background:#ecfdf5;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#D4A843"/><path d="M10 16L14 20L22 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
</div>
<h2 style="color:#1A3A6B;font-size:20px;font-weight:700;margin:0 0 10px;">أهلاً وسهلاً ${name}</h2>
<p style="color:#64748b;font-size:14px;line-height:1.8;margin:0 0 16px;">يسعدنا انضمامك إلى عائلة رابطة خريجي جامعة أفريقيا العالمية. أصبحت الآن جزءاً من شبكة مهنية متميزة.</p>
${divider()}
${infoBox("البريد الإلكتروني", email)}
${infoBox("المزايا المتاحة", "ملف شخصي / بطاقة عضوية / مزايا حصرية")}
${btn("تسجيل الدخول الآن", `${BASE_URL}/auth/login`, "blue")}
${alertBox("يرجى التحقق من بريدك الإلكتروني قبل تسجيل الدخول", "amber")}
`)}`;

  return wrap(content, `مرحباً بك ${name} في رابطة خريجي جامعة أفريقيا العالمية`);
}

export function getVerificationEmailHtml(name: string, token: string): string {
  const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;
  const digits = token.split("");

  const content = `${headerRow("تأكيد البريد الإلكتروني", "رابططة خريجي جامعة أفريقيا العالمية")}
${bodyRow(`
<div style="width:64px;height:64px;border-radius:50%;background:#eff6ff;margin:0 auto 20px;">
<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#1A3A6B"/><circle cx="16" cy="16" r="9" fill="white"/><path d="M12 16L15 19L21 13" stroke="#1A3A6B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
</div>
<h2 style="color:#1A3A6B;font-size:20px;font-weight:700;margin:0 0 10px;">مرحباً ${name}</h2>
<p style="color:#64748b;font-size:14px;line-height:1.8;margin:0 0 20px;">شكراً لك للانضمام إلى رابطة خريجي جامعة أفريقيا العالمية. لتأكيد حسابك، استخدم الرمز التالي:</p>
<table cellpadding="0" cellspacing="6" align="center" style="margin:20px auto;">
<tr>${digits.map(d => `<td style="width:44px;height:52px;background:linear-gradient(135deg,#1A3A6B,#2B5EA7);color:#ffffff;font-size:22px;font-weight:700;border-radius:10px;text-align:center;font-family:'Courier New',monospace;">${d}</td>`).join("")}</tr>
</table>
<p style="color:#64748b;font-size:13px;margin:16px 0;">أو اضغط الزر أدناه للتأكيد السريع:</p>
${btn("تأكيد البريد الإلكتروني", verifyUrl, "blue")}
${divider()}
${alertBox("هذا الرمز صالح لمدة <strong>24 ساعة</strong> فقط", "amber")}
<p style="color:#94a3b8;font-size:12px;margin:16px 0 0;">إذا لم تطلب إنشاء هذا الحساب، يرجى تجاهل هذه الرسالة.</p>
`)}`;

  return wrap(content, `رمز تأكيد حسابك هو: ${token}`);
}

export function getPasswordResetEmailHtml(name: string, token: string): string {
  const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`;

  const content = `${headerRow("إعادة تعيين كلمة المرور", "رابطة خريجي جامعة أفريقيا العالمية")}
${bodyRow(`
<div style="width:64px;height:64px;border-radius:50%;background:#fffbeb;margin:0 auto 20px;">
<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#D4A843"/><rect x="11" y="14" width="10" height="10" rx="2" fill="white"/><path d="M13 14v-2a3 3 0 016 0v2" stroke="white" stroke-width="1.5" fill="none"/><circle cx="16" cy="19" r="1.5" fill="#D4A843"/></svg>
</div>
<h2 style="color:#1A3A6B;font-size:20px;font-weight:700;margin:0 0 10px;">مرحباً ${name}</h2>
<p style="color:#64748b;font-size:14px;line-height:1.8;margin:0 0 20px;">تلقينا طلباً لإعادة تعيين كلمة المرور. اضغط الزر أدناه لإنشاء كلمة مرور جديدة:</p>
${btn("إعادة تعيين كلمة المرور", resetUrl, "gold")}
${divider()}
<p style="color:#64748b;font-size:13px;margin:12px 0;">أو استخدم رمز إعادة التعيين:</p>
<div style="background:#f8fafc;border:2px dashed #D4A843;border-radius:10px;padding:14px;margin:14px 0;font-family:'Courier New',monospace;font-size:14px;font-weight:700;color:#1A3A6B;letter-spacing:2px;text-align:center;word-break:break-all;">${token}</div>
${alertBox("هذا الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط", "amber")}
${alertBox("إذا لم تطلب إعادة تعيين كلمة المرور، يرجى <strong>تغيير كلمة المرور فوراً</strong> للحفاظ على أمان حسابك.", "red")}
<p style="color:#94a3b8;font-size:12px;margin:16px 0 0;">يمكنك تجاهل هذه الرسالة إذا لم تطلب إعادة التعيين.</p>
`)}`;

  return wrap(content, `رابط إعادة تعيين كلمة المرور: ${resetUrl}`);
}
