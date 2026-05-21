import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DonationHistoryRepository } from '../donation-history/repository/donationHistory.repository';
import { DonorsRepository } from '../donors/repository/donors.respository';
import { HospitalRepository } from '../hospital/repository/hospital.repository';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class ChatbotService {
  private genAI!: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private readonly donationHistoryRepository: DonationHistoryRepository,
    private readonly donorsRepository: DonorsRepository,
    private readonly hospitalRepository: HospitalRepository,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined in the environment variables');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  // Detect xem user có đang hỏi về lịch sử hiến máu không
  private detectDonationHistoryIntent(message: string): boolean {
    const keywords = [
      'lịch sử', 'lịch sử hiến máu', 'đã hiến', 'bao nhiêu lần', 'những lần hiến',
      'hiến máu bao giờ', 'lần hiến', 'donation history', 'tiếp nhận máu',
      'danh sách hiến', 'số lần hiến', 'hiến máu của tôi', 'tôi đã hiến', 'khi nào hiến',
      'hiến gần nhất', 'hiến lần cuối', 'lần cuối hiến', 'bệnh viện nào hiến',
      'của bệnh viện tôi', 'bệnh viện tôi có', 'tiếp nhận', 'tại bệnh viện tôi',
    ];
    const lower = message.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  }

  // Detect xem donor có đang hỏi về điều kiện hiến máu không
  private detectEligibilityIntent(message: string): boolean {
    const keywords = [
      'điều kiện', 'điều kiện hiến máu', 'tôi có thể hiến', 'tôi có được hiến',
      'tôi có đủ điều kiện', 'kiểm tra điều kiện', 'đủ điều kiện', 'được hiến không',
      'hiến máu được không', 'tôi hiến được không', 'mình có được hiến',
      'check điều kiện', 'có thể hiến không', 'có hiến được không',
    ];
    const lower = message.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  }

  // Format thông tin cá nhân donor để inject vào prompt kiểm tra điều kiện
  private formatDonorProfile(donor: any): string {
    const parts: string[] = [];

    if (donor.name) parts.push(`Tên: ${donor.name}`);
    if (donor.bloodType) parts.push(`Nhóm máu: ${donor.bloodType}`);
    if (donor.gender) parts.push(`Giới tính: ${donor.gender === 'MALE' ? 'Nam' : 'Nữ'}`);

    if (donor.dob) {
      const dob = new Date(donor.dob);
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000));
      parts.push(`Ngày sinh: ${dob.toLocaleDateString('vi-VN')} (${age} tuổi)`);
    }

    if (donor.weight) parts.push(`Cân nặng: ${donor.weight} kg`);

    if (donor.lastDonation) {
      const last = new Date(donor.lastDonation);
      const daysSince = Math.floor((Date.now() - last.getTime()) / (24 * 3600 * 1000));
      parts.push(`Lần hiến gần nhất: ${last.toLocaleDateString('vi-VN')} (${daysSince} ngày trước)`);
    } else {
      parts.push('Lần hiến gần nhất: Chưa có (chưa từng hiến máu)');
    }

    if (donor.totalDonations !== undefined) {
      parts.push(`Tổng số lần hiến đã duyệt: ${donor.totalDonations} lần`);
    }

    if (donor.status) {
      parts.push(`Trạng thái hiến máu: ${donor.status === 'AVAILABLE' ? 'Sẵn sàng hiến' : 'Không sẵn sàng'}`);
    }

    return `[DỮ LIỆU DB - THÔNG TIN CÁ NHÂN NGƯỜI DÙNG]:\n${parts.join('\n')}`;
  }

  // Format dữ liệu lịch sử donor thành chuỗi ngắn gọn để nhét vào prompt
  private formatDonorHistory(records: any[]): string {
    if (!records || records.length === 0) {
      return '[DỮ LIỆU DB]: Người dùng này chưa có lịch sử hiến máu nào trong hệ thống.';
    }
    const lines = records.map((r, i) => {
      const date = new Date(r.donationDate).toLocaleDateString('vi-VN');
      const hospital = r.hospital?.user?.name ?? 'Không rõ';
      const status =
        r.status === 'ACCEPTED' ? 'Đã duyệt' :
          r.status === 'REJECTED' ? 'Bị từ chối' : 'Đang chờ duyệt';
      const bloodType = r.bloodType ?? 'Không rõ';
      const unit = r.unitBlood ? `${r.unitBlood} đơn vị` : '';
      return `${i + 1}. Ngày: ${date} | Bệnh viện: ${hospital} | Nhóm máu: ${bloodType} ${unit} | Trạng thái: ${status}`;
    });
    return `[DỮ LIỆU DB - LỊCH SỬ HIẾN MÁU CỦA BẠN (${records.length} lần)]:\n` + lines.join('\n');
  }

  // Format dữ liệu lịch sử hospital thành chuỗi ngắn gọn
  private formatHospitalHistory(records: any[]): string {
    if (!records || records.length === 0) {
      return '[DỮ LIỆU DB]: Bệnh viện này chưa có lịch sử tiếp nhận máu nào trong hệ thống.';
    }
    const accepted = records.filter((r) => r.status === 'ACCEPTED').length;
    const pending = records.filter((r) => r.status === 'PENDING').length;
    const rejected = records.filter((r) => r.status === 'REJECTED').length;

    const lines = records.slice(0, 10).map((r, i) => {
      const date = new Date(r.donationDate).toLocaleDateString('vi-VN');
      const donorName = r.donor?.user?.name ?? 'Không rõ';
      const status =
        r.status === 'ACCEPTED' ? 'Đã duyệt' :
          r.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt';
      return `${i + 1}. Ngày: ${date} | Người hiến: ${donorName} | Trạng thái: ${status}`;
    });

    const summary = `Tổng: ${records.length} lần | Đã duyệt: ${accepted} | Chờ: ${pending} | Từ chối: ${rejected}`;
    const note = records.length > 10 ? ` (Chỉ hiển thị 10 gần nhất)` : '';
    return `[DỮ LIỆU DB - LỊCH SỬ TIẾP NHẬN MÁU CỦA BỆNH VIỆN${note}]:\n${summary}\n` + lines.join('\n');
  }

  async handleChat(chatDto: ChatDto, userId: number | null, role: string | null) {
    const { history = [], message } = chatDto;

    try {
      if (!this.genAI) {
        throw new Error('Gemini AI is not properly configured. Check GEMINI_API_KEY.');
      }

      // Tìm context DB nếu user hỏi về lịch sử hiến máu
      let dbContext = '';
      if (this.detectDonationHistoryIntent(message)) {
        if (!userId || !role) {
          dbContext = '[THÔNG BÁO HỆ THỐNG]: Người dùng chưa đăng nhập. Hãy thông báo thân thiện rằng cần đăng nhập để xem lịch sử hiến máu cá nhân.';
        } else if (role === 'DONOR') {
          const donor = await this.donorsRepository.findByUserId(userId);
          if (donor) {
            const records = await this.donationHistoryRepository.findByDonorId(donor.id);
            dbContext = this.formatDonorHistory(records);
          } else {
            dbContext = '[DỮ LIỆU DB]: Không tìm thấy hồ sơ người hiến máu.';
          }
        } else if (role === 'HOSPITAL') {
          const hospital = await this.hospitalRepository.findByUserId(userId);
          if (hospital) {
            const records = await this.donationHistoryRepository.findByHospitalId(hospital.id);
            dbContext = this.formatHospitalHistory(records);
          } else {
            dbContext = '[DỮ LIỆU DB]: Không tìm thấy hồ sơ bệnh viện.';
          }
        }
      }

      // Tìm thông tin cá nhân nếu donor đăng nhập và hỏi về điều kiện hiến máu
      let donorProfileContext = '';
      if (this.detectEligibilityIntent(message) && userId && role === 'DONOR') {
        const donorProfile = await this.donorsRepository.getDonorById(userId);
        if (donorProfile) {
          donorProfileContext = this.formatDonorProfile(donorProfile);
        }
      }

      const systemInstruction = `Bạn là trợ lý AI của hệ thống kết nối hiến máu. Tên bạn là "Hana". Nhiệm vụ chính:

## 1. CHECK_ELIGIBILITY — Kiểm tra điều kiện hiến máu
${donorProfileContext
          ? `Người dùng đã đăng nhập và có thông tin cá nhân trong hệ thống. Hãy sử dụng dữ liệu bên dưới để kiểm tra ngay, KHÔNG cần hỏi lại các thông tin đã có. Chỉ hỏi thêm về bệnh lý / thuốc nếu chưa rõ:
${donorProfileContext}

Dựa vào dữ liệu trên, hãy đưa ra đánh giá sơ bộ về điều kiện hiến máu, sau đó hỏi thêm (nếu cần):
- Có đang mắc bệnh mãn tính không (tiểu đường, huyết áp cao, HIV, viêm gan B/C, ung thư)
- Có đang dùng thuốc kháng sinh, thuốc chống đông máu không
- (Nếu là nữ) Có đang mang thai / cho con bú không`
          : `Khi người dùng muốn kiểm tra điều kiện, hãy hỏi tuần tự từng câu (slot-filling), KHÔNG hỏi tất cả một lúc:
- Tuổi (18–60 tuổi mới được hiến)
- Cân nặng (≥45 kg)
- Lần hiến gần nhất (phải cách ít nhất 84 ngày)
- Có đang mắc bệnh mãn tính không (tiểu đường, huyết áp cao, HIV, viêm gan B/C, ung thư)
- Có đang dùng thuốc kháng sinh, thuốc chống đông máu không
- Phụ nữ: có đang mang thai / cho con bú không`}

Sau khi thu thập đủ thông tin, đưa ra kết luận rõ ràng:
- ĐỦ ĐIỀU KIỆN: [giải thích ngắn]
- CHƯA ĐỦ ĐIỀU KIỆN: [lý do + thời gian chờ nếu có]
- CẦN KIỂM TRA THÊM: [lý do cần gặp bác sĩ]

Luôn kết thúc bằng lời khuyến khích và nhắc đặt lịch hiến máu.

## 2. FAQ — Tư vấn chung về hiến máu
Trả lời các câu hỏi thường gặp về:
- Quy trình hiến máu (đăng ký → khám sàng lọc → hiến → nghỉ ngơi, ~45 phút tổng)
- Các nhóm máu và tính tương thích (A, B, AB, O; Rh+ Rh-)
- Lợi ích của hiến máu (sức khỏe tim mạch, kích thích tạo máu mới, kiểm tra sức khỏe miễn phí)
- Chuẩn bị trước khi hiến (ngủ đủ giấc, ăn nhẹ, uống nhiều nước, tránh rượu bia 24h)
- Sau khi hiến (nghỉ ngơi 10–15 phút, uống nước, tránh vận động mạnh 24h)
- Nhóm máu hiếm O- (cho được tất cả), AB+ (nhận được tất cả)

## 3. DONATION_HISTORY — Trả lời về lịch sử hiến máu
${dbContext
          ? `Dưới đây là dữ liệu THỰC từ cơ sở dữ liệu. Hãy trả lời dựa HOÀN TOÀN vào dữ liệu này, KHÔNG bịa thêm:
${dbContext}`
          : 'Nếu người dùng hỏi về lịch sử hiến máu, hãy trả lời dựa vào dữ liệu DB được cung cấp ở context. Nếu không có dữ liệu, thông báo thân thiện rằng không tìm thấy thông tin.'}

## QUAN TRỌNG:
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn (không dài quá 150 từ mỗi tin nhắn)
- Với dữ liệu DB: trình bày rõ ràng, dễ đọc (dùng danh sách nếu có nhiều mục)
- Nếu câu hỏi về triệu chứng bất thường hoặc bệnh nặng, luôn khuyên gặp bác sĩ
- Không bịa thông tin y tế. Nếu không chắc, nói thẳng và hướng dẫn tìm thêm
- Cuối mỗi câu trả lời về FAQ, đề xuất 1–2 câu hỏi liên quan người dùng có thể hỏi tiếp`;

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemInstruction,
      });

      const formattedHistory = history.map((msg) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      }));

      const chatSession = model.startChat({
        history: formattedHistory,
      });

      const result = await chatSession.sendMessage(message);
      return {
        response: result.response.text()
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new InternalServerErrorException('Lỗi kết nối với AI Service. Vui lòng thử lại sau.');
    }
  }
}
