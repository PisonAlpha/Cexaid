import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      fullName,
      projectName,
      email,
      telegram,
      website,
      service,
      message,
    } = body;

    if (
      !fullName ||
      !projectName ||
      !email ||
      !telegram ||
      !website ||
      !service ||
      !message
    ) {
      return Response.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"CEXAID Website" <${process.env.ZOHO_EMAIL}>`,
      to: process.env.ZOHO_EMAIL,
      replyTo: email,
      subject: "New CEXAID Application",
      html: `
        <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:24px;">
          <div style="max-width:650px; margin:auto; background:#ffffff; border-radius:14px; padding:24px; border:1px solid #e5e7eb;">
            <h2 style="color:#0f172a;">New CEXAID Application</h2>
            <p><strong>Full Name:</strong> ${fullName}</p>
            <p><strong>Project Name:</strong> ${projectName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telegram:</strong> ${telegram}</p>
            <p><strong>Website:</strong> ${website}</p>
            <p><strong>Service Needed:</strong> ${service}</p>
            <hr style="border:none; border-top:1px solid #e5e7eb; margin:20px 0;" />
            <h3>Project Description</h3>
            <p style="line-height:1.7;">${message}</p>
          </div>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Zoho email error:", error);

    return Response.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}