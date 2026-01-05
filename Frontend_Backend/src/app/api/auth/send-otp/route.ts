import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    console.log('Generated OTP:', otp);
    console.log('OTP Expiry:', otpExpiry);

    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      user = new User({
        email: email.toLowerCase(),
        otp,
        otpExpiry,
        firstName: '',
        lastName: '',
      });
      console.log('Creating new user');
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      console.log('Updating existing user');
    }

    await user.save();
    
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        auth: {
          user: process.env.MY_EMAIL,
          pass: process.env.MY_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.MY_EMAIL,
        to: email,
        subject: "Your AlgoGrid Login Code",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
                .content { padding: 40px 30px; text-align: center; }
                .otp-code { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 30px 0; font-size: 36px; font-weight: bold; color: #333; letter-spacing: 8px; font-family: 'Courier New', monospace; }
                .message { color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; text-align: left; }
                .warning p { margin: 0; color: #856404; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 AlgoGrid</h1>
                </div>
                <div class="content">
                  <p class="message">Hello! Here's your verification code to access your account:</p>
                  <div class="otp-code">${otp}</div>
                  <p class="message">This code will expire in <strong>10 minutes</strong>.</p>
                  <div class="warning">
                    <p><strong>⚠️ Security Notice:</strong> Never share this code with anyone. AlgoGrid will never ask you for this code via phone or email.</p>
                  </div>
                </div>
                <div class="footer">
                  <p>If you didn't request this code, please ignore this email.</p>
                  <p>&copy; ${new Date().getFullYear()} AlgoGrid. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      await transporter.sendMail(mailOptions);
      
      console.log(`✅ Email sent successfully to ${email}`);
      console.log(`OTP: ${otp}`);
    } catch (emailError) {
      console.error('❌ Failed to send email. Error details:');
      console.error('Error message:', emailError instanceof Error ? emailError.message : 'Unknown error');
      console.error('Full error:', emailError);
      console.log(`\n🔐 FALLBACK - OTP for ${email}: ${otp}\n`);
    }

    return NextResponse.json(
      { message: 'OTP sent successfully', email },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
