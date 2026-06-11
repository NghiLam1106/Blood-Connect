import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { VietnamAddressField } from '../../components/common/VietnamAddressField'
import { ProfileDonationTimeline } from '../../components/donor/ProfileDonationTimeline'
import { BLOOD_TYPES } from '../../constants/bloodTypes'
import { useAvatarColor } from '../../hooks/useAvatarColor'
import { useDonorAvailability } from '../../hooks/useDonorAvailability'
import { useUserInitial } from '../../hooks/useUserInitial'
import { uploadImageToCloudinary } from '../../services/cloudinary.service'
import { getDonorProfile, updateDonorProfile } from '../../services/donor.service'
import { useStore } from '../../store/useStore'
import { getAgeFromDOB, getMaxDonation, getSuggestedAmount, getValidOptions } from '../../utils/bloodDonation'

const DONATION_INTERVAL_DAYS = 84

type SuggestedBloodVolume = 250 | 350 | 450
type DonorGender = 'MALE' | 'FEMALE'




const toDate = (value?: string) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDate = (value?: string) => {
  const parsed = toDate(value)
  if (!parsed) return '—'
  return parsed.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatDateForInput = (value?: string) => {
  const parsed = toDate(value)
  if (!parsed) return ''
  return parsed.toISOString().slice(0, 10)
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const getRankMeta = (totalDonations: number) => {
  if (totalDonations >= 12) return { label: 'Donor xuất sắc', description: 'Từ 12 lần hiến trở lên.' }
  if (totalDonations >= 5) return { label: 'Donor thân thiết', description: 'Từ 5 đến 11 lần hiến.' }
  return { label: 'Người mới', description: 'Dưới 5 lần hiến.' }
}

export default function Profile() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { user, isAuthenticated, updateUser } = useStore()
  const { isAvailable, isToggling: isTogglingAvailable, toggle: handleToggleAvailable } = useDonorAvailability()

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    addressDetails: {
      provinceCode: '',
      provinceName: user?.provinceName ?? '',
      wardCode: '',
      wardName: user?.wardName ?? '',
      street: user?.street ?? '',
    },
    dob: formatDateForInput(user?.dob),
    gender: user?.gender ?? '',
    bloodType: user?.bloodType ?? '',
    weight: typeof user?.weight === 'number' && user.weight > 0 ? user.weight : null,
    unitBlood: typeof user?.unitBlood === 'number' && user.unitBlood > 0 ? user.unitBlood : null,
    lastDonation: formatDateForInput(user?.lastDonation),
  })
  const [dobError, setDobError] = useState<string | null>(null)
  const [healthChecks, setHealthChecks] = useState({
    noBloodDisease: false,
    femaleCondition: false,
    spacingCondition: false,
    voluntary: false,
  })
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [showAddressValidation, setShowAddressValidation] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (!user) return
    setProfileForm({
      name: user.name ?? '',
      addressDetails: {
        provinceCode: '',
        provinceName: user.provinceName ?? '',
        wardCode: '',
        wardName: user.wardName ?? '',
        street: user.street ?? '',
      },
      dob: formatDateForInput(user.dob),
      gender: user.gender ?? '',
      bloodType: user.bloodType ?? '',
      weight: typeof user.weight === 'number' && user.weight > 0 ? user.weight : null,
      unitBlood: typeof user.unitBlood === 'number' && user.unitBlood > 0 ? user.unitBlood : null,
      lastDonation: formatDateForInput(user.lastDonation),
    })
  }, [user])


  useEffect(() => {
  if (!user?.id) return;

  let mounted = true;

  const fetchProfile = async () => {
    try {
      const fresh = await getDonorProfile(user.id);

      if (mounted && fresh) {
        updateUser(fresh);
      }
    } catch (err) {
      console.error('Failed to fetch donor profile', err);
    }
  };

  fetchProfile();

  return () => {
    mounted = false;
  };
}, [user?.id, updateUser]);

  if (!user) return null

  const avatarSrc = previewAvatar ?? (user.avatar && user.avatar !== 'null' && user.avatar !== 'undefined' ? user.avatar : null)
  const avatarColorClass = useAvatarColor(user?.name)
  const initial = useUserInitial(user?.name)
  const totalDonations = user.totalDonations ?? 0
  const lastDonationDate = toDate(user.lastDonation)
  const nextEligibleDate = lastDonationDate ? addDays(lastDonationDate, DONATION_INTERVAL_DAYS) : null
  const today = startOfDay(new Date())
  const isEligibleNow = nextEligibleDate ? startOfDay(nextEligibleDate).getTime() <= today.getTime() : true
  const remainingDays = nextEligibleDate ? Math.max(0, Math.ceil((startOfDay(nextEligibleDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : 0
  const rankMeta = getRankMeta(totalDonations)
  const isDobVerified = Boolean(user.dobVerified)

  const hasWeightValue = typeof profileForm.weight === 'number' && !Number.isNaN(profileForm.weight)
  const hasGenderValue = profileForm.gender === 'MALE' || profileForm.gender === 'FEMALE'
  const selectedGender = hasGenderValue ? (profileForm.gender as DonorGender) : null
  const weightEligibilityError =
    hasWeightValue && !hasGenderValue
      ? null
      : hasWeightValue && selectedGender === 'MALE' && profileForm.weight !== null && profileForm.weight < 45
        ? 'Nam giới cần tối thiểu 45 kg để hiến máu'
        : hasWeightValue && selectedGender === 'FEMALE' && profileForm.weight !== null && profileForm.weight < 42
          ? 'Nữ giới cần tối thiểu 42 kg để hiến máu'
          : null
  const genderWeightHint = hasWeightValue && !hasGenderValue
    ? 'Vui lòng chọn giới tính để xác định điều kiện phù hợp' : null

  const isWeightValidForDonation = hasWeightValue && hasGenderValue && !weightEligibilityError

  const suggestedVolume = isWeightValidForDonation && selectedGender && profileForm.weight !== null
    ? getSuggestedAmount(profileForm.weight, selectedGender) : null

  const allowedVolumes =
    isWeightValidForDonation && selectedGender && profileForm.weight !== null
      ? (getValidOptions(profileForm.weight, selectedGender) as SuggestedBloodVolume[]) : []

  const maxDonationByWeight = profileForm.weight !== null
    ? getMaxDonation(profileForm.weight) : null

  const addressErrors = {
    province: profileForm.addressDetails.provinceName ? '' : 'Vui lòng chọn tỉnh/thành phố.',
    ward: profileForm.addressDetails.wardName ? '' : 'Vui lòng chọn xã/phường.',
  }
  const isAddressValid = !addressErrors.province && !addressErrors.ward
  const formattedAddress = [profileForm.addressDetails.street.trim(), profileForm.addressDetails.wardName, profileForm.addressDetails.provinceName]
    .filter(Boolean)
    .join(', ')

  const showFemaleCondition = selectedGender === 'FEMALE'
  const showSpacingCondition = totalDonations > 0
  const areHealthChecksValid =
    healthChecks.noBloodDisease &&
    healthChecks.voluntary &&
    (!showFemaleCondition || healthChecks.femaleCondition) &&
    (!showSpacingCondition || healthChecks.spacingCondition)

  const completionFields = [
    { label: 'Họ và tên', value: user.name },
    { label: 'Email', value: user.email },
    { label: 'Số điện thoại', value: user.phone },
    { label: 'Nhóm máu', value: user.bloodType },
    { label: 'Ảnh đại diện', value: user.avatar },
    { label: 'Ngày sinh', value: user.dob },
    { label: 'Địa chỉ/Khu vực', value: user.address },
    { label: 'Cân nặng', value: user.weight && user.weight > 0 ? String(user.weight) : '' },
  ]
  const missingFields = completionFields.filter((field) => !field.value).map((field) => field.label)
  const completion = Math.round(((completionFields.length - missingFields.length) / completionFields.length) * 100)

  const openAvatarPicker = () => {
    setAvatarError(null)
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setAvatarError('Vui lòng chọn một file ảnh hợp lệ.')
      event.target.value = ''
      return
    }
    if (!user?.id) {
      setAvatarError('Không tìm thấy thông tin người dùng.')
      event.target.value = ''
      return
    }
    setIsUploadingAvatar(true)
    setAvatarError(null)
    try {
      const secureUrl = await uploadImageToCloudinary(file)
      setPreviewAvatar(secureUrl)
      await updateDonorProfile(user.id, { avatar: secureUrl })
      updateUser({ avatar: secureUrl })
    } catch (error) {
      setPreviewAvatar(null)
      setAvatarError(error instanceof Error ? error.message : 'Cập nhật ảnh đại diện thất bại.')
    } finally {
      setIsUploadingAvatar(false)
      event.target.value = ''
    }
  }

  const handleDobBlur = () => {
    if (!profileForm.dob) return setDobError(null)
    const dob = new Date(profileForm.dob)
    if (Number.isNaN(dob.getTime())) return setDobError('Ngày sinh không hợp lệ.')
    const age = getAgeFromDOB(dob)
    if (age < 18) return setDobError('Người hiến máu phải từ 18 tuổi trở lên')
    if (age > 60) return setDobError('Người hiến máu không quá 60 tuổi')
    setDobError(null)
  }

  const handleProfileSave = async () => {
    if (!user?.id) return setProfileError('Không tìm thấy thông tin người dùng.')
    if (!profileForm.name.trim()) return setProfileError('Vui lòng nhập họ tên.')
    if (!profileForm.bloodType) return setProfileError('Vui lòng chọn nhóm máu.')
    if (!isAddressValid) {
      setShowAddressValidation(true)
      return setProfileError('Vui lòng chọn đầy đủ Tỉnh/Thành phố và Xã/Phường.')
    }
    if (!hasGenderValue) return setProfileError('Vui lòng chọn giới tính.')
    if (!profileForm.weight) return setProfileError('Vui lòng nhập cân nặng.')
    if (weightEligibilityError) return setProfileError(weightEligibilityError)
    if (!profileForm.unitBlood || !allowedVolumes.includes(profileForm.unitBlood as SuggestedBloodVolume)) {
      return setProfileError('Vui lòng chọn lượng máu muốn hiến hợp lệ.')
    }
    if (dobError) return setProfileError(dobError)
    if (!areHealthChecksValid) return setProfileError('Vui lòng xác nhận tất cả điều kiện hiến máu.')

    setIsSavingProfile(true)
    setProfileError(null)
    setProfileSuccess(null)
    try {
      const response = await updateDonorProfile(user.id, {
        name: profileForm.name.trim(),
        address: formattedAddress,
        provinceName: profileForm.addressDetails.provinceName || undefined,
        wardName: profileForm.addressDetails.wardName || undefined,
        street: profileForm.addressDetails.street.trim() || undefined,
        dob: profileForm.dob || undefined,
        gender: hasGenderValue ? (profileForm.gender as DonorGender) : undefined,
        bloodType: profileForm.bloodType,
        weight: profileForm.weight,
        unitBlood: profileForm.unitBlood,
        lastDonation: profileForm.lastDonation || undefined,
      })
      updateUser(response)
      setProfileSuccess('Cập nhật thông tin thành công!')
      setIsEditingProfile(false)
      setTimeout(() => setProfileSuccess(null), 3000)
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Cập nhật thông tin thất bại.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Tài khoản donor</p>
          <h1 className="mt-2 text-3xl font-extrabold text-dark">Hồ sơ cá nhân</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">Quản lý thông tin liên hệ, nhóm máu và trạng thái sẵn sàng hiến máu của bạn.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={openAvatarPicker} disabled={isUploadingAvatar} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-dark shadow-sm transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60">
            {isUploadingAvatar ? 'Đang cập nhật...' : 'Đổi ảnh đại diện'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <button type="button" onClick={() => { setProfileError(null); setProfileSuccess(null); setIsEditingProfile((v) => !v) }} className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90">
            {isEditingProfile ? 'Đóng form' : 'Cập nhật thông tin'}
          </button>
        </div>
      </div>

      {isEditingProfile ? (
        <div className="rounded-3xl border border-primary/10 bg-white p-8 shadow-sm">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-extrabold text-dark">Cập nhật thông tin cá nhân</h3>
            <p className="mt-1 text-sm text-gray-500">Chỉ các trường donor hỗ trợ mới có thể chỉnh sửa ở đây.</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-bold text-dark">Họ và tên</span>
              <input value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white" placeholder="Nhập họ và tên" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-dark">Nhóm máu</span>
              <select value={profileForm.bloodType} onChange={(e) => setProfileForm((p) => ({ ...p, bloodType: e.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white">
                <option value="">Chọn nhóm máu</option>
                {BLOOD_TYPES.map((bloodType) => <option key={bloodType} value={bloodType}>{bloodType}</option>)}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-dark">Ngày sinh</span>
              <input type="date" value={profileForm.dob} disabled={isDobVerified} onChange={(e) => setProfileForm((p) => ({ ...p, dob: e.target.value }))} onBlur={handleDobBlur} aria-invalid={Boolean(dobError)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100" />
              {dobError ? <p className="text-xs font-semibold text-primary">{dobError}</p> : null}
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-dark">Giới tính</span>
              <select value={profileForm.gender} onChange={(e) => setProfileForm((prev) => {
                const nextGender = e.target.value as DonorGender | ''
                const nextWeight = prev.weight
                if (!nextGender || typeof nextWeight !== 'number') return { ...prev, gender: nextGender, unitBlood: null }
                const nextSuggested = getSuggestedAmount(nextWeight, nextGender)
                return { ...prev, gender: nextGender, unitBlood: (nextSuggested as SuggestedBloodVolume | null) ?? null }
              })} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white">
                <option value="">Chọn giới tính</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
              </select>
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-bold text-dark">Lần hiến máu cuối</span>
              <input
                type="date"
                value={profileForm.lastDonation}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setProfileForm((p) => ({ ...p, lastDonation: e.target.value }))}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
              />
              <p className="text-xs text-gray-400">Dùng để hệ thống tính ngày bạn có thể hiến tiếp theo.</p>
            </label>

            <div className="space-y-2 md:col-span-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-bold text-dark">Cân nặng (kg)</span>
                  <input
                    type="number"
                    min="42"
                    step="1"
                    value={profileForm.weight ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value.trim()
                      const nextWeight = raw === '' ? null : Number(raw)
                      setProfileForm((prev) => {
                        if (nextWeight === null || Number.isNaN(nextWeight)) return { ...prev, weight: null, unitBlood: null }
                        if (prev.gender === 'MALE' || prev.gender === 'FEMALE') {
                          const nextSuggested = getSuggestedAmount(nextWeight, prev.gender)
                          return { ...prev, weight: nextWeight, unitBlood: (nextSuggested as SuggestedBloodVolume | null) ?? null }
                        }
                        return { ...prev, weight: nextWeight, unitBlood: null }
                      })
                    }}
                    aria-invalid={Boolean(weightEligibilityError)}
                    aria-describedby={isWeightValidForDonation && suggestedVolume ? 'blood-volume-suggestion' : undefined}
                    className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition [appearance:textfield] focus:border-primary focus:bg-white"
                    placeholder="Nhập cân nặng"
                  />
                </label>
                {isWeightValidForDonation && suggestedVolume && maxDonationByWeight ? (
                  <label className="space-y-2">
                    <span className="text-sm font-bold text-dark">Lượng máu muốn hiến</span>
                    <select value={profileForm.unitBlood ?? suggestedVolume} onChange={(e) => setProfileForm((prev) => ({ ...prev, unitBlood: Number(e.target.value) as SuggestedBloodVolume }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white">
                      {allowedVolumes.map((volume) => <option key={volume} value={volume}>{volume}ml</option>)}
                    </select>
                  </label>
                ) : <div />}
              </div>
              {genderWeightHint ? <p className="text-xs font-semibold text-gray-500">{genderWeightHint}</p> : null}
              {weightEligibilityError ? <p className="text-xs font-semibold text-primary">{weightEligibilityError}</p> : null}
              {isWeightValidForDonation && suggestedVolume && maxDonationByWeight ? <div id="blood-volume-suggestion" className="w-full rounded-xl border border-success/20 bg-success/10 px-3 py-2 text-xs font-semibold text-success md:w-[calc(50%-0.5rem)]">Lượng máu đề xuất: {suggestedVolume} ml (≤ {maxDonationByWeight} ml theo cân nặng của bạn)</div> : null}
              {isWeightValidForDonation && suggestedVolume && maxDonationByWeight ? <p className="text-xs text-gray-500">Lượng máu thực tế sẽ được nhân viên y tế xác nhận trước khi hiến.</p> : null}
            </div>

            <VietnamAddressField value={profileForm.addressDetails} errors={showAddressValidation ? addressErrors : undefined} onChange={(nextAddress) => {
              if (showAddressValidation) setShowAddressValidation(false)
              setProfileForm((prev) => ({ ...prev, addressDetails: nextAddress }))
            }} />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
            <h4 className="text-sm font-extrabold text-dark">Xác nhận điều kiện hiến máu</h4>
            <p className="mt-1 text-xs text-gray-500">Bạn cần đáp ứng tất cả các điều kiện dưới đây.</p>
            <div className="mt-4 space-y-3">
              <label className="flex items-start gap-3 text-sm text-gray-600"><input type="checkbox" checked={healthChecks.noBloodDisease} onChange={(e) => setHealthChecks((p) => ({ ...p, noBloodDisease: e.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30" /><span>Tôi không bị nhiễm HIV, viêm gan B, viêm gan C, giang mai hoặc các bệnh lây qua đường máu khác</span></label>
              {showFemaleCondition ? <label className="flex items-start gap-3 text-sm text-gray-600"><input type="checkbox" checked={healthChecks.femaleCondition} onChange={(e) => setHealthChecks((p) => ({ ...p, femaleCondition: e.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30" /><span>Tôi không đang mang thai hoặc nuôi con nhỏ dưới 1 tuổi</span></label> : null}
              {showSpacingCondition ? <label className="flex items-start gap-3 text-sm text-gray-600"><input type="checkbox" checked={healthChecks.spacingCondition} onChange={(e) => setHealthChecks((p) => ({ ...p, spacingCondition: e.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30" /><span>Lần hiến máu toàn phần gần nhất cách đây ít nhất 12 tuần, hoặc hiến thành phần máu cách đây ít nhất 3 tuần</span></label> : null}
              <label className="flex items-start gap-3 text-sm text-gray-600"><input type="checkbox" checked={healthChecks.voluntary} onChange={(e) => setHealthChecks((p) => ({ ...p, voluntary: e.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30" /><span>Tôi hiến máu hoàn toàn tự nguyện</span></label>
            </div>
          </div>

          {profileError ? <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-primary">{profileError}</div> : null}
          {profileSuccess ? <div className="mt-4 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">{profileSuccess}</div> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={handleProfileSave} disabled={isSavingProfile || !areHealthChecksValid} aria-disabled={isSavingProfile || !areHealthChecksValid} title={!areHealthChecksValid ? 'Vui lòng xác nhận tất cả điều kiện' : undefined} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">{isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
            <button type="button" onClick={() => setIsEditingProfile(false)} className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-dark shadow-sm transition hover:border-primary/30 hover:text-primary">Hủy</button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-red-50 via-white to-white p-8 shadow-sm lg:col-span-2">
          <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-bl-full bg-primary/5" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex shrink-0 items-center gap-4">
              <div className="relative">
                <div className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white shadow-sm ${avatarColorClass}`}>
                  {avatarSrc ? <img src={avatarSrc} alt={user.name} className="h-full w-full object-cover" /> : <span className="text-3xl font-extrabold text-white">{initial}</span>}
                </div>
                <div className={`absolute -bottom-2 -right-2 h-6 w-6 rounded-full border-2 border-white ${isAvailable ? 'bg-success' : 'bg-gray-400'}`} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-extrabold text-dark">{user.name}</h2>
                <span tabIndex={0} aria-label={`Cấp bậc donor: ${rankMeta.label}`} title={rankMeta.description} className="cursor-help rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30">{rankMeta.label}</span>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Nhóm {user.bloodType ?? 'Chưa cập nhật'}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.status === 'AVAILABLE' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>{user.status === 'AVAILABLE' ? 'Đang sẵn sàng hiến máu' : 'Tạm ngừng hỗ trợ'}</span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">Cập nhật đầy đủ hồ sơ giúp bệnh viện và hệ thống liên hệ với bạn nhanh hơn khi có yêu cầu khẩn cấp phù hợp.</p>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white/80 p-4"><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Tổng hiến</p><p className="mt-2 text-2xl font-extrabold text-dark">{totalDonations}<span className="ml-1 text-sm font-semibold text-gray-400">lần</span></p></div>
                <div className="rounded-2xl border border-gray-100 bg-white/80 p-4"><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Lần gần nhất</p><p className="mt-2 text-sm font-bold text-dark">{formatDate(user.lastDonation)}</p></div>
                <div className="rounded-2xl border border-gray-100 bg-white/80 p-4"><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Hiến tiếp theo</p><p className={`mt-2 text-sm font-bold ${isEligibleNow ? 'text-success' : 'text-dark'}`}>{isEligibleNow ? 'Sẵn sàng' : formatDate(nextEligibleDate?.toISOString())}</p></div>
                <div className="rounded-2xl border border-gray-100 bg-white/80 p-4"><div className="flex items-center gap-2"><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Hoàn thiện hồ sơ</p>{missingFields.length > 0 ? <span tabIndex={0} role="note" aria-label={`Thiếu các trường: ${missingFields.join(', ')}`} title={`Thiếu: ${missingFields.join(', ')}`} className="cursor-help rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300">?</span> : null}</div><p className="mt-2 text-2xl font-extrabold text-dark">{completion}%</p></div>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-dark">Trạng thái tài khoản</h3>
          <p className="mt-2 text-sm text-gray-500">Kiểm tra nhanh các thông tin quan trọng của hồ sơ.</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-red-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-dark">Sẵn sàng hỗ trợ</span>
                <button type="button" onClick={() => void handleToggleAvailable(!isAvailable)} disabled={isTogglingAvailable} aria-label={user.status === 'AVAILABLE' ? 'Tắt trạng thái sẵn sàng hỗ trợ' : 'Bật trạng thái sẵn sàng hỗ trợ'} className={`relative inline-flex h-7 w-12 items-center rounded-full transition disabled:opacity-60 ${user.status === 'AVAILABLE' ? 'bg-success' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${isTogglingAvailable ? 'opacity-60' : ''} ${user.status === 'AVAILABLE' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-gray-500">Khi bật trạng thái này, bạn sẽ được ưu tiên nhận các yêu cầu phù hợp với nhóm máu.</p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4"><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Liên hệ</p><p className="mt-2 text-sm font-bold text-dark">{user.phone || 'Chưa có số điện thoại'}</p><p className="mt-1 break-all text-xs text-gray-500">{user.email}</p></div>
            {avatarError ? <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-primary">{avatarError}</div> : null}
          </div>
        </div>
      </div>

      <ProfileDonationTimeline />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4"><div><h3 className="text-lg font-extrabold text-dark">Thông tin cá nhân</h3><p className="mt-1 text-sm text-gray-500">Các thông tin cơ bản đang được sử dụng trong hệ thống.</p></div></div>
          <div className="mt-6 space-y-4">{[{ label: 'Họ và tên', value: user.name }, { label: 'Giới tính', value: user.gender === 'MALE' ? 'Nam' : 'Nữ' }, { label: 'Email', value: user.email }, { label: 'Số điện thoại', value: user.phone }, { label: 'Ngày sinh', value: formatDate(user.dob) }, { label: 'Địa chỉ / Khu vực', value: user.address || 'Chưa cập nhật' }].map((item) => <div key={item.label} className="flex items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3"><span className="text-sm font-semibold text-gray-500">{item.label}</span><span className="max-w-[60%] text-right text-sm font-bold text-dark">{item.value || 'Chưa cập nhật'}</span></div>)}</div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4"><div><h3 className="text-lg font-extrabold text-dark">Thông tin sức khỏe</h3><p className="mt-1 text-sm text-gray-500">Dữ liệu hỗ trợ sàng lọc và phản hồi trong các tình huống khẩn cấp.</p></div></div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-red-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Nhóm máu</p><p className="mt-2 text-2xl font-extrabold text-dark">{user.bloodType ?? 'Chưa cập nhật'}</p></div>
            <div className="rounded-2xl bg-orange-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Trạng thái</p><p className="mt-2 text-2xl font-extrabold text-dark">{isAvailable ? 'Sẵn sàng' : 'Tạm dừng'}</p></div>
            <div className="rounded-2xl border border-gray-100 p-4"><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Cân nặng</p><p className="mt-2 text-xl font-extrabold text-dark">{user.weight ? `${user.weight} kg` : 'Chưa cập nhật'}</p><p className={`mt-2 text-xs font-semibold ${user.weight && user.weight >= 45 ? 'text-success' : 'text-yellow-600'}`}>{user.weight && user.weight >= 45 ? 'Đủ điều kiện cân nặng (>=45kg)' : 'Cần tối thiểu 45kg để hiến máu'}</p></div>
            <div className="rounded-2xl border border-gray-100 p-4"><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Ngày hiến tiếp theo có thể</p><p className="mt-2 text-xl font-extrabold text-dark">{nextEligibleDate ? formatDate(nextEligibleDate.toISOString()) : 'Sẵn sàng'}</p><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${isEligibleNow ? 'bg-success/10 text-success' : 'bg-yellow-100 text-yellow-700'}`}>{isEligibleNow ? 'Đã đủ điều kiện' : 'Chưa đủ điều kiện'}</span></div>
            <div className="rounded-2xl border border-gray-100 p-4 sm:col-span-2">{user.lastDonation ? (isEligibleNow ? <div className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm font-semibold text-success">Bạn đủ điều kiện hiến máu!</div> : <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-700">Còn {remainingDays} ngày nữa bạn có thể hiến.</div>) : <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">Đăng ký lần hiến đầu tiên.</div>}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
