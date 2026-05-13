import api from './api'

export interface UpdateDonorProfilePayload {
	name?: string
	avatar?: string
	address?: string
	dateOfBirth?: string
	gender?: 'male' | 'female'
	bloodType?: string
	weight?: number
	unitBlood?: number
	status?: string
}

export async function updateDonorProfile(userId: string | number, payload: UpdateDonorProfilePayload) {
	try {
		const response = await api.patch(`/donors/update-donor/${userId}`, payload)
		return response.data
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
