import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Box, ChefHat, ChevronDown, Info, Search, X } from 'lucide-react'

function toDateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createRecentDateOptions() {
  const options = []

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + offset)

    const value = toDateValue(date)
    let label = value.replace(/-/g, '/')

    if (offset === 0) {
      label += '（今日）'
    } else if (offset === 1) {
      label += '（明日）'
    }

    options.push({ value, label })
  }

  return options
}

const TODAY_VALUE = toDateValue(new Date())
const DATE_OPTIONS = createRecentDateOptions()

const TIME_SLOT_OPTIONS = [
  { id: 'lunch', label: '午市 10:30-14:00' },
  { id: 'dinner', label: '晚市 17:00-21:30' },
]

const LOSS_REASON_OPTIONS = [
  { value: 'quality', label: '品质问题' },
  { value: 'expired', label: '过期报损' },
  { value: 'damaged', label: '操作损耗' },
  { value: 'other', label: '其他原因' },
]

const WAREHOUSE_OPTIONS = [
  { value: 'main', label: '主仓' },
  { value: 'cold', label: '冷藏仓' },
  { value: 'dry', label: '干货仓' },
  { value: 'front', label: '前置仓' },
]

const DISH_TEMPLATES = [
  { baseId: 'd1', name: '麻婆豆腐', unit: '份', targetQty: 36, producedQty: 25, lossQty: 3, stockQty: 11, warningStock: 10 },
  { baseId: 'd2', name: '宫保鸡丁', unit: '份', targetQty: 42, producedQty: 30, lossQty: 2, stockQty: 8, warningStock: 9 },
  { baseId: 'd3', name: '酸菜鱼', unit: '份', targetQty: 28, producedQty: 21, lossQty: 2, stockQty: 6, warningStock: 8 },
  { baseId: 'd4', name: '蒜蓉生菜', unit: '份', targetQty: 24, producedQty: 18, lossQty: 1, stockQty: 9, warningStock: 6 },
  { baseId: 'd5', name: '回锅肉', unit: '份', targetQty: 32, producedQty: 20, lossQty: 1, stockQty: 12, warningStock: 8 },
  { baseId: 'd6', name: '鱼香肉丝', unit: '份', targetQty: 35, producedQty: 24, lossQty: 2, stockQty: 10, warningStock: 8 },
  { baseId: 'd7', name: '青椒肉丝', unit: '份', targetQty: 30, producedQty: 21, lossQty: 1, stockQty: 7, warningStock: 7 },
  { baseId: 'd8', name: '西红柿炒蛋', unit: '份', targetQty: 26, producedQty: 19, lossQty: 1, stockQty: 5, warningStock: 6 },
  { baseId: 'd9', name: '红烧茄子', unit: '份', targetQty: 22, producedQty: 15, lossQty: 1, stockQty: 6, warningStock: 6 },
  { baseId: 'd10', name: '水煮牛肉', unit: '份', targetQty: 27, producedQty: 17, lossQty: 2, stockQty: 4, warningStock: 6 },
  { baseId: 'd11', name: '干煸豆角', unit: '份', targetQty: 20, producedQty: 12, lossQty: 1, stockQty: 5, warningStock: 5 },
  { baseId: 'd12', name: '口水鸡', unit: '份', targetQty: 18, producedQty: 10, lossQty: 1, stockQty: 3, warningStock: 4 },
]

const ITEM_TEMPLATES = [
  { baseId: 'i1', name: '鸡丁半成品', unit: 'kg', targetQty: 18, producedQty: 14, lossQty: 1, stockQty: 5, warningStock: 6 },
  { baseId: 'i2', name: '酸菜底料', unit: 'kg', targetQty: 12, producedQty: 9, lossQty: 1, stockQty: 4, warningStock: 5 },
  { baseId: 'i3', name: '豆腐切块', unit: '盒', targetQty: 20, producedQty: 15, lossQty: 0, stockQty: 7, warningStock: 8 },
  { baseId: 'i4', name: '蒜蓉酱', unit: '桶', targetQty: 10, producedQty: 8, lossQty: 1, stockQty: 2, warningStock: 3 },
  { baseId: 'i5', name: '牛肉片半成品', unit: 'kg', targetQty: 16, producedQty: 11, lossQty: 1, stockQty: 5, warningStock: 5 },
  { baseId: 'i6', name: '辣椒油', unit: '袋', targetQty: 22, producedQty: 16, lossQty: 1, stockQty: 9, warningStock: 7 },
  { baseId: 'i7', name: '葱姜蒜配料', unit: '盒', targetQty: 26, producedQty: 20, lossQty: 1, stockQty: 6, warningStock: 7 },
  { baseId: 'i8', name: '青花椒底料', unit: '袋', targetQty: 14, producedQty: 10, lossQty: 1, stockQty: 4, warningStock: 5 },
  { baseId: 'i9', name: '鸡汤底', unit: '桶', targetQty: 9, producedQty: 7, lossQty: 0, stockQty: 3, warningStock: 4 },
  { baseId: 'i10', name: '豆瓣酱', unit: '桶', targetQty: 11, producedQty: 8, lossQty: 1, stockQty: 4, warningStock: 4 },
  { baseId: 'i11', name: '花生碎', unit: '袋', targetQty: 13, producedQty: 9, lossQty: 1, stockQty: 3, warningStock: 4 },
  { baseId: 'i12', name: '调味糖浆', unit: '瓶', targetQty: 8, producedQty: 6, lossQty: 0, stockQty: 2, warningStock: 3 },
]

