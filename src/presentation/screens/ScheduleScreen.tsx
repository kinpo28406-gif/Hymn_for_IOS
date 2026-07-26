import React, { useMemo, useState } from 'react';
import {
  CalendarPlus,
  ChevronDown,
  ChevronUp,
  Clock3,
  Music4,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Share2,
  Link2,
  Star,
} from 'lucide-react';
import type { SchedulePlan } from '../../domain/entities/SchedulePlan';
import { formatSchedulePlanDateTime, isPlanExpired } from '../../domain/entities/SchedulePlan';
import { getCategoryText } from '../../domain/entities/Hymn';

interface ScheduleScreenProps {
  plans: SchedulePlan[];
  onAddPlan: (name: string, scheduledAt: string, category: string) => boolean;
  onDeletePlan: (planId: string) => void;
  onSetPrimaryPlan: (planId: string) => void;
  onClearExpiredPlans: () => void;
  onSelectHymn: (bookId: number, number: number) => void;
  onAddHymn: (planId: string, category: string, number: string) => Promise<boolean>;
  onRemoveHymn: (planId: string, itemId: string) => void;
  onMoveItem: (planId: string, itemId: string, direction: 'up' | 'down') => void;
  onSharePlan: (planId: string) => Promise<boolean>;
  getShareData: (planId: string) => { title: string; text: string; url: string } | null;
}

const CATEGORIES = ['詩歌', '補充', '新歌', '新詩', '藍本'];

const DEFAULT_SCHEDULE_CATEGORIES = ['主日聚會', '活力排', '禱告聚會', '相調'];
const SCHEDULE_CATEGORIES_KEY = 'schedule_categories';

function loadScheduleCategories(): string[] {
  try {
    const raw = localStorage.getItem(SCHEDULE_CATEGORIES_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved) && saved.every((category) => typeof category === 'string')) {
        return [...new Set([...DEFAULT_SCHEDULE_CATEGORIES, ...saved.map((category) => category.trim()).filter(Boolean)])];
      }
    }
  } catch {
    // Use defaults if saved data is invalid.
  }

  localStorage.setItem(SCHEDULE_CATEGORIES_KEY, JSON.stringify(DEFAULT_SCHEDULE_CATEGORIES));
  return DEFAULT_SCHEDULE_CATEGORIES;
}

