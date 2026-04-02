import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('mail_queue')
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { email, otp, name } = job.data;

    switch (job.name) {
      case 'sendOtpEmail':
        await this.mailerService.sendMail({
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
        console.log(`Đã gửi mail thành công cho: ${email}`);
        break;

      default:
        break;
    }
  }
}
