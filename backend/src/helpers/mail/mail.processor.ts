import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Resend } from 'resend';
@Processor('mail_queue')
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }
  private readonly resend = new Resend(process.env.RESEND_API_KEY);
  async process(job: Job<any, any, string>): Promise<any> {
    const { email, otp, name } = job.data;
    console.log('--- [BullModule] Đang kết nối Redis với URL:', job.name);
    switch (job.name) {
      case 'sendOtpEmail':
        console.log('--- [MailProcessor] Bắt đầu gửi OTP email cho:', email);
        try {
          await this.resend.emails.send({
            from: `${process.env.RESEND_EMAIL}`,
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
          await this.resend.emails.send({
            from: `${process.env.RESEND_EMAIL}`,
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

      case 'sendHospitalVerifiedEmail':
        console.log('--- [MailProcessor] Bắt đầu gửi email xác thực bệnh viện cho:', email);
        try {
          await this.resend.emails.send({
            from: `${process.env.RESEND_EMAIL}`,
            to: email,
            subject: 'Tài khoản bệnh viện đã được xác thực - Red Bridge',
            html: `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#c0392b 0%,#e74c3c 100%);padding:32px 40px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <!-- Logo SVG -->
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;margin-right:12px;">
                    <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.15)"/>
                    <path d="M24 10 C24 10 14 22 14 29 C14 34.5 18.5 39 24 39 C29.5 39 34 34.5 34 29 C34 22 24 10 24 10Z" fill="white"/>
                    <path d="M19 29 Q24 24 29 29" stroke="#e74c3c" stroke-width="2" fill="none" stroke-linecap="round"/>
                  </svg>
                  <span style="color:white;font-size:26px;font-weight:700;vertical-align:middle;letter-spacing:0.5px;">Red Bridge</span>
                </td>
              </tr>
              <tr><td align="center" style="padding-top:6px;">
                <span style="color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Hệ thống kết nối hiến máu</span>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- STATUS BADGE -->
        <tr>
          <td align="center" style="padding:28px 40px 0;">
            <div style="display:inline-block;background:#eafaf1;border:1.5px solid #27ae60;border-radius:999px;padding:8px 24px;">
              <span style="color:#1e8449;font-weight:700;font-size:14px;">✔ Tài khoản đã được xác thực</span>
            </div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:28px 40px 32px;">
            <h2 style="margin:0 0 12px;font-size:22px;color:#1a1a2e;font-weight:700;">Xin chào, ${name}!</h2>
            <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7;">
              Chúng tôi vui mừng thông báo rằng tài khoản bệnh viện của bạn trên hệ thống
              <strong style="color:#c0392b;">Red Bridge</strong> đã được
              <strong style="color:#1e8449;">xác thực thành công</strong>.
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#444;line-height:1.7;">
              Bạn có thể đăng nhập và bắt đầu sử dụng hệ thống để kết nối với các người hiến máu ngay bây giờ.
            </p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:linear-gradient(135deg,#27ae60,#2ecc71);border-radius:8px;">
                  <a href="${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/" style="display:inline-block;padding:14px 36px;color:white;font-weight:700;font-size:15px;text-decoration:none;letter-spacing:0.3px;">Đăng nhập ngay →</a>
                </td>
              </tr>
            </table>

            <!-- Info box -->
            <div style="background:#fafafa;border-left:4px solid #27ae60;border-radius:0 8px 8px 0;padding:14px 18px;">
              <p style="margin:0;font-size:13px;color:#666;line-height:1.6;">
                🔒 Nếu bạn không yêu cầu xác thực này hoặc cần hỗ trợ, vui lòng liên hệ với quản trị viên hệ thống.
              </p>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8f9fa;border-top:1px solid #eee;padding:20px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#999;">© 2026 Red Bridge · Hệ thống kết nối hiến máu</p>
            <p style="margin:0;font-size:12px;color:#bbb;">Email này được gửi tự động, vui lòng không reply trực tiếp.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
          });
          console.log(`--- [MailProcessor] Đã gửi mail xác thực bệnh viện thành công cho: ${email}`);
        } catch (err) {
          console.error('--- [MailProcessor] LỖI gửi email xác thực bệnh viện:', err);
          throw err;
        }
        break;

      case 'sendHospitalRevokedEmail':
        console.log('--- [MailProcessor] Bắt đầu gửi email thu hồi xác thực bệnh viện cho:', email);
        try {
          await this.resend.emails.send({
            from: `${process.env.RESEND_EMAIL}`,
            to: email,
            subject: 'Thông báo thu hồi xác thực tài khoản - Red Bridge',
            html: `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#c0392b 0%,#e74c3c 100%);padding:32px 40px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;margin-right:12px;">
                    <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.15)"/>
                    <path d="M24 10 C24 10 14 22 14 29 C14 34.5 18.5 39 24 39 C29.5 39 34 34.5 34 29 C34 22 24 10 24 10Z" fill="white"/>
                    <path d="M19 29 Q24 24 29 29" stroke="#e74c3c" stroke-width="2" fill="none" stroke-linecap="round"/>
                  </svg>
                  <span style="color:white;font-size:26px;font-weight:700;vertical-align:middle;letter-spacing:0.5px;">Red Bridge</span>
                </td>
              </tr>
              <tr><td align="center" style="padding-top:6px;">
                <span style="color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Hệ thống kết nối hiến máu</span>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- STATUS BADGE -->
        <tr>
          <td align="center" style="padding:28px 40px 0;">
            <div style="display:inline-block;background:#fdf2f2;border:1.5px solid #e74c3c;border-radius:999px;padding:8px 24px;">
              <span style="color:#c0392b;font-weight:700;font-size:14px;">⚠ Xác thực tài khoản đã bị thu hồi</span>
            </div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:28px 40px 32px;">
            <h2 style="margin:0 0 12px;font-size:22px;color:#1a1a2e;font-weight:700;">Xin chào, ${name}!</h2>
            <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7;">
              Chúng tôi xin thông báo rằng quyền xác thực tài khoản bệnh viện của bạn trên hệ thống
              <strong style="color:#c0392b;">Red Bridge</strong> đã bị
              <strong style="color:#c0392b;">thu hồi</strong>.
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#444;line-height:1.7;">
              Tài khoản của bạn hiện <strong>không thể đăng nhập</strong> vào hệ thống. Nếu bạn cho rằng đây là nhầm lẫn hoặc cần được hỗ trợ, vui lòng liên hệ với quản trị viên.
            </p>

            <!-- Info box -->
            <div style="background:#fdf2f2;border-left:4px solid #e74c3c;border-radius:0 8px 8px 0;padding:14px 18px;">
              <p style="margin:0;font-size:13px;color:#666;line-height:1.6;">
                📩 Cần hỗ trợ? Hãy liên hệ với quản trị viên hệ thống để được giải quyết sớm nhất.
              </p>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8f9fa;border-top:1px solid #eee;padding:20px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#999;">© 2026 Red Bridge · Hệ thống kết nối hiến máu</p>
            <p style="margin:0;font-size:12px;color:#bbb;">Email này được gửi tự động, vui lòng không reply trực tiếp.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
          });
          console.log(`--- [MailProcessor] Đã gửi mail thu hồi xác thực bệnh viện thành công cho: ${email}`);
        } catch (err) {
          console.error('--- [MailProcessor] LỖI gửi email thu hồi xác thực bệnh viện:', err);
          throw err;
        }
        break;

      default:
        break;
    }
  }
}
