import { Injectable, NotFoundException } from "@nestjs/common";
import axios from "axios";
import { BloodGroup } from "../../enums/bloodTypes.enum";
import { HttpRequestStatus } from "../../enums/httpRequest.enum";
import { getCompatibleDonors } from "../../helpers/blood/bloodType";
import { convertLastDonationDays } from "../../helpers/Date/convertLastDonationDay";
import { calculateDistance } from "../../helpers/distance/calulateDistance";
import { DonorsRepository } from "../donors/repository/donors.respository";
import { RequestDto } from "./dto/request.dto";
import { HospitalRepository } from "./repository/hospital.repository";

@Injectable()
export class HospitalService {
  constructor(private readonly donorsRepository: DonorsRepository, private readonly hospitalRepository: HospitalRepository) { }

  async requestBlood(id: number, requestDto: RequestDto) {
    const { quantity, bloodType, urgency, notes } = requestDto;

    const requiredBloodMl: number = quantity * 250;

    const hospital = await this.hospitalRepository.findByUserId(Number(id));

    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    const lat = hospital.latitude;
    const lon = hospital.longitude;

    const compatibleBloodGroups = getCompatibleDonors(bloodType as BloodGroup);

    const compatibleDonors = await this.donorsRepository.findListDonor(compatibleBloodGroups, requiredBloodMl);

    const donorsWithDistance = compatibleDonors.map(donor => {
      let distance: any;
      if (donor.latitude !== null && donor.longitude !== null && lat !== null && lon !== null) {
        distance = calculateDistance(donor.latitude, donor.longitude, lat, lon);
      }
      return {
        ...donor,
        distance
      };
    });

    const aiDonors = donorsWithDistance.map((donor) => ({
      id: donor.id,
      distance: donor.distance ?? 9999,
      lastDonation: convertLastDonationDays(donor.lastDonation),
      responseRate: Number(donor.responseRate)
    }));

    try {
      const response = await axios.post("http://localhost:8000/predict", {
        donors: aiDonors,
        urgency: urgency
      });

      const aiResult = response.data;

      // Ghép thêm full donor info nếu cần
      const mergedResults = aiResult.results.map((item: any) => {
        const donorInfo = donorsWithDistance.find(
          (d) => d.id === item.id
        );

        return {
          ...donorInfo,
          ...item
        };
      });

      return {
        message: "Hiển thị danh sách donor thành công",
        status: HttpRequestStatus.SUCCESS,
        data: mergedResults
      };
    } catch (error: any) {
      return {
        status: HttpRequestStatus.ERROR,
        message: "Lỗi khi gửi donor"
      };
    }
  }
}
