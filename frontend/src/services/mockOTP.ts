// Mock OTP Service – giả lập gửi OTP qua SMS
const OTP_STORE: Record<string, string> = {}

export async function sendOTP(email: string): Promise<{ success: boolean; message: string }> {
  // Generate 6-digit OTP
  const otp = String(Math.floor(100000 + Math.random() * 900000))
  OTP_STORE[email] = otp

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 1500))

  // Log để dev có thể test
  console.log(`[MockOTP] Gửi OTP đến ${email}: ${otp}`)

  return {
    success: true,
    message: `OTP đã gửi đến ${email}. (Môi trường dev: xem console để lấy OTP)`,
  }
}

export async function verifyOTP(
  email: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 800))

  const stored = OTP_STORE[email]

  // Luôn chấp nhận "123456" làm OTP demo
  if (code === '123456' || code === stored) {
    delete OTP_STORE[email]
    return { success: true, message: 'Xác thực thành công!' }
  }

  return { success: false, message: 'Mã OTP không đúng. Vui lòng thử lại.' }
}

export function getStoredOTP(phone: string): string | undefined {
  return OTP_STORE[phone]
}
