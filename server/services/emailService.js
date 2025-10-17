const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send FIR confirmation email
const sendFIRConfirmationEmail = async (userEmail, userName, crimeData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Crime Alert System <noreply@crimealert.com>',
      to: userEmail,
      subject: 'FIR Request Confirmation - Crime Report Submitted',
      html: generateFIRConfirmationHTML(userName, crimeData)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('FIR confirmation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending FIR confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Generate HTML template for FIR confirmation
const generateFIRConfirmationHTML = (userName, crimeData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FIR Request Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .crime-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af; }
        .documents-section { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .status-badge { display: inline-block; padding: 4px 12px; background: #fbbf24; color: #92400e; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .important { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .document-list { list-style: none; padding: 0; }
        .document-list li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .document-list li:before { content: "✓ "; color: #10b981; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Crime Alert System</h1>
          <h2>FIR Request Confirmation</h2>
        </div>
        
        <div class="content">
          <p>Dear ${userName},</p>
          
          <p>Thank you for reporting a crime and requesting an FIR (First Information Report). Your report has been successfully submitted and is currently under review.</p>
          
          <div class="crime-details">
            <h3>📋 Crime Report Details</h3>
            <p><strong>Report ID:</strong> ${crimeData._id}</p>
            <p><strong>Title:</strong> ${crimeData.title}</p>
            <p><strong>Category:</strong> ${crimeData.category.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Severity:</strong> ${crimeData.severity.toUpperCase()}</p>
            <p><strong>Location:</strong> ${crimeData.location.address}</p>
            <p><strong>Date & Time:</strong> ${new Date(crimeData.dateTime).toLocaleString()}</p>
            <p><strong>FIR Status:</strong> <span class="status-badge">PENDING REVIEW</span></p>
          </div>
          
          <div class="documents-section">
            <h3>📄 Required Documents for FIR Filing</h3>
            <p>To complete your FIR filing process, please prepare the following documents:</p>
            
            <ul class="document-list">
              <li>Valid Government ID (Aadhaar Card, Passport, Driver's License)</li>
              <li>Address Proof (Utility Bill, Bank Statement, Rental Agreement)</li>
              <li>Photographs of the incident location (if available)</li>
              <li>Medical certificate (if applicable for assault cases)</li>
              <li>Witness statements (if any witnesses are available)</li>
              <li>Any relevant documents related to the incident</li>
              <li>Police verification form (will be provided at the station)</li>
            </ul>
          </div>
          
          <div class="important">
            <h4>⚠️ Important Information</h4>
            <ul>
              <li>Your FIR request is currently under review by our team</li>
              <li>You will receive another email once your FIR is approved</li>
              <li>Visit your nearest police station with the required documents</li>
              <li>Keep this email as reference for your FIR filing</li>
              <li>For emergencies, call 100 immediately</li>
            </ul>
          </div>
          
          <p>If you have any questions or need assistance, please contact our support team.</p>
          
          <p>Thank you for helping keep our community safe.</p>
          
          <p>Best regards,<br>
          Crime Alert System Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© 2024 Crime Alert System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Crime Alert System <noreply@crimealert.com>',
      to: userEmail,
      subject: 'Password Reset Request - Crime Alert System',
      html: generatePasswordResetHTML(userName, resetUrl)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Generate HTML template for password reset
const generatePasswordResetHTML = (userName, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .btn { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .important { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Crime Alert System</h1>
          <h2>Password Reset Request</h2>
        </div>
        
        <div class="content">
          <p>Dear ${userName},</p>
          
          <p>We received a request to reset your password for your Crime Alert System account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="btn">Reset Password</a>
          </div>
          
          <div class="important">
            <h4>⚠️ Important Security Information</h4>
            <ul>
              <li>This link will expire in 1 hour for security reasons</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Your password will not be changed until you click the link above</li>
              <li>For security, do not share this link with anyone</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #1e40af;">${resetUrl}</p>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>
          Crime Alert System Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© 2024 Crime Alert System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendFIRConfirmationEmail,
  sendPasswordResetEmail
};
