import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Box, ChefHat, ChevronDown, Search, TrendingUp, X } from 'lucide-react'

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
    date.setDate(date.getDate() - offset)

    const value = toDateValue(date)
    let label = value.replace(/-/g, '/')

    if (offset === 0) {
      label += '（今日）'
    } else if (offset === 1) {
      label += '（昨日）'
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

const STOCK_STATE_PRIORITY = {
  out: 0,
  warning: 1,
  normal: 2,
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

function App() {
  const [activePage, setActivePage] = useState('execution')
  const [selectedDate, setSelectedDate] = useState(DATE_OPTIONS[0].value)
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOT_OPTIONS[0].id)
  const [dimension, setDimension] = useState('dish')
  const [searchOpen, setSearchOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [visibleCount, setVisibleCount] = useState(LIST_PAGE_SIZE)
  const loadMoreRef = useRef(null)

  const [records, setRecords] = useState(() => createInitialRecords())
  const [revenueMap, setRevenueMap] = useState(() => createInitialRevenueMap())
  const [revenueDraft, setRevenueDraft] = useState('')

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
  const [toast, setToast] = useState('')

  const currentKey = composeKey(selectedDate, selectedSlot)
  const currentRevenue = revenueMap[currentKey]
  const selectedSlotLabel =
    TIME_SLOT_OPTIONS.find((option) => option.id === selectedSlot)?.label ?? '当前时段'

  useEffect(() => {
    setRevenueDraft(String(currentRevenue?.adjusted ?? 0))
  }, [currentKey, currentRevenue?.adjusted])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 1800)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    setVisibleCount(LIST_PAGE_SIZE)
  }, [selectedDate, selectedSlot, dimension, keyword])

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

  const currentRevenueDelta = (currentRevenue?.adjusted ?? 0) - (currentRevenue?.base ?? 0)

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

  function handleQuickAdjust(percent) {
    const currentValue = Number(revenueDraft || currentRevenue?.adjusted || 0)
    const nextValue = Math.max(0, Math.round(currentValue * (1 + percent / 100)))
    setRevenueDraft(String(nextValue))
  }

  function handleRevenueCommit(mode) {
    const nextRevenue = Number(revenueDraft)
    if (!Number.isFinite(nextRevenue) || nextRevenue <= 0) {
      setToast('请输入大于 0 的营业额')
      return
    }

    const prevAdjusted = currentRevenue?.adjusted ?? nextRevenue
    const ratio = prevAdjusted === 0 ? 1 : nextRevenue / prevAdjusted

    setRevenueMap((prev) => ({
      ...prev,
      [currentKey]: {
        ...prev[currentKey],
        adjusted: nextRevenue,
      },
    }))

    setRecords((prev) =>
      prev.map((item) => {
        if (item.date !== selectedDate || item.slot !== selectedSlot) return item
        return {
          ...item,
          targetQty: roundNumber(item.targetQty * ratio),
        }
      }),
    )

    setToast(mode === 'publish' ? '已保存并下发到备餐执行页' : '已保存当前时段营业额调整')
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

          <h1 className="header-title">{activePage === 'execution' ? '备餐' : '营业额预估调整'}</h1>

          {activePage === 'execution' ? (
            <button type="button" className="header-right-btn" onClick={() => setActivePage('revenue')}>
              营业额预估调整
            </button>
          ) : (
            <span className="header-right-placeholder" />
          )}
        </header>

        <section className="toolbar-card filter-bar">
          <div className="dropdown-item">
            <span className="dropdown-label">营业日</span>
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

          <div className="dropdown-item">
            <span className="dropdown-label">营业时段</span>
            <div className="select-wrap">
              <select value={selectedSlot} onChange={(event) => setSelectedSlot(event.target.value)}>
                {TIME_SLOT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} />
            </div>
          </div>
        </section>

        {activePage === 'revenue' ? (
          <section className="panel-card">
            <div className="panel-title">
              <TrendingUp size={18} />
              <h2>分时段营业额预估调整</h2>
            </div>

            <div className="revenue-stats">
              <div className="stat-block">
                <span>基础预估</span>
                <strong>{currentRevenue?.base ?? 0}</strong>
              </div>
              <div className="stat-block">
                <span>当前调整后</span>
                <strong>{currentRevenue?.adjusted ?? 0}</strong>
              </div>
              <div className="stat-block">
                <span>调整差值</span>
                <strong className={currentRevenueDelta >= 0 ? 'up' : 'down'}>{formatSigned(currentRevenueDelta)}</strong>
              </div>
            </div>

            <label className="input-label" htmlFor="revenue-input">
              当前时段营业额（元）
            </label>
            <input
              id="revenue-input"
              className="number-input"
              type="number"
              min="0"
              value={revenueDraft}
              onChange={(event) => setRevenueDraft(event.target.value)}
            />

            <div className="quick-actions">
              <button type="button" onClick={() => handleQuickAdjust(5)}>
                +5%
              </button>
              <button type="button" onClick={() => handleQuickAdjust(10)}>
                +10%
              </button>
              <button type="button" onClick={() => handleQuickAdjust(-5)}>
                -5%
              </button>
              <button type="button" onClick={() => handleQuickAdjust(-10)}>
                -10%
              </button>
            </div>

            <p className="hint-text">
              保存并下发后，将按比例重算 {selectedSlotLabel} 的菜品/物品预估量，并同步到备餐执行页。
            </p>

            <div className="footer-actions">
              <button type="button" className="btn-subtle" onClick={() => handleRevenueCommit('save')}>
                仅保存
              </button>
              <button type="button" className="btn-primary" onClick={() => handleRevenueCommit('publish')}>
                保存并下发
              </button>
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

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default App
