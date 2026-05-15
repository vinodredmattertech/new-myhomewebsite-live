import nodemailer from "nodemailer";
import { IncomingForm } from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        console.error("Form Error:", err);
        return res.status(500).json({ error: "File parsing error" });
      }

      const data = JSON.parse(fields.data || "{}");

      const { name, phone, email, message, position, companyName, rera_number, FormSource, project_name, comment } = data;

      // Helper: only render a row if value is truthy and not "-"
      const row = (label, value) => {
        if (!value || value === "-") return "";
        return `<tr><td><b>${label}:</b></td><td>${value}</td></tr>`;
      };

      // ✅ handle file (array or object)
      let file = files["files.resume"];
      if (Array.isArray(file)) file = file[0];

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "pristineweb1@gmail.com",
          pass: "inel nmjn zowc fzya"
        },
      });

      const mailData = {
        from: process.env.EMAIL_USER,
        to: "pristineweb1@gmail.com",
        subject: "Pristine Job Application",
        html: `
          <table style="width:100%; background:#f4f6ff; padding:30px; font-family:Arial;">
        <tr>
          <td align="center">
            <table style="width:600px; background:#fff; padding:25px; border-radius:10px;">

              <tr>
                <td align="center">
                  <h2 style="color:#2c2c84; margin:0;">Pristine</h2>
                 <p style="color:#f7931e; font-size:16px; font-weight:600;">
  ${name || "A user"} has submitted a ${position ? "Job Application" : "Contact Form"}
</p>

                  <hr/>
                </td>
              </tr>

              <tr>
                <td>
                  <table width="100%" cellpadding="8" cellspacing="0">
                    ${row("Name", name)}
                    ${row("Email", email)}
                    ${row("Phone", phone)}
                    ${row("Position", position)}
                    ${row("Company Name", companyName)}
                    ${row("RERA Number", rera_number)}
                    ${row("Project Name", project_name)}
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
        attachments: file
          ? [
            {
              filename: file.originalFilename || "resume",
              path: file.filepath,
            },
          ]
          : [],
      };

      await transporter.sendMail(mailData);

      // ✅ optional cleanup
      if (file?.filepath) {
        fs.unlink(file.filepath, () => { });
      }

      return res.status(200).json({ message: "Email sent" });

    } catch (error) {
      console.error("MAIL ERROR:", error);
      return res.status(500).json({
        message: "Error sending email",
        error: error.message,
      });
    }
  });
}