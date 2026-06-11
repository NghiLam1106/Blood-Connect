import api from './api'

export interface UpdateDonorProfilePayload {
  name?: string
  avatar?: string
  address?: string
  provinceName?: string
  wardName?: string
  street?: string
  dob?: string
  gender?: 'MALE' | 'FEMALE'
  bloodType?: string
  weight?: number
  unitBlood?: number
  status?: string
  lastDonation?: string
}

export async function updateDonorProfile(userId: string | number, payload: UpdateDonorProfilePayload) {
  try {
    const response = await api.patch(`/donors/update-donor/${userId}`, payload)
    return response.data.data
  } catch (error: any) {
    const status = error?.response?.status
    if (status === 413) {
      throw new Error('Ảnh quá lớn, vui lòng chọn ảnh nhỏ hơn.')
    }
    if (status === 401) {
      throw new Error('Phiên đăng nhập đã hết hạn hoặc không hợp lệ.')
    }
    const message = error?.response?.data?.message
    if (Array.isArray(message)) {
      throw new Error(message[0])
    }
    throw new Error(message || 'Cập nhật thông tin thất bại.')
  }
}

export async function getDonorProfile(userId: string | number) {
  try {
    const response = await api.get(`/donors/get-donor/${userId}`)
    return response.data.data
  } catch (error: any) {
    const status = error?.response?.status
    if (status === 401) {
      throw new Error('Phiên đăng nhập đã hết hạn hoặc không hợp lệ.')
    }
    const message = error?.response?.data?.message
    if (Array.isArray(message)) {
      throw new Error(message[0])
    }
    throw new Error(message || 'Lấy thông tin hồ sơ thất bại.')
  }
}
