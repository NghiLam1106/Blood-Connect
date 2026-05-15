import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class ChatbotService {
  private genAI!: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined in the environment variables');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async handleChat(chatDto: ChatDto) {
    const { history = [], message } = chatDto;

    try {
      if (!this.genAI) {
        throw new Error('Gemini AI is not properly configured. Check GEMINI_API_KEY.');
      }

      const systemInstruction = `Bạn là trợ lý AI của hệ thống kết nối hiến máu. Tên bạn là "Hana". Nhiệm vụ chính:

## 1. CHECK_ELIGIBILITY — Kiểm tra điều kiện hiến máu
Khi người dùng muốn kiểm tra điều kiện, hãy hỏi tuần tự từng câu (slot-filling), KHÔNG hỏi tất cả một lúc:
- Tuổi (18–60 tuổi mới được hiến)
- Cân nặng (≥45 kg)
- Lần hiến gần nhất (phải cách ít nhất 56 ngày / 84 ngày với nữ)
- Có đang mắc bệnh mãn tính không (tiểu đường, huyết áp cao, HIV, viêm gan B/C, ung thư)
- Có đang dùng thuốc kháng sinh, thuốc chống đông máu không
- Phụ nữ: có đang mang thai / cho con bú không

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

## QUAN TRỌNG:
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn (không dài quá 150 từ mỗi tin nhắn)
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
