import nodemailer from "nodemailer";
import dns from "node:dns";

/**
 * sendEmail utility
 * Sends an email using Nodemailer and Gmail SMTP (or any custom SMTP configured in .env).
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
const sendEmail = async (options) => {
    let transporter;

    // Use Ethereal for local development if credentials aren't set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("\n⚠️ EMAIL_USER or EMAIL_PASS not set in .env.");
        console.warn("Generating Ethereal email test account for localhost development...");
        
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
    } else {
        transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // use SSL/TLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            },
            // The "Nuclear Fix" for Render: Surgical IPv4 lookup
            // Forces the specific SMTP lookup to ignore IPv6 records
            family: 4,
            lookup: (hostname, options, callback) => {
                dns.lookup(hostname, { family: 4 }, callback);
            },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 30000
        });
    }

    try {
        console.log(`📡 SMTP: Verifying connection to ${transporter.options.host}:${transporter.options.port}...`);
        await transporter.verify();
        console.log("✅ SMTP: Server is ready to take our messages");
    } catch (err) {
        console.error("❌ SMTP: Verification failed:", err);
        // We don't throw here to avoid crashing but we log it clearly
    }

    const mailOptions = {
        from: `"Rasoi Admin" <${process.env.EMAIL_USER || "test@ethereal.email"}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Email successfully sent to ${options.to}`);
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log("\n---------------------------------------------------------");
            console.log(`🔗 Ethereal Test Verification URL: ${nodemailer.getTestMessageUrl(info)}`);
            console.log("   (Click the link above to view your OTP email)");
            console.log("---------------------------------------------------------\n");
        }
    } catch (err) {
        console.error("❌ Error sending email:", err);
        throw err;
    }
};

export default sendEmail;
