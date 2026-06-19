import { NextRequest, NextResponse } from "next/server";

/** 转义 HTML 特殊字符，防止注入 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, email, message } = data;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and Email are required" },
        { status: 400 }
      );
    }

    // 基础输入校验
    if (typeof name !== "string" || name.length > 100) {
      return NextResponse.json({ error: "姓名过长" }, { status: 400 });
    }
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "邮箱格式无效" }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL;
    const MAIL_FROM =
      process.env.MAIL_FROM || "Agora <onboarding@resend.dev>";

    if (!NOTIFICATION_EMAIL) {
      return NextResponse.json(
        { error: "联系表单未配置收件邮箱" },
        { status: 503 },
      );
    }
    if (!process.env.MAIL_FROM) {
      console.warn(
        "MAIL_FROM 未设置，使用 Resend 测试地址 onboarding@resend.dev（仅能发送到验证过的测试邮箱）",
      );
    }

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Falling back to mock behavior.");
      console.log(
        `[Greeting Received] Name: ${name}, Email: ${email}, Message: ${message}`
      );
      await new Promise((resolve) => setTimeout(resolve, 800));
      return NextResponse.json({
        success: true,
        message: "Mock success (API Key missing)",
      });
    }

    // 转义用户输入，防止 HTML 注入
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = message ? escapeHtml(message) : "（无）";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: NOTIFICATION_EMAIL,
        subject: `✨ 新申请: ${safeName} 加入集市`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #a84c32;">新申请通知</h2>
            <p>有人对 <strong>集市 AGORA</strong> 感兴趣了！</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p><strong>姓名:</strong> ${safeName}</p>
            <p><strong>邮箱:</strong> ${safeEmail}</p>
            <p><strong>留言:</strong> ${safeMessage}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">这是一条来自 Agora Landing Page 的自动通知。</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend API error:", errText);
      let errorMessage = "Failed to send email via Resend";
      try {
        const errData = JSON.parse(errText);
        errorMessage = errData.message || errorMessage;
      } catch {
        errorMessage = errText || errorMessage;
      }
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const resData = await res.json();
    console.log("Email sent successfully:", resData.id);

    return NextResponse.json({
      success: true,
      message: "Greeting received and email sent",
    });
  } catch (err) {
    console.error("Internal Server Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
