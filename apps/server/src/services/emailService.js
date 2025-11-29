const nodemailer = require('nodemailer');

// Create transporter (configure with your SMTP settings)
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Plain reset token (will be included in URL)
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const resetUrl = `${process.env.PASSWORD_RESET_URL || 'http://localhost:5173/reset-password'}/${resetToken}`;

        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'HMS <noreply@hms.com>',
            to: email,
            subject: 'Password Reset Request - HMS',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
                        .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Password Reset Request</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>We received a request to reset your password for your Hospital Management System account.</p>
                            <p>Click the button below to reset your password:</p>
                            <p style="text-align: center;">
                                <a href="${resetUrl}" class="button">Reset Password</a>
                            </p>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
                            <p><strong>This link will expire in 1 hour.</strong></p>
                            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                            <div class="footer">
                                <p>This is an automated message. Please do not reply to this email.</p>
                                <p>© ${new Date().getFullYear()} Hospital Management System. All rights reserved.</p>
                            </div >
                        </div >
                    </div >
                </body >
                </html >
    `,
            text: `
                Password Reset Request

Hello,

    We received a request to reset your password for your Hospital Management System account.
                
                Please visit the following link to reset your password:
                ${resetUrl}
                
                This link will expire in 1 hour.
                
                If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                
                This is an automated message.Please do not reply to this email.
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to: ${email} `);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};

module.exports = {
    sendPasswordResetEmail
};