function getDefaultDateTimeValue(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

interface DeleteState {
  type: 'plan' | 'expired';
  planId?: string;
  planName?: string;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  plans,
  onAddPlan,
  onDeletePlan,
  onSetPrimaryPlan,
  onClearExpiredPlans,
  onSelectHymn,
  onAddHymn,
  onRemoveHymn,
  onMoveItem,
  onSharePlan,
  getShareData,
}) => {
  const [expandedPlanIds, setExpandedPlanIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [exportPlanId, setExportPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState('');
  const [scheduledAt, setScheduledAt] = useState(getDefaultDateTimeValue());
  const [scheduleCategories, setScheduleCategories] = useState<string[]>(loadScheduleCategories);
  const [planCategory, setPlanCategory] = useState(DEFAULT_SCHEDULE_CATEGORIES[0]);
  const [selectedScheduleCategory, setSelectedScheduleCategory] = useState<string | null>(null);
  const [itemInputs, setItemInputs] = useState<Record<string, { category: string; number: string }>>({});

  const expiredCount = useMemo(
    () => plans.filter((plan) => isPlanExpired(plan)).length,
    [plans]
  );

  const toggleExpanded = (planId: string) => {
    setExpandedPlanIds((prev) => (
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId]
    ));
  };

  const handleAddScheduleCategory = () => {
    const name = window.prompt('請輸入新類別名稱')?.trim();
    if (!name) return;

    if (scheduleCategories.includes(name)) {
      setSelectedScheduleCategory(name);
      return;
    }

    const next = [...scheduleCategories, name];
    setScheduleCategories(next);
    localStorage.setItem(SCHEDULE_CATEGORIES_KEY, JSON.stringify(next));
    setPlanCategory(name);
    setSelectedScheduleCategory(name);
  };

  const visiblePlans = selectedScheduleCategory
    ? plans.filter((plan) => plan.category === selectedScheduleCategory)
    : plans;

  const handleAddPlan = () => {
    const created = onAddPlan(planName, scheduledAt, planCategory);
    if (!created) {
      return;
    }

    setPlanName('');
    setScheduledAt(getDefaultDateTimeValue());
    setPlanCategory(scheduleCategories[0] || DEFAULT_SCHEDULE_CATEGORIES[0]);
    setIsAddModalOpen(false);
  };

  const handleAddHymn = async (planId: string) => {
    const input = itemInputs[planId] || { category: CATEGORIES[0], number: '' };
    const added = await onAddHymn(planId, input.category, input.number);
    if (!added) {
      return;
    }

    setItemInputs((prev) => ({
      ...prev,
      [planId]: { ...input, number: '' },
    }));
  };

  const confirmDelete = () => {
    if (!deleteState) {
      return;
    }

    if (deleteState.type === 'plan' && deleteState.planId) {
      onDeletePlan(deleteState.planId);
      setExpandedPlanIds((prev) => prev.filter((id) => id !== deleteState.planId));
    }

    if (deleteState.type === 'expired') {
      onClearExpiredPlans();
    }

    setDeleteState(null);
  };

  const exportData = exportPlanId ? getShareData(exportPlanId) : null;

  const handleNativeShare = async (planId: string) => {
    const shared = await onSharePlan(planId);
    if (!shared) {
      setExportPlanId(planId);
    }
  };

  return (
    <div className="screen-root overflow-auto p-4 p-sm-4 pt-4 pt-sm-5">
      <div className="d-flex flex-column gap-4">
        <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
          <h2 className="h4 fw-bold text-dark d-flex align-items-center gap-2 mb-0">
            <CalendarPlus size={22} className="text-success" />
            行程
          </h2>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-danger"
              disabled={expiredCount === 0}
              onClick={() => setDeleteState({ type: 'expired' })}
            >
              刪除已過行程{expiredCount > 0 ? ` (${expiredCount})` : ''}
            </button>
            <button
              type="button"
              className="btn btn-success d-flex align-items-center gap-1"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} />
              新增行程
            </button>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center" aria-label="行程類別">
          <button type="button" className={`btn btn-sm ${selectedScheduleCategory === null ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setSelectedScheduleCategory(null)}>全部</button>
          {scheduleCategories.map((category) => (
            <button key={category} type="button" className={`btn btn-sm ${selectedScheduleCategory === category ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setSelectedScheduleCategory(category)}>
              {category}
            </button>
          ))}
          <button type="button" className="btn btn-sm btn-outline-success" onClick={handleAddScheduleCategory}>+ 新增類別</button>
        </div>

        {visiblePlans.length === 0 ? (
          <div className="screen-panel p-4 text-center text-secondary">
            目前還沒有行程，按右上角新增行程就可以開始建立。
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {visiblePlans.map((plan) => {
              const isExpanded = expandedPlanIds.includes(plan.id);
              const input = itemInputs[plan.id] || { category: CATEGORIES[0], number: '' };

              return (
                <div key={plan.id} className="screen-panel overflow-hidden">
                  <div className="p-3 border-bottom d-flex flex-column gap-3">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(plan.id)}
                      className="schedule-plan-toggle text-start"
                    >
                      <div className="fw-semibold text-dark">{plan.name}</div>
                      {plan.displayName && <div className="small text-secondary mt-1">{plan.displayName}</div>}
                      <div className="small text-secondary d-flex align-items-center gap-2 mt-1">
                        <Clock3 size={14} />
                        {formatSchedulePlanDateTime(plan.scheduledAt)}
                        <span>•</span>
                        <span>{plan.items.length} 首</span>
                        {isPlanExpired(plan) && (
                          <>
                            <span>•</span>
                            <span className="text-danger fw-semibold">已過時間</span>
                          </>
                        )}
                      </div>
                    </button>

                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleNativeShare(plan.id)}
                        className="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-1"
                        aria-label="分享行程"
                        title="分享行程"
                      >
                        <Share2 size={16} />
                        分享
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetPrimaryPlan(plan.id)}
                        className={`btn btn-sm d-inline-flex align-items-center gap-1 ${plan.isPrimary ? 'btn-warning' : 'btn-outline-secondary'}`}
                        aria-label={plan.isPrimary ? '目前主行程' : '設為主行程'}
                      >
                        <Star size={16} fill={plan.isPrimary ? 'currentColor' : 'none'} />
                        {plan.isPrimary ? '主行程' : '設為主行程'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(plan.id)}
                        className="schedule-icon-button ms-auto"
                        aria-label={isExpanded ? '收合行程' : '展開行程'}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteState({ type: 'plan', planId: plan.id, planName: plan.name })}
                        className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
                        aria-label="刪除行程"
                      >
                        <Trash2 size={16} />
                        刪除
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3 d-flex flex-column gap-3">
                      <div className="schedule-add-row">
                        <select
                          value={input.category}
                          onChange={(e) => setItemInputs((prev) => ({
                            ...prev,
                            [plan.id]: { ...input, category: e.target.value },
                          }))}
                          className="form-select"
                        >
                          {CATEGORIES.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>

                        <input
                          type="text"
                          inputMode="numeric"
                          value={input.number}
                          onChange={(e) => setItemInputs((prev) => ({
                            ...prev,
                            [plan.id]: { ...input, number: e.target.value },
                          }))}
                          placeholder="詩歌編號"
                          className="form-control"
                        />

                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() => void handleAddHymn(plan.id)}
                        >
                          加入詩歌
                        </button>
                      </div>

                      {plan.items.length === 0 ? (
                        <div className="small text-secondary">這個行程還沒有詩歌。</div>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          {plan.items.map((item, index) => (
                            <div key={item.id} className="schedule-item-row">
                              <button
                                type="button"
                                onClick={() => onSelectHymn(item.bookId, item.number)}
                                className="schedule-item-main"
                              >
                                <div className="d-flex align-items-center gap-3">
                                  <Music4 size={16} className="text-success flex-shrink-0" />
                                  <span className="small fw-medium text-dark">
                                    ({getCategoryText(item.bookId)}){item.number} - {item.title}
                                  </span>
                                </div>
                              </button>

                              <div className="d-flex align-items-center gap-2">
                                <button
                                  type="button"
                                  className="schedule-icon-button"
                                  onClick={() => onMoveItem(plan.id, item.id, 'up')}
                                  disabled={index === 0}
                                  aria-label="上移"
                                >
                                  <ArrowUp size={16} />
                                </button>
                                <button
                                  type="button"
                                  className="schedule-icon-button"
                                  onClick={() => onMoveItem(plan.id, item.id, 'down')}
                                  disabled={index === plan.items.length - 1}
                                  aria-label="下移"
                                >
                                  <ArrowDown size={16} />
                                </button>
                                <button
                                  type="button"
                                  className="schedule-icon-button schedule-icon-button--danger"
                                  onClick={() => onRemoveHymn(plan.id, item.id)}
                                  aria-label="刪除詩歌"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="overlay-modal-backdrop">
          <div className="overlay-modal-card">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
              <h3 className="h5 fw-bold mb-0 text-dark">新增行程</h3>
              <button
                type="button"
                className="schedule-icon-button"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="關閉"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            <div className="d-flex flex-column gap-3">
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="form-control"
              />
              <select
                value={planCategory}
                onChange={(e) => setPlanCategory(e.target.value)}
                className="form-select"
                aria-label="行程類別"
              >
                {scheduleCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="行程名稱（非必填）"
                className="form-control"
              />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setIsAddModalOpen(false)}>
                取消
              </button>
              <button type="button" className="btn btn-success" onClick={handleAddPlan}>
                建立
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteState && (
        <div className="overlay-modal-backdrop">
          <div className="overlay-modal-card">
            <h3 className="h5 fw-bold text-dark mb-2">確認刪除</h3>
            <p className="text-secondary small mb-0">
              {deleteState.type === 'plan'
                ? `確定要刪除「${deleteState.planName}」嗎？`
                : `確定要刪除全部已過時間的行程嗎？`}
            </p>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setDeleteState(null)}>
                取消
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {exportData && (
        <div className="overlay-modal-backdrop">
          <div className="overlay-modal-card overlay-modal-card--wide">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
              <div>
                <h3 className="h5 fw-bold text-dark mb-1">匯出行程</h3>
                <p className="small text-secondary mb-0">這份內容已整理成適合貼到群組的格式，也附上可匯入連結。</p>
              </div>
              <button
                type="button"
                className="schedule-icon-button"
                onClick={() => setExportPlanId(null)}
                aria-label="關閉"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            <div className="schedule-export-block mb-3">
              <div className="small fw-semibold text-dark mb-2">易讀內容</div>
              <pre className="schedule-export-pre mb-0">{exportData.text}</pre>
            </div>

            <div className="schedule-export-block">
              <div className="small fw-semibold text-dark mb-2 d-flex align-items-center gap-2">
                <Link2 size={14} />
                匯入連結
              </div>
              <div className="small text-break text-secondary">{exportData.url}</div>
            </div>

            <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-success d-flex align-items-center gap-2"
                onClick={() => {
                  if (exportPlanId) void handleNativeShare(exportPlanId);
                }}
              >
                <Share2 size={14} />
                系統分享
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
