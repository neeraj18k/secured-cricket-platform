const SibApiV3Sdk = require("sib_api_v3_sdk");

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendMail({ to, subject, html }) {
  return apiInstance.sendTransacEmail({
    sender: {
      name: "Secure Cricket",
      email: "mpneerajkumar28@gmail.com"
    },
    to: [{ email: to }],
    subject,
    htmlContent: html
  });
}

module.exports = { sendMail };
