import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        console.log(`[EMAIL] 📨 Sending email to: ${to} | Subject: ${subject}`);
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || `"ACE-HOSUR" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`[EMAIL] ✅ Success: Email sent to ${to} | MessageID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EMAIL] Error sending email:', error);
        return { success: false, error };
    }
};

export const sendLoginEmail = async (userEmail: string, userName: string) => {
    const subject = 'New Login Detected - ACE Cyber Security Portal';
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #6d28d9;">Hello ${userName},</h2>
            <p>A new login was detected for your account at <b>${new Date().toLocaleString()}</b>.</p>
            <p>If this was you, you can safely ignore this email.</p>
            <p>If you did not authorize this login, please contact the department administrator immediately.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">This is an automated notification from the CSE Cyber Security Academic Portal.</p>
        </div>
    `;
    return sendEmail(userEmail, subject, html);
};

export const sendApprovalEmail = async (
    userEmail: string, 
    userName: string, 
    requestType: 'Leave' | 'OD', 
    status: 'Approved' | 'Rejected',
    startDate: string,
    endDate: string,
    reason?: string
) => {
    const subject = `${requestType} Request ${status}`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: ${status === 'Approved' ? '#059669' : '#dc2626'};">Hello ${userName},</h2>
            <p>Your <b>${requestType}</b> request from <b>${new Date(startDate).toLocaleDateString()}</b> to <b>${new Date(endDate).toLocaleDateString()}</b> has been <b>${status.toLowerCase()}</b>.</p>
            ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ''}
            <p>Check the portal for more details.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">This is an automated notification from the CSE Cyber Security Academic Portal.</p>
        </div>
    `;
    return sendEmail(userEmail, subject, html);
};
