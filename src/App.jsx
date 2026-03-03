import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Box,
  ChefHat,
  ClipboardList,
  Search,
  TrendingUp,
  X,
} from 'lucide-react'

const DATE_OPTIONS = [
  { value: '2026-03-03', label: '今天 03/03' },
  { value: '2026-03-04', label: '明天 03/04' },
  { value: '2026-03-05', label: '后天 03/05' },
]

const TIME_SLOT_OPTIONS = [
  { id: 'lunch', label: '午市 10:30-14:00' },
  { id: 'dinner', label: '晚市 17:00-21:30' },
]

const DISH_TEMPLATES = [
  { baseId: 'd1', name: '麻婆豆腐', unit: '份', targetQty: 36, producedQty: 25, lossQty: 3, stockQty: 11, warningStock: 10 },
  { baseId: 'd2', name: '宫保鸡丁', unit: '份', targetQty: 42, producedQty: 30, lossQty: 2, stockQty: 8, warningStock: 9 },
  { baseId: 'd3', name: '酸菜鱼', unit: '份', targetQty: 28, producedQty: 21, lossQty: 2, stockQty: 6, warningStock: 8 },
  { baseId: 'd4', name: '蒜蓉生菜', unit: '份', targetQty: 24, producedQty: 18, lossQty: 1, stockQty: 9, warningStock: 6 },
]

