import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';
import nodemailer from 'nodemailer';

export const sendTestMail = async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return errorResponse(res, 'Recipient email required', null, 400);

    // Create a test transporter using your .env config
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `Test Mail <${process.env.NO_REPLY}>`,
      to,
      subject: 'Test Email from PMS',
      text: 'This is a test email from your PMS backend.',
      html: '<b>This is a test email from your PMS backend.</b>',
    };

    await transporter.sendMail(mailOptions);
    return successResponse(res, {}, 200, 'Test email sent successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to send test email', error, 500);
  }
};
