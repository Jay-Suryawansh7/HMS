const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('Testing email configuration...');
    console.log('Nodemailer:', nodemailer);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'jaysuryawanshi200716@gmail.com',
            pass: 'zela exyq ooze yarp',
        },
    });

    try {
        await transporter.verify();
        console.log('SMTP Connection successful!');

        const info = await transporter.sendMail({
            from: 'HMS <noreply@hms.com>',
            to: 'jaysuryawanshi200716@gmail.com',
            subject: 'Test Email from HMS',
            text: 'If you see this, email configuration is working!',
        });

        console.log('Test email sent:', info.messageId);
    } catch (error) {
        console.error('Email test failed:', error);
    }
}

testEmail();