const LIST_PAGE_SIZE = 8
const FORECAST_PAGE_SIZE = 6

const STOCK_STATE_PRIORITY = {
  out: 0,
  warning: 1,
  normal: 2,
}

const FORECAST_CATEGORY_OPTIONS = {
  dish: [
    { id: 'all', label: '全部' },
    { id: 'add-on', label: '加料' },
    { id: 'hot', label: '热菜' },
    { id: 'cold', label: '凉菜' },
    { id: 'staple', label: '主食' },
    { id: 'soup', label: '汤羹' },
  ],
  item: [
    { id: 'all', label: '全部' },
    { id: 'semi', label: '半成品' },
    { id: 'sauce', label: '酱料' },
    { id: 'base', label: '底料' },
    { id: 'pack', label: '包装' },
  ],
}

const DISH_CATEGORY_MAP = {
  d1: 'hot',
  d2: 'hot',
  d3: 'soup',
  d4: 'add-on',
  d5: 'hot',
  d6: 'hot',
  d7: 'hot',
  d8: 'staple',
  d9: 'hot',
  d10: 'hot',
  d11: 'add-on',
  d12: 'cold',
}

const ITEM_CATEGORY_MAP = {
  i1: 'semi',
  i2: 'base',
  i3: 'semi',
  i4: 'sauce',
  i5: 'semi',
  i6: 'sauce',
  i7: 'base',
  i8: 'base',
  i9: 'base',
  i10: 'sauce',
  i11: 'pack',
  i12: 'sauce',
}

const FORECAST_STEP_TIPS = {
  step1: '至少需要有历史1个月的营业数据。预估营业额为总营业额。基于历史堂食、外卖等所有渠道营业额进行预估',
  step2: '至少需要有历史1个月的营业数据。若外卖菜品已关联堂食菜品，菜品预估销量包含外卖销量',
}

function composeKey(date, slot) {
  return `${date}_${slot}`
}

function roundNumber(value) {
  return Math.max(0, Math.round(value))
}

function getStockState(stockQty, warningStock) {
  if (stockQty <= 0) return 'out'
  if (stockQty <= warningStock) return 'warning'
  return 'normal'
}

function getPendingQty(item) {
  const availableQty = item.producedQty - item.lossQty
  return Math.max(item.targetQty - availableQty, 0)
}

function createInitialRecords() {
  const records = []

  DATE_OPTIONS.forEach((dateOption, dateIndex) => {
    TIME_SLOT_OPTIONS.forEach((slotOption, slotIndex) => {
      const factor = 1 + dateIndex * 0.06 + slotIndex * 0.18

      const withType = [
        ...DISH_TEMPLATES.map((template) => ({ ...template, type: 'dish' })),
        ...ITEM_TEMPLATES.map((template) => ({ ...template, type: 'item' })),
      ]

      withType.forEach((template, rowIndex) => {
        records.push({
          id: `${dateOption.value}-${slotOption.id}-${template.baseId}`,
          date: dateOption.value,
          slot: slotOption.id,
          type: template.type,
          name: template.name,
          unit: template.unit,
          targetQty: roundNumber(template.targetQty * factor),
          producedQty: roundNumber(template.producedQty * factor),
          lossQty: roundNumber(template.lossQty * (1 + dateIndex * 0.2)),
          stockQty: roundNumber(template.stockQty * (1 + slotIndex * 0.1) - rowIndex * 0.1),
          warningStock: template.warningStock,
        })
      })
    })
  })

  return records
}

function createInitialRevenueMap() {
  const map = {}

  DATE_OPTIONS.forEach((dateOption, dateIndex) => {
    TIME_SLOT_OPTIONS.forEach((slotOption, slotIndex) => {
      const base = 18000 + dateIndex * 1600 + slotIndex * 4200
      map[composeKey(dateOption.value, slotOption.id)] = {
        base,
        adjusted: base,
      }
    })
  })

  return map
}

function formatSigned(value) {
  if (value > 0) return `+${value}`
  return `${value}`
}

function getBaseIdFromRecordId(recordId) {
  const parts = recordId.split('-')
  return parts[parts.length - 1] ?? recordId
}

function buildForecastCode(type, baseId) {
  const offset = Number(baseId.replace(/\D/g, '')) || 0
  const prefix = type === 'dish' ? 739297000 : 839297000
  return String(prefix + offset * 2)
}

function buildMnemonic(name) {
  return name.replace(/\s+/g, '').slice(0, 4)
}

