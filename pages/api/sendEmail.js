import nodemailer from "nodemailer";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        // ✅ Destructure fields from frontend safely
        const {
            name,
            phone,
            email,
            message,
            FormSource,
            enquireType,
            rera_number,
            companyName,
            position,
            project_name,
            sourceNameProject,
            flatWingNumber,
            comment,
        } = req.body || {};

        // Helper: only render a row if value is truthy and not "-"
        const row = (label, value) => {
            if (!value || value === "-") return "";
            return `<tr><td><b>${label}:</b></td><td>${value}</td></tr>`;
        };

        // ✅ Transporter (use ENV variables)
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "pristineweb1@gmail.com",
                pass: "inel nmjn zowc fzya"
            },
        });

        // ✅ Email recipients
        const maillist = [
            "pristineweb1@gmail.com"
        ];

        // ✅ Email Template – only show fields with actual data
        const mailData = {
            from: `"Pristine Website" <${process.env.EMAIL_USER}>`,
            to: maillist,
            subject: `Pristine - New Contact Lead`,
            html: `
      <table style="width:100%; background:#f4f6ff; padding:30px; font-family:Arial;">
        <tr>
          <td align="center">
            <table style="width:600px; background:#fff; padding:25px; border-radius:10px;">
              <tr>
                <td align="center">
                  <h2 style="color:#2c2c84; margin:0;">Pristine</h2>
                  <p style="color:#f7931e;">New Contact Form Submission</p>
                  <hr/>
                </td>
              </tr>
              <tr>
                <td>
                  <table width="100%" cellpadding="8" cellspacing="0">
                    ${row("Name", name)}
                    ${row("Email", email)}
                    ${row("Phone", phone)}
                    ${row("Enquire Type", enquireType)}
                    ${row("Position", position)}
                    ${row("Company Name", companyName)}
                    ${row("RERA Number", rera_number)}
                    ${row("Project Name", project_name)}
                    ${row("Source Name & Project", sourceNameProject)}
                    ${row("Flat & Wing Number", flatWingNumber)}
                    ${row("Form Source", FormSource)}
                    ${row("Message", message)}
                    ${row("Comment", comment)}
                  </table>
                  <p style="margin-top:20px; color:#555;">
                    Our team will get in touch with this lead shortly.
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <hr/>
                  <p style="font-size:12px; color:#888;">
                    © 2026 Pristine. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      `,
        };

        // ✅ Send Mail
        await transporter.sendMail(mailData);

        return res.status(200).json({ message: "Email sent successfully" });

    } catch (error) {
        console.error("Mail Error:", error);
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
}