import SibApiV3Sdk from "sib-api-v3-sdk";

export async function sendApprovalEmail({ to, messName, secretKey }) {
  const client = SibApiV3Sdk.ApiClient.instance;
  client.authentications["api-key"].apiKey =
    process.env.BREVO_API_KEY;

  const api = new SibApiV3Sdk.TransactionalEmailsApi();

  await api.sendTransacEmail({
    sender: {
      email: process.env.BREVO_USER, // ✅ VERIFIED SENDER
      name: "BiteTrack Admin",
    },
    to: [{ email: to }],
    subject: "Mess Approved – Secret Key",
    htmlContent: `
      <div style="font-family:Arial;max-width:600px;margin:auto">
        <h2 style="color:#1e40af">Mess Approved Successfully</h2>

        <p>Dear <b>${messName}</b>,</p>

        <p>Your mess has been approved and your trial has started.</p>

        <p><b>Secret Key</b></p>
        <div style="padding:12px;background:#f1f5f9;border-radius:6px;font-size:16px">
          ${secretKey}
        </div>

        <p style="margin-top:12px;color:#475569">
          Please keep this key confidential.
        </p>

        <hr/>
        <p style="font-size:12px;color:#64748b">
          © BiteTrack | All rights reserved
        </p>
      </div>
    `,
  });
}


export async function sendRejectionEmail({ to, messName }) {
  const client = SibApiV3Sdk.ApiClient.instance;
  client.authentications["api-key"].apiKey =
    process.env.BREVO_API_KEY;

  const api = new SibApiV3Sdk.TransactionalEmailsApi();

  await api.sendTransacEmail({
    sender: {
      email: process.env.BREVO_USER,
      name: "BiteTrack Admin",
    },
    to: [{ email: to }],
    subject: "Mess Registration Update",
    htmlContent: `
      <div style="font-family:Arial;max-width:600px;margin:auto">
        <h2 style="color:#dc2626">Mess Registration Update</h2>

        <p>Dear <b>${messName}</b>,</p>

        <p>
          Thank you for your interest in BiteTrack.
          After reviewing your registration, we regret to inform you that
          your mess could not be approved at this time.
        </p>

        <p>
          You may reapply after making the necessary updates or
          contact our support team for more information.
        </p>

        <hr/>
        <p style="font-size:12px;color:#64748b">
          © BiteTrack | All rights reserved
        </p>
      </div>
    `,
  });
}