function getForecastCategory(type, baseId) {
  if (type === 'dish') {
    return DISH_CATEGORY_MAP[baseId] ?? 'hot'
  }
  return ITEM_CATEGORY_MAP[baseId] ?? 'base'
}

function App() {
  const [activePage, setActivePage] = useState('execution')
  const [selectedDate, setSelectedDate] = useState(DATE_OPTIONS[0].value)
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOT_OPTIONS[0].id)
  const [dimension, setDimension] = useState('dish')
  const [searchOpen, setSearchOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [visibleCount, setVisibleCount] = useState(LIST_PAGE_SIZE)
  const loadMoreRef = useRef(null)
  const forecastDraftRef = useRef(null)

  const [records, setRecords] = useState(() => createInitialRecords())
  const [revenueMap, setRevenueMap] = useState(() => createInitialRevenueMap())
  const [lunchDraft, setLunchDraft] = useState('')
  const [dinnerDraft, setDinnerDraft] = useState('')

  const [modalState, setModalState] = useState({
    open: false,
    itemId: '',
    action: 'produce',
  })
  const [amountInput, setAmountInput] = useState('')
  const [lossDate, setLossDate] = useState(DATE_OPTIONS[0].value)
  const [lossReason, setLossReason] = useState('')
  const [inboundWarehouse, setInboundWarehouse] = useState(WAREHOUSE_OPTIONS[0].value)
  const [outboundWarehouse, setOutboundWarehouse] = useState(WAREHOUSE_OPTIONS[0].value)
  const [outboundDate, setOutboundDate] = useState(TODAY_VALUE)
  const [lossRemark, setLossRemark] = useState('')
  const [forecastMethod, setForecastMethod] = useState('smart')
  const [revenueFactor, setRevenueFactor] = useState('1.00')
  const [forecastNameKeyword, setForecastNameKeyword] = useState('')
  const [forecastCodeKeyword, setForecastCodeKeyword] = useState('')
  const [forecastMnemonicKeyword, setForecastMnemonicKeyword] = useState('')
  const [quantityFactorMap, setQuantityFactorMap] = useState({})
  const [forecastEditing, setForecastEditing] = useState(false)
  const [forecastFilterOpen, setForecastFilterOpen] = useState(false)
  const [forecastCategory, setForecastCategory] = useState('all')
  const [forecastPage, setForecastPage] = useState(1)
  const [infoModalState, setInfoModalState] = useState({
    open: false,
    title: '',
    content: '',
  })
  const [toast, setToast] = useState('')

  const lunchKey = composeKey(selectedDate, 'lunch')
  const dinnerKey = composeKey(selectedDate, 'dinner')

  useEffect(() => {
    setLunchDraft(String(revenueMap[lunchKey]?.adjusted ?? 0))
    setDinnerDraft(String(revenueMap[dinnerKey]?.adjusted ?? 0))
    setRevenueFactor('1.00')
  }, [selectedDate, lunchKey, dinnerKey, revenueMap])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 1800)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    setVisibleCount(LIST_PAGE_SIZE)
  }, [selectedDate, selectedSlot, dimension, keyword])

  useEffect(() => {
    setQuantityFactorMap({})
    setForecastNameKeyword('')
    setForecastCodeKeyword('')
    setForecastMnemonicKeyword('')
    setForecastEditing(false)
    setForecastFilterOpen(false)
    setForecastCategory('all')
    setForecastPage(1)
    forecastDraftRef.current = null
  }, [selectedDate, dimension])

  useEffect(() => {
    if (activePage !== 'revenue') return
    setForecastEditing(false)
    setForecastFilterOpen(false)
    setForecastPage(1)
    forecastDraftRef.current = null
  }, [activePage])

  const executionRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return records
      .filter((item) => item.date === selectedDate && item.slot === selectedSlot)
      .filter((item) => item.type === dimension)
      .filter((item) => !normalizedKeyword || item.name.toLowerCase().includes(normalizedKeyword))
      .map((item) => {
        const pendingQty = getPendingQty(item)
        const overQty = Math.max(item.producedQty - item.lossQty - item.targetQty, 0)
        const stockState = getStockState(item.stockQty, item.warningStock)

        return {
          ...item,
          pendingQty,
          overQty,
          stockState,
        }
      })
      .sort((a, b) => {
        const priorityDiff = STOCK_STATE_PRIORITY[a.stockState] - STOCK_STATE_PRIORITY[b.stockState]
        if (priorityDiff !== 0) return priorityDiff

        const pendingDiff = b.pendingQty - a.pendingQty
        if (pendingDiff !== 0) return pendingDiff

        return a.name.localeCompare(b.name, 'zh-Hans-CN')
      })
  }, [records, selectedDate, selectedSlot, dimension, keyword])

  const visibleExecutionRows = useMemo(() => executionRows.slice(0, visibleCount), [executionRows, visibleCount])
  const hasMoreRows = visibleExecutionRows.length < executionRows.length

  const forecastRows = useMemo(() => {
    const groupedRows = new Map()
    const normalizedName = forecastNameKeyword.trim().toLowerCase()
    const normalizedCode = forecastCodeKeyword.trim()
    const normalizedMnemonic = forecastMnemonicKeyword.trim().toLowerCase()

    records
      .filter((item) => item.date === selectedDate)
      .filter((item) => item.type === dimension)
      .forEach((item) => {
        const baseId = getBaseIdFromRecordId(item.id)
        const row = groupedRows.get(baseId) ?? {
          baseId,
          name: item.name,
          unit: item.unit,
          spec: '标准',
          code: buildForecastCode(item.type, baseId),
          mnemonic: buildMnemonic(item.name),
          categoryId: getForecastCategory(item.type, baseId),
          lunchQty: 0,
          dinnerQty: 0,
        }

        if (item.slot === 'lunch') {
          row.lunchQty = item.targetQty
        } else if (item.slot === 'dinner') {
          row.dinnerQty = item.targetQty
        }

        groupedRows.set(baseId, row)
      })

    return Array.from(groupedRows.values())
      .map((row) => {
        const factorText = quantityFactorMap[row.baseId] ?? '1.00'
        const parsedFactor = Number(factorText)
        const factor = Number.isFinite(parsedFactor) && parsedFactor > 0 ? parsedFactor : 1
        const systemQty = row.lunchQty + row.dinnerQty

        return {
          ...row,
          factorText,
          systemQty,
          estimatedQty: roundNumber(systemQty * factor),
        }
      })
      .filter((row) => !normalizedName || row.name.toLowerCase().includes(normalizedName))
      .filter((row) => !normalizedCode || row.code.includes(normalizedCode))
      .filter((row) => !normalizedMnemonic || row.mnemonic.toLowerCase().includes(normalizedMnemonic))
      .sort((a, b) => b.systemQty - a.systemQty)
  }, [records, selectedDate, dimension, quantityFactorMap, forecastNameKeyword, forecastCodeKeyword, forecastMnemonicKeyword])

  const forecastCategoryOptions = FORECAST_CATEGORY_OPTIONS[dimension]

  const categoryFilteredForecastRows = useMemo(() => {
    if (forecastCategory === 'all') return forecastRows
    return forecastRows.filter((row) => row.categoryId === forecastCategory)
  }, [forecastRows, forecastCategory])

  const forecastTotalPages = Math.max(1, Math.ceil(categoryFilteredForecastRows.length / FORECAST_PAGE_SIZE))

  const pagedForecastRows = useMemo(() => {
    const start = (forecastPage - 1) * FORECAST_PAGE_SIZE
    return categoryFilteredForecastRows.slice(start, start + FORECAST_PAGE_SIZE)
  }, [categoryFilteredForecastRows, forecastPage])

  useEffect(() => {
    setForecastPage(1)
  }, [forecastCategory, forecastNameKeyword, forecastCodeKeyword, forecastMnemonicKeyword])

  useEffect(() => {
    setForecastPage((prev) => Math.min(prev, forecastTotalPages))
  }, [forecastTotalPages])

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target || !hasMoreRows || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setVisibleCount((prev) => Math.min(prev + LIST_PAGE_SIZE, executionRows.length))
      },
      { root: null, rootMargin: '120px 0px', threshold: 0.1 },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [executionRows.length, hasMoreRows])

  const selectedItem = useMemo(() => {
    if (!modalState.itemId) return null
    const raw = records.find((item) => item.id === modalState.itemId)
    if (!raw) return null

    return {
      ...raw,
      pendingQty: getPendingQty(raw),
    }
  }, [records, modalState.itemId])

  const lunchRevenue = Number(lunchDraft) || 0
  const dinnerRevenue = Number(dinnerDraft) || 0
  const lunchBaseRevenue = revenueMap[lunchKey]?.base ?? 0
  const dinnerBaseRevenue = revenueMap[dinnerKey]?.base ?? 0
  const systemForecastRevenue = lunchBaseRevenue + dinnerBaseRevenue
  const revenueFactorValue = Number.isFinite(Number(revenueFactor)) && Number(revenueFactor) > 0 ? Number(revenueFactor) : 1
  const forecastRevenueTotal = roundNumber((lunchRevenue + dinnerRevenue) * revenueFactorValue)

  function handleBack() {
    if (activePage === 'revenue') {
      setActivePage('execution')
      return
    }

    if (window.history.length > 1) {
      window.history.back()
      return
    }

    setToast('请在主 App 中返回上一级')
  }

  function toggleSearch() {
    setSearchOpen((prev) => {
      const next = !prev
      if (!next) {
        setKeyword('')
      }
      return next
    })
  }

  function openInfoModal(stepKey) {
    setInfoModalState({
      open: true,
      title: '说明',
      content: FORECAST_STEP_TIPS[stepKey],
    })
  }

  function closeInfoModal() {
    setInfoModalState({ open: false, title: '', content: '' })
  }

  function handleGenerateForecastRevenue() {
    if (!forecastEditing) return

    const generatedFactor = forecastMethod === 'smart' ? 1.05 : 1
    setRevenueFactor(generatedFactor.toFixed(2))

    setLunchDraft(String(roundNumber(lunchBaseRevenue * generatedFactor)))
    setDinnerDraft(String(roundNumber(dinnerBaseRevenue * generatedFactor)))
    setToast('已生成预估营业额')
  }

  function handleGenerateForecastQty() {
    if (!forecastEditing) return

    if (categoryFilteredForecastRows.length === 0) {
      setToast('暂无可生成的预估销量/用量')
      return
    }

    const baseFactor = forecastMethod === 'smart' ? revenueFactorValue : 1
    const nextFactorText = baseFactor.toFixed(2)

    setQuantityFactorMap(() => {
      const nextMap = {}
      categoryFilteredForecastRows.forEach((row) => {
        nextMap[row.baseId] = nextFactorText
      })
      return nextMap
    })

    setToast('已生成预估销量/用量')
  }

  function handleResetForecastFilters() {
    setForecastNameKeyword('')
    setForecastCodeKeyword('')
    setForecastMnemonicKeyword('')
  }

  function startForecastEditing() {
    forecastDraftRef.current = {
      lunchDraft,
      dinnerDraft,
      revenueFactor,
      forecastMethod,
      quantityFactorMap: { ...quantityFactorMap },
    }
    setForecastEditing(true)
  }

  function cancelForecastEditing() {
    const draft = forecastDraftRef.current
    if (draft) {
      setLunchDraft(draft.lunchDraft)
      setDinnerDraft(draft.dinnerDraft)
      setRevenueFactor(draft.revenueFactor)
      setForecastMethod(draft.forecastMethod)
      setQuantityFactorMap(draft.quantityFactorMap)
    }
    forecastDraftRef.current = null
    setForecastEditing(false)
    setToast('已取消本次修改')
  }

  function handleRevenueCommit(mode) {
    if (!forecastEditing) {
      setToast('请先点击右上角编辑')
      return false
    }

    const nextLunchRevenue = Number(lunchDraft)
    const nextDinnerRevenue = Number(dinnerDraft)
    if (!Number.isFinite(nextLunchRevenue) || !Number.isFinite(nextDinnerRevenue) || nextLunchRevenue <= 0 || nextDinnerRevenue <= 0) {
      setToast('请输入大于 0 的分时段营业额')
      return false
    }

    const prevLunch = revenueMap[lunchKey]?.adjusted ?? nextLunchRevenue
    const prevDinner = revenueMap[dinnerKey]?.adjusted ?? nextDinnerRevenue
    const lunchRatio = prevLunch === 0 ? 1 : nextLunchRevenue / prevLunch
    const dinnerRatio = prevDinner === 0 ? 1 : nextDinnerRevenue / prevDinner

    setRevenueMap((prev) => ({
      ...prev,
      [lunchKey]: {
        ...prev[lunchKey],
        adjusted: nextLunchRevenue,
      },
      [dinnerKey]: {
        ...prev[dinnerKey],
        adjusted: nextDinnerRevenue,
      },
    }))

    setRecords((prev) =>
      prev.map((item) => {
        if (item.date !== selectedDate) return item

        let nextTargetQty = item.targetQty
        if (item.slot === 'lunch') {
          nextTargetQty = roundNumber(item.targetQty * lunchRatio)
        } else if (item.slot === 'dinner') {
          nextTargetQty = roundNumber(item.targetQty * dinnerRatio)
        }

        const baseId = getBaseIdFromRecordId(item.id)
        const rowFactor = Number(quantityFactorMap[baseId])
        if (item.type === dimension && Number.isFinite(rowFactor) && rowFactor > 0 && rowFactor !== 1) {
          nextTargetQty = roundNumber(nextTargetQty * rowFactor)
        }

        if (nextTargetQty === item.targetQty) return item

        return {
          ...item,
          targetQty: nextTargetQty,
        }
      }),
    )

    forecastDraftRef.current = null
    setForecastEditing(false)
    setToast(mode === 'publish' ? '已保存并下发到备餐执行页' : '已保存当前时段备餐预估')
    return true
  }

  function openModal(itemId) {
    const target = records.find((item) => item.id === itemId)
    const pendingQty = target ? getPendingQty(target) : 0

    setModalState({ open: true, itemId, action: 'produce' })
    setAmountInput(String(pendingQty))
    setLossDate(selectedDate)
    setLossReason('')
    setInboundWarehouse(WAREHOUSE_OPTIONS[0].value)
    setOutboundWarehouse(WAREHOUSE_OPTIONS[0].value)
    setOutboundDate(TODAY_VALUE)
    setLossRemark('')
  }

  function switchModalAction(nextAction) {
    if (!selectedItem) return

    setModalState((prev) => ({
      ...prev,
      action: nextAction,
    }))

    if (nextAction === 'produce') {
      setAmountInput(String(selectedItem.pendingQty))
      return
    }

    setAmountInput('')
  }

  function closeModal() {
    setModalState({ open: false, itemId: '', action: 'produce' })
    setAmountInput('')
    setInboundWarehouse(WAREHOUSE_OPTIONS[0].value)
    setOutboundWarehouse(WAREHOUSE_OPTIONS[0].value)
    setOutboundDate(TODAY_VALUE)
    setLossRemark('')
  }

  function applyRecordAction() {
    const amount = Number(amountInput)
    if (!Number.isFinite(amount) || amount <= 0) {
      setToast('请输入大于 0 的数量')
      return
    }

    if (modalState.action === 'loss' && !lossReason) {
      setToast('请选择报损原因')
      return
    }

    setRecords((prev) =>
      prev.map((item) => {
        if (item.id !== modalState.itemId) return item

        if (modalState.action === 'produce') {
          return {
            ...item,
            producedQty: item.producedQty + amount,
            stockQty: item.stockQty + amount,
          }
        }

        return {
          ...item,
          lossQty: item.lossQty + amount,
          stockQty: item.stockQty - amount,
        }
      }),
    )

    closeModal()
    if (modalState.action === 'produce') {
      setToast('已录入备餐数量')
      return
    }

    setToast('已录入报损数量')
  }

  return (
    <div className="app-shell">
      <div className="app-phone">
        <header className="top-bar">
          <button type="button" className="header-nav-btn" onClick={handleBack} aria-label="返回">
            <ArrowLeft size={18} />
          </button>

          <h1 className="header-title">{activePage === 'execution' ? '备餐' : '备餐预估'}</h1>

          {activePage === 'execution' ? (
            <button type="button" className="header-right-btn" onClick={() => setActivePage('revenue')}>
              备餐预估
            </button>
          ) : forecastEditing ? (
            <div className="header-right-actions">
              <button type="button" className="header-right-btn secondary" onClick={cancelForecastEditing}>
                取消
              </button>
              <button type="button" className="header-right-btn" onClick={() => handleRevenueCommit('save')}>
                保存
              </button>
            </div>
          ) : (
            <button type="button" className="header-right-btn" onClick={startForecastEditing}>
              编辑
            </button>
          )}
        </header>

        {activePage === 'revenue' ? (
          <section className="panel-card forecast-panel">
            <div className="forecast-step-row">
              <div className="forecast-step-title">第一步：预估营业额</div>
              <button type="button" className="info-btn" aria-label="查看第一步说明" onClick={() => openInfoModal('step1')}>
                <Info size={14} />
              </button>
            </div>

            <div className="forecast-method-row">
              <span className="dropdown-label">预估方式</span>
              <div className="forecast-method-buttons">
                <button
                  type="button"
                  className={forecastMethod === 'smart' ? 'segment active' : 'segment'}
                  onClick={() => setForecastMethod('smart')}
                >
                  智能算法预估
                </button>
                <button
                  type="button"
                  className={forecastMethod === 'avg' ? 'segment active' : 'segment'}
                  onClick={() => setForecastMethod('avg')}
                >
                  对等日均值预估
                </button>
              </div>
            </div>

            <div className="forecast-generate-row">
              <div className="dropdown-item">
                <span className="dropdown-label">目标预估日期</span>
                <div className="select-wrap">
                  <select value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)}>
                    {DATE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>
              </div>
              <button type="button" className="btn-primary generate-btn" onClick={handleGenerateForecastRevenue}>
                生成预估营业额
              </button>
            </div>

            <div className="forecast-table-wrap">
              <table className="forecast-table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>1200-1600</th>
                    <th>1600-2000</th>
                    <th>系统预估营业额</th>
                    <th>系数</th>
                    <th>预估营业额</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{selectedDate.replace(/-/g, '/')}</td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        min="0"
                        readOnly={!forecastEditing}
                        value={lunchDraft}
                        onChange={(event) => setLunchDraft(event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        min="0"
                        readOnly={!forecastEditing}
                        value={dinnerDraft}
                        onChange={(event) => setDinnerDraft(event.target.value)}
                      />
                    </td>
                    <td>{systemForecastRevenue}</td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        min="0"
                        step="0.01"
                        readOnly={!forecastEditing}
                        value={revenueFactor}
                        onChange={(event) => setRevenueFactor(event.target.value)}
                      />
                    </td>
                    <td>{forecastRevenueTotal}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="forecast-step-row">
              <div className="forecast-step-title">第二步：预估销量/用量</div>
              <button type="button" className="info-btn" aria-label="查看第二步说明" onClick={() => openInfoModal('step2')}>
                <Info size={14} />
              </button>
            </div>

            <div className="forecast-category-tabs" role="tablist" aria-label="分类筛选">
              {forecastCategoryOptions.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={forecastCategory === category.id}
                  className={forecastCategory === category.id ? 'forecast-category-btn active' : 'forecast-category-btn'}
                  onClick={() => setForecastCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="forecast-actions-row">
              <button type="button" className="btn-primary generate-btn" onClick={handleGenerateForecastQty}>
                生成预估销量/用量
              </button>
              <button type="button" className="btn-subtle compact" onClick={() => setForecastFilterOpen((prev) => !prev)}>
                {forecastFilterOpen ? '收起筛选' : '筛选'}
              </button>
            </div>

            {forecastFilterOpen && (
              <>
                <div className="forecast-filter-grid compact forecast-filter-panel">
                  <label className="forecast-filter-item compact">
                    <span>菜品名称</span>
                    <input
                      className="number-input compact"
                      placeholder="请输入菜品名称"
                      value={forecastNameKeyword}
                      onChange={(event) => setForecastNameKeyword(event.target.value)}
                    />
                  </label>
                  <label className="forecast-filter-item compact">
                    <span>菜品编码</span>
                    <input
                      className="number-input compact"
                      placeholder="请输入菜品编码"
                      value={forecastCodeKeyword}
                      onChange={(event) => setForecastCodeKeyword(event.target.value)}
                    />
                  </label>
                  <label className="forecast-filter-item compact">
                    <span>菜品助记码</span>
                    <input
                      className="number-input compact"
                      placeholder="请输入菜品助记码"
                      value={forecastMnemonicKeyword}
                      onChange={(event) => setForecastMnemonicKeyword(event.target.value)}
                    />
                  </label>
                </div>
                <div className="forecast-filter-actions">
                  <button type="button" className="btn-subtle compact" onClick={handleResetForecastFilters}>
                    重置筛选
                  </button>
                </div>
              </>
            )}

            <div className="forecast-table-wrap">
              <table className="forecast-table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>编码</th>
                    <th>规格</th>
                    <th>单位</th>
                    <th>1200-1600</th>
                    <th>1600-2000</th>
                    <th>系统预估数量</th>
                    <th>系数</th>
                    <th>预估数量</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryFilteredForecastRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="forecast-empty">
                        当前筛选条件下暂无预估数据
                      </td>
                    </tr>
                  ) : (
                    pagedForecastRows.map((row) => (
                      <tr key={row.baseId}>
                        <td>{row.name}</td>
                        <td>{row.code}</td>
                        <td>{row.spec}</td>
                        <td>{row.unit}</td>
                        <td>{row.lunchQty}</td>
                        <td>{row.dinnerQty}</td>
                        <td>{row.systemQty}</td>
                        <td>
                          <input
                            className="table-input"
                            type="number"
                            min="0"
                            step="0.01"
                            readOnly={!forecastEditing}
                            value={row.factorText}
                            onChange={(event) => {
                              if (!forecastEditing) return
                              const nextValue = event.target.value
                              setQuantityFactorMap((prev) => ({
                                ...prev,
                                [row.baseId]: nextValue,
                              }))
                            }}
                          />
                        </td>
                        <td>{row.estimatedQty}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="forecast-pagination">
              <span className="forecast-pagination-info">
                第 {forecastPage} / {forecastTotalPages} 页，共 {categoryFilteredForecastRows.length} 条
              </span>
              <div className="forecast-pagination-actions">
                <button
                  type="button"
                  className="btn-subtle compact"
                  disabled={forecastPage <= 1}
                  onClick={() => setForecastPage((prev) => Math.max(1, prev - 1))}
                >
                  上一页
                </button>
                <button
                  type="button"
                  className="btn-subtle compact"
                  disabled={forecastPage >= forecastTotalPages}
                  onClick={() => setForecastPage((prev) => Math.min(forecastTotalPages, prev + 1))}
                >
                  下一页
                </button>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="toolbar-card dimension-toolbar">
              <div className="dimension-row">
                <button
                  type="button"
                  className={dimension === 'dish' ? 'segment active' : 'segment'}
                  onClick={() => setDimension('dish')}
                >
                  <ChefHat size={16} /> 菜品
                </button>
                <button
                  type="button"
                  className={dimension === 'item' ? 'segment active' : 'segment'}
                  onClick={() => setDimension('item')}
                >
                  <Box size={16} /> 物品
                </button>
              </div>
              <button type="button" className="search-toggle-btn" onClick={toggleSearch} aria-label="搜索">
                {searchOpen ? <X size={16} /> : <Search size={16} />}
              </button>
            </section>

            {searchOpen && (
              <section className="toolbar-card search-card">
                <div className="search-wrap">
                  <Search size={16} />
                  <input
                    autoFocus
                    placeholder="搜索菜品/物品"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                  />
                </div>
              </section>
            )}

            <section className="list-panel">
              {executionRows.length === 0 ? (
                <div className="empty-state">当前筛选条件下暂无数据</div>
              ) : (
                <>
                  {visibleExecutionRows.map((item) => (
                    <article
                      key={item.id}
                      className={`prep-card ${item.stockState === 'out' ? 'out-stock' : item.stockState === 'warning' ? 'low-stock' : ''}`}
                      onClick={() => openModal(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') openModal(item.id)
                      }}
                    >
                      <div className="card-header">
                        <h3>{item.name}</h3>
                        <div className={`stock-chip ${item.stockState === 'normal' ? '' : 'low'}`}>
                          剩 {item.stockQty} {item.unit}
                        </div>
                      </div>

                      <p className="estimate-text">
                        预估 {item.targetQty} {item.unit}
                      </p>

                      <div className="key-metrics">
                        <div className="metric-main pending">
                          <span>待制作</span>
                          <strong>{item.pendingQty}</strong>
                        </div>
                        <div className="metric-main produced">
                          <span>已制作</span>
                          <strong>{item.producedQty}</strong>
                        </div>
                      </div>

                      {item.overQty > 0 && (
                        <div className="over-row">
                          已超额制备 {item.overQty}
                          {item.unit}
                        </div>
                      )}
                    </article>
                  ))}
                  {hasMoreRows && (
                    <div ref={loadMoreRef} className="load-more-sentinel">
                      继续下滑加载更多
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </div>

      {modalState.open && selectedItem && (
        <div className="modal-mask" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedItem.name}</h3>
              <button type="button" onClick={closeModal} className="icon-btn" aria-label="关闭">
                <X size={16} />
              </button>
            </div>

            <div className="modal-action-tabs">
              <button
                type="button"
                className={modalState.action === 'produce' ? 'modal-action-tab active' : 'modal-action-tab'}
                onClick={() => switchModalAction('produce')}
              >
                备餐
              </button>
              <button
                type="button"
                className={modalState.action === 'loss' ? 'modal-action-tab active' : 'modal-action-tab'}
                onClick={() => switchModalAction('loss')}
              >
                报损
              </button>
            </div>

            {modalState.action === 'produce' ? (
              <>
                <label className="input-label" htmlFor="produce-qty-input">
                  制作数量
                </label>
                <input
                  id="produce-qty-input"
                  className="number-input"
                  type="number"
                  min="0"
                  value={amountInput}
                  onChange={(event) => setAmountInput(event.target.value)}
                />

                {selectedItem.type === 'item' && (
                  <>
                    <label className="input-label" htmlFor="inbound-warehouse-input">
                      入库仓库
                    </label>
                    <div className="select-wrap modal-select-wrap">
                      <select
                        id="inbound-warehouse-input"
                        value={inboundWarehouse}
                        onChange={(event) => setInboundWarehouse(event.target.value)}
                      >
                        {WAREHOUSE_OPTIONS.map((warehouse) => (
                          <option key={warehouse.value} value={warehouse.value}>
                            {warehouse.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <label className="input-label" htmlFor="loss-qty-input">
                  报损数量
                </label>
                <input
                  id="loss-qty-input"
                  className="number-input"
                  type="number"
                  min="0"
                  value={amountInput}
                  onChange={(event) => setAmountInput(event.target.value)}
                />

                {selectedItem.type !== 'item' && (
                  <>
                    <label className="input-label" htmlFor="loss-date-input">
                      报损时间
                    </label>
                    <input
                      id="loss-date-input"
                      className="number-input"
                      type="date"
                      value={lossDate}
                      onChange={(event) => setLossDate(event.target.value)}
                    />
                  </>
                )}

                {selectedItem.type === 'item' && (
                  <>
                    <label className="input-label" htmlFor="outbound-warehouse-input">
                      出库仓库
                    </label>
                    <div className="select-wrap modal-select-wrap">
                      <select
                        id="outbound-warehouse-input"
                        value={outboundWarehouse}
                        onChange={(event) => setOutboundWarehouse(event.target.value)}
                      >
                        {WAREHOUSE_OPTIONS.map((warehouse) => (
                          <option key={warehouse.value} value={warehouse.value}>
                            {warehouse.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </div>

                    <label className="input-label" htmlFor="outbound-date-input">
                      出库日期
                    </label>
                    <input
                      id="outbound-date-input"
                      className="number-input"
                      type="date"
                      value={outboundDate}
                      onChange={(event) => setOutboundDate(event.target.value)}
                    />
                  </>
                )}

                <label className="input-label" htmlFor="loss-reason-input">
                  报损原因
                </label>
                <div className="select-wrap modal-select-wrap">
                  <select id="loss-reason-input" value={lossReason} onChange={(event) => setLossReason(event.target.value)} required>
                    <option value="">请选择报损原因</option>
                    {LOSS_REASON_OPTIONS.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>

                {selectedItem.type === 'item' && (
                  <>
                    <label className="input-label" htmlFor="loss-remark-input">
                      备注
                    </label>
                    <textarea
                      id="loss-remark-input"
                      className="text-area-input"
                      rows={1}
                      placeholder="请输入备注"
                      value={lossRemark}
                      onChange={(event) => setLossRemark(event.target.value)}
                    />
                  </>
                )}
              </>
            )}

            <div className="footer-actions">
              <button type="button" className="btn-subtle" onClick={closeModal}>
                取消
              </button>
              <button type="button" className="btn-primary" onClick={applyRecordAction}>
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}

      {infoModalState.open && (
        <div className="modal-mask info-modal-mask" onClick={closeInfoModal}>
          <div className="modal-card info-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{infoModalState.title}</h3>
              <button type="button" onClick={closeInfoModal} className="icon-btn" aria-label="关闭说明弹窗">
                <X size={16} />
              </button>
            </div>

            <p className="info-modal-content">{infoModalState.content}</p>

            <button type="button" className="btn-primary" onClick={closeInfoModal}>
              我知道了
            </button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default App
