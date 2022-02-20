require('dotenv').config();
const sgMail = require('@sendgrid/mail');

async function sendEmail(data) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: data.to, // Change to your recipient
    from: 'No Reply<medeseeds@gmail.com>', // Change to your verified sender
    subject: data.subject,
    template_id: data.template_id,
    dynamic_template_data: data.dynamic_template_data,
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  sendEmail,
};
