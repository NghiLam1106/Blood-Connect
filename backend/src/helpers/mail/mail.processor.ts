import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Resend } from 'resend';
@Processor('mail_queue')
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }
  private readonly resend = new Resend('re_YqrKSRYQ_Ja31ATCjKeTJnAW5PDTpXasF');
  async process(job: Job<any, any, string>): Promise<any> {
    const { email, otp, name } = job.data;
    console.log('--- [BullModule] Đang kết nối Redis với URL:', job.name);
    switch (job.name) {
      case 'sendOtpEmail':
        console.log('--- [MailProcessor] Bắt đầu gửi OTP email cho:', email);
        try {
          await this.resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Mã xác thực OTP',
            html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #eee;">
            <h2>Chào bạn, ${name}!</h2>
            <p>Mã OTP xác nhận đăng ký tài khoản của bạn là:</p>
            <div style="font-size: 30px; font-weight: bold; color: #2c3e50; background: #f1f2f6; text-align: center; padding: 10px;">
              ${otp}
            </div>
            <p>Mã này có hiệu lực trong 5 phút. Vui lòng không tiết lộ mã này.</p>
          </div>`,
          });
          console.log(`--- [MailProcessor] Đã gửi mail thành công cho: ${email}`);
        } catch (err) {
          console.error('--- [MailProcessor] LỖI gửi OTP email:', err);
          throw err;
        }
        break;

      case 'sendForgotPasswordEmail':
        console.log('--- [MailProcessor] Bắt đầu gửi ForgotPassword email cho:', email);
        try {
          await this.mailerService.sendMail({
            to: email,
            subject: 'Mã OTP xác nhận quên mật khẩu',
            html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #eee;">
            <h2>Chào bạn, ${name}!</h2>
            <p>Mã OTP xác nhận quên mật khẩu của bạn là:</p>
            <div style="font-size: 30px; font-weight: bold; color: #2c3e50; background: #f1f2f6; text-align: center; padding: 10px;">
              ${otp}
            </div>
            <p>Mã này có hiệu lực trong 5 phút. Vui lòng không tiết lộ mã này.</p>
          </div>`,
          });
          console.log(`--- [MailProcessor] Đã gửi mail thành công cho: ${email}`);
        } catch (err) {
          console.error('--- [MailProcessor] LỖI gửi ForgotPassword email:', err);
          throw err;
        }
        break;

      default:
        break;
    }
  }
}