const ITEM_TEMPLATES = [
  { baseId: 'i1', name: '鸡丁半成品', unit: 'kg', targetQty: 18, producedQty: 14, lossQty: 1, stockQty: 5, warningStock: 6 },
  { baseId: 'i2', name: '酸菜底料', unit: 'kg', targetQty: 12, producedQty: 9, lossQty: 1, stockQty: 4, warningStock: 5 },
  { baseId: 'i3', name: '豆腐切块', unit: '盒', targetQty: 20, producedQty: 15, lossQty: 0, stockQty: 7, warningStock: 8 },
  { baseId: 'i4', name: '蒜蓉酱', unit: '桶', targetQty: 10, producedQty: 8, lossQty: 1, stockQty: 2, warningStock: 3 },
]

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
  const [keyword, setKeyword] = useState('')
  const [warnOnly, setWarnOnly] = useState(false)

  const [records, setRecords] = useState(() => createInitialRecords())
  const [revenueMap, setRevenueMap] = useState(() => createInitialRevenueMap())
  const [revenueDraft, setRevenueDraft] = useState('')

  const [modalState, setModalState] = useState({
    open: false,
    itemId: '',
    action: 'produce',
  })
  const [amountInput, setAmountInput] = useState('')
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

  const executionRows = useMemo(() => {
    return records
      .filter((item) => item.date === selectedDate && item.slot === selectedSlot)
      .filter((item) => item.type === dimension)
      .filter((item) => item.name.toLowerCase().includes(keyword.trim().toLowerCase()))
      .map((item) => {
        const availableQty = item.producedQty - item.lossQty
        const pendingQty = Math.max(item.targetQty - availableQty, 0)
        const overQty = Math.max(availableQty - item.targetQty, 0)
        const stockState = getStockState(item.stockQty, item.warningStock)
        return {
          ...item,
          availableQty,
          pendingQty,
          overQty,
          stockState,
        }
      })
      .filter((item) => {
        if (!warnOnly) return true
        return item.stockState !== 'normal'
      })
  }, [records, selectedDate, selectedSlot, dimension, keyword, warnOnly])

  const summary = useMemo(() => {
    return executionRows.reduce(
      (acc, item) => {
        acc.targetTotal += item.targetQty
        acc.pendingTotal += item.pendingQty
        acc.producedTotal += item.producedQty
        if (item.stockState === 'warning') acc.warningCount += 1
        if (item.stockState === 'out') acc.outCount += 1
        return acc
      },
      {
        targetTotal: 0,
        pendingTotal: 0,
        producedTotal: 0,
        warningCount: 0,
        outCount: 0,
      },
    )
  }, [executionRows])

  const selectedItem = useMemo(() => {
    if (!modalState.itemId) return null
    return records.find((item) => item.id === modalState.itemId) ?? null
  }, [records, modalState.itemId])

  const currentRevenueDelta = (currentRevenue?.adjusted ?? 0) - (currentRevenue?.base ?? 0)

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

  function openModal(itemId, action) {
    setModalState({
      open: true,
      itemId,
      action,
    })
    setAmountInput('')
  }

  function closeModal() {
    setModalState({ open: false, itemId: '', action: 'produce' })
    setAmountInput('')
  }

  function applyRecordAction() {
    const amount = Number(amountInput)
    if (!Number.isFinite(amount) || amount <= 0) {
      setToast('请输入大于 0 的数量')
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
    setToast(modalState.action === 'produce' ? '已录入制备数量' : '已录入报损数量')
  }

  return (
    <div className="app-shell">
      <div className="app-phone">
        <header className="top-bar">
          <div className="title-wrap">
            <h1>后厨备餐工作台</h1>
            <p>聚焦分时段调整与制备执行</p>
          </div>
          <ClipboardList size={20} />
        </header>

        <nav className="main-tabs">
          <button
            className={activePage === 'execution' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActivePage('execution')}
            type="button"
          >
            备餐执行
          </button>
          <button
            className={activePage === 'revenue' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActivePage('revenue')}
            type="button"
          >
            分时段调整
          </button>
        </nav>

        <section className="toolbar-card">
          <div className="chip-row">
            {DATE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={selectedDate === option.value ? 'chip active' : 'chip'}
                onClick={() => setSelectedDate(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="chip-row">
            {TIME_SLOT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={selectedSlot === option.id ? 'chip active' : 'chip'}
                onClick={() => setSelectedSlot(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {activePage === 'revenue' ? (
          <section className="panel-card">
            <div className="panel-title">
              <TrendingUp size={18} />
              <h2>营业额预估调整</h2>
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
                <strong className={currentRevenueDelta >= 0 ? 'up' : 'down'}>
                  {formatSigned(currentRevenueDelta)}
                </strong>
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
              保存并下发后，将按比例重算 {selectedSlotLabel} 的菜品/物品预估量，并同步到执行页。
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
            <section className="toolbar-card">
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

              <div className="search-wrap">
                <Search size={16} />
                <input
                  placeholder="搜索菜品/物品"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={warnOnly}
                  onChange={(event) => setWarnOnly(event.target.checked)}
                />
                <span>仅看预警</span>
              </label>
            </section>

            <section className="summary-grid">
              <div className="summary-item">
                <span>预估总量</span>
                <strong>{summary.targetTotal}</strong>
              </div>
              <div className="summary-item">
                <span>待制作</span>
                <strong>{summary.pendingTotal}</strong>
              </div>
              <div className="summary-item">
                <span>已制作</span>
                <strong>{summary.producedTotal}</strong>
              </div>
              <div className="summary-item warning-box">
                <span>预警/缺货</span>
                <strong>
                  {summary.warningCount} / {summary.outCount}
                </strong>
              </div>
            </section>

            <section className="list-panel">
              {executionRows.length === 0 ? (
                <div className="empty-state">当前筛选条件下暂无数据</div>
              ) : (
                executionRows.map((item) => {
                  const statusText =
                    item.stockState === 'out'
                      ? '缺货'
                      : item.stockState === 'warning'
                        ? '库存预警'
                        : '库存正常'

                  return (
                    <article
                      key={item.id}
                      className={`prep-card ${item.stockState}`}
                      onClick={() => openModal(item.id, 'produce')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') openModal(item.id, 'produce')
                      }}
                    >
                      <div className="card-top">
                        <h3>{item.name}</h3>
                        <span className={`status-tag ${item.stockState}`}>{statusText}</span>
                      </div>

                      <div className="metrics-grid">
                        <div>
                          <span>预估</span>
                          <strong>{item.targetQty}</strong>
                        </div>
                        <div>
                          <span>待制作</span>
                          <strong>{item.pendingQty}</strong>
                        </div>
                        <div>
                          <span>已制作</span>
                          <strong>{item.producedQty}</strong>
                        </div>
                        <div>
                          <span>剩余库存</span>
                          <strong>{item.stockQty}</strong>
                        </div>
                      </div>

                      <div className="stock-row">
                        <AlertTriangle size={14} />
                        <span>
                          预警值 {item.warningStock} {item.unit} · 当前可用量 {item.availableQty} {item.unit}
                        </span>
                      </div>

                      {item.overQty > 0 && (
                        <div className="over-row">
                          已超额制备 {item.overQty} {item.unit}
                        </div>
                      )}

                      <div className="card-actions" onClick={(event) => event.stopPropagation()}>
                        <button type="button" className="btn-outline" onClick={() => openModal(item.id, 'produce')}>
                          <ArrowUpCircle size={15} /> 录入制备
                        </button>
                        <button type="button" className="btn-danger" onClick={() => openModal(item.id, 'loss')}>
                          <ArrowDownCircle size={15} /> 录入报损
                        </button>
                      </div>
                    </article>
                  )
                })
              )}
            </section>
          </>
        )}
      </div>

      {modalState.open && selectedItem && (
        <div className="modal-mask" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalState.action === 'produce' ? '录入制备数量' : '录入报损数量'}</h3>
              <button type="button" onClick={closeModal} className="icon-btn" aria-label="关闭">
                <X size={16} />
              </button>
            </div>

            <p className="modal-subtitle">{selectedItem.name}</p>
            <p className="hint-text">数据归属：{selectedDate} · {selectedSlotLabel}</p>

            <div className="modal-metrics">
              <span>预估 {selectedItem.targetQty}</span>
              <span>已制作 {selectedItem.producedQty}</span>
              <span>已报损 {selectedItem.lossQty}</span>
            </div>

            <input
              className="number-input"
              type="number"
              min="0"
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              placeholder={`请输入${selectedItem.unit}数量`}
            />

            <div className="quick-actions">
              {[1, 5, 10].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => {
                    const current = Number(amountInput || 0)
                    setAmountInput(String(current + quick))
                  }}
                >
                  +{quick}
                </button>
              ))}
            </div>

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
