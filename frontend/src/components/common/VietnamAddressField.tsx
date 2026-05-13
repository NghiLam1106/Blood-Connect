import { useEffect, useMemo, useState } from 'react'

type AddressNode = {
  code: number
  name: string
}

type ProvinceResponse = AddressNode[]
type ProvinceDetailResponse = AddressNode & {
  wards?: AddressNode[]
  communes?: AddressNode[]
}

export type VietnamAddressValue = {
  provinceCode: string
  provinceName: string
  wardCode: string
  wardName: string
  street: string
}

type VietnamAddressErrors = {
  province?: string
  ward?: string
}

type Props = {
  value: VietnamAddressValue
  onChange: (next: VietnamAddressValue) => void
  errors?: VietnamAddressErrors
}

const API_BASE = 'https://provinces.open-api.vn/api/v2'

const EMPTY_LIST: AddressNode[] = []

export function VietnamAddressField({ value, onChange, errors }: Props) {
  const [provinces, setProvinces] = useState<AddressNode[]>([])
  const [wardMap, setWardMap] = useState<Record<string, AddressNode[]>>({})
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false)
  const [isLoadingWards, setIsLoadingWards] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const fetchProvinces = async () => {
      setIsLoadingProvinces(true)
      setApiError(null)
      try {
        const response = await fetch(`${API_BASE}/p/`)
        if (!response.ok) throw new Error('Không thể tải danh sách tỉnh/thành phố')
        const data = (await response.json()) as ProvinceResponse
        if (!active) return
        setProvinces(data)
      } catch (error) {
        if (!active) return
        setApiError(error instanceof Error ? error.message : 'Không thể tải dữ liệu địa chỉ')
      } finally {
        if (active) setIsLoadingProvinces(false)
      }
    }
    void fetchProvinces()
    return () => {
      active = false
    }
  }, [])

  const wards = useMemo(() => wardMap[value.provinceCode] ?? EMPTY_LIST, [value.provinceCode, wardMap])

  const fetchWardsByProvince = async (provinceCode: string) => {
    if (!provinceCode || wardMap[provinceCode]) return
    setApiError(null)
    setIsLoadingWards(true)
    try {
      const response = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`)
      if (!response.ok) throw new Error('Không thể tải danh sách xã/phường')
      const data = (await response.json()) as ProvinceDetailResponse
      const wardList = data.wards ?? data.communes ?? []
      setWardMap((prev) => ({ ...prev, [provinceCode]: wardList }))
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Không thể tải dữ liệu xã/phường')
    } finally {
      setIsLoadingWards(false)
    }
  }

  const handleProvinceChange = async (nextCode: string) => {
    const selected = provinces.find((item) => String(item.code) === nextCode)
    onChange({
      ...value,
      provinceCode: nextCode,
      provinceName: selected?.name ?? '',
      wardCode: '',
      wardName: '',
    })
    if (nextCode) await fetchWardsByProvince(nextCode)
  }

  const handleWardChange = (nextCode: string) => {
    const selected = wards.find((item) => String(item.code) === nextCode)
    onChange({
      ...value,
      wardCode: nextCode,
      wardName: selected?.name ?? '',
    })
  }

  return (
    <div className="space-y-4 md:col-span-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-dark">Tỉnh / Thành phố</span>
          <select
            value={value.provinceCode}
            onChange={(e) => void handleProvinceChange(e.target.value)}
            aria-label="Chọn tỉnh hoặc thành phố"
            aria-invalid={Boolean(errors?.province)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
          >
            <option value="">{isLoadingProvinces ? 'Đang tải tỉnh/thành...' : 'Chọn tỉnh/thành phố'}</option>
            {provinces.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
          {errors?.province ? <p className="text-xs font-semibold text-primary">{errors.province}</p> : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-dark">Xã / Phường</span>
          <select
            value={value.wardCode}
            disabled={!value.provinceCode || isLoadingWards}
            onChange={(e) => handleWardChange(e.target.value)}
            aria-label="Chọn xã hoặc phường"
            aria-invalid={Boolean(errors?.ward)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="">
              {!value.provinceCode ? 'Chọn tỉnh/thành trước' : isLoadingWards ? 'Đang tải xã/phường...' : 'Chọn xã/phường'}
            </option>
            {wards.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
          {errors?.ward ? <p className="text-xs font-semibold text-primary">{errors.ward}</p> : null}
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-bold text-dark">Số nhà / Tên đường (tùy chọn)</span>
        <input
          value={value.street}
          onChange={(e) => onChange({ ...value, street: e.target.value })}
          aria-label="Nhập số nhà hoặc tên đường"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
          placeholder="Ví dụ: 470 Trần Đại Nghĩa"
        />
      </label>

      {apiError ? <p className="text-xs font-semibold text-primary">{apiError}</p> : null}
    </div>
  )
}
