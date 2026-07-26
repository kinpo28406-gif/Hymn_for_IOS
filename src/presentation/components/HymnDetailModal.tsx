import React, { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, Share2 } from 'lucide-react';
import type { Hymn } from '../../domain/entities/Hymn';
import { getCategoryText } from '../../domain/entities/Hymn';
import type { SchedulePlan } from '../../domain/entities/SchedulePlan';
import { formatSchedulePlanDateTime } from '../../domain/entities/SchedulePlan';

interface HymnDetailModalProps {
  hymn: Hymn | null;
  fontSize: number;
  onClose: () => void;
  onShare: () => void;
  onFontSizeChange: (nextFontSize: number) => void;
  schedulePlans?: SchedulePlan[];
  onAddHymnToPlan?: (planId: string, category: string, numberStr: string) => Promise<boolean>;
  onAddExistingHymnToPlan?: (planId: string, hymn: Hymn) => Promise<boolean>;
}

export const HymnDetailModal: React.FC<HymnDetailModalProps> = ({
  hymn,
  fontSize,
  onClose,
  onShare,
  onFontSizeChange,
  schedulePlans = [],
  onAddHymnToPlan,
  onAddExistingHymnToPlan,
}) => {
  const [isFontSidebarExpanded, setIsFontSidebarExpanded] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setIsFontSidebarExpanded(false);
    setIsAddModalOpen(false);
    setAdding(false);
  }, [hymn?.id]);

  if (!hymn) return null;

  const categoryText = getCategoryText(hymn.bookId);
  const canDecrease = fontSize > 12;
  const canIncrease = fontSize < 32;
  const orderedPlans = [...schedulePlans].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  const addToPlan = async (planId: string) => {
    setAdding(true);
    if (onAddExistingHymnToPlan) {
      await onAddExistingHymnToPlan(planId, hymn);
    } else if (onAddHymnToPlan) {
      await onAddHymnToPlan(planId, getCategoryText(hymn.bookId), String(hymn.number));
    }
    setAdding(false);
    setIsAddModalOpen(false);
  };

  return (
    <div className="hymn-modal overflow-hidden">
      <div className="hymn-modal-header px-3 d-flex align-items-center gap-3 flex-shrink-0 user-select-none">
        <button onClick={onClose} className="hymn-modal-close d-inline-flex align-items-center justify-content-center" title="返回"><ArrowLeft size={24} /></button>
        <h1 className="mb-0 fs-6 fw-semibold text-truncate flex-grow-1">({categoryText}){hymn.number} - {hymn.title}</h1>
        <button type="button" onClick={() => setIsAddModalOpen(true)} className="hymn-modal-close d-inline-flex align-items-center justify-content-center flex-shrink-0" title="加入行程" aria-label="加入行程"><Plus size={18} /></button>
        <button type="button" onClick={onShare} className="hymn-modal-close d-inline-flex align-items-center justify-content-center flex-shrink-0" title="分享" aria-label="分享詩歌"><Share2 size={20} /></button>
      </div>

      <div className="flex-grow-1 overflow-auto px-4 px-sm-5 py-4 bg-white">
        <div className="mx-auto d-flex flex-column align-items-center text-center gap-4 pb-4" style={{ maxWidth: '36rem' }}>
          <h2 className="hymn-title display-6 fw-bold lh-sm mb-0">{hymn.title}</h2>
          <div className="lyrics-content text-body text-center w-100" style={{ fontSize: `${fontSize}px` }}>{hymn.body}</div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="overlay-modal-backdrop" style={{ zIndex: 1200 }}>
          <div className="overlay-modal-card">
            <h3 className="h5 fw-bold text-dark mb-2">加入行程</h3>
            <div className="small text-secondary mb-3">選擇一個行程，詩歌會直接加入該行程。</div>
            <div style={{ maxHeight: '40vh', overflow: 'auto' }}>
              {orderedPlans.length === 0 ? (
                <div className="small text-secondary">目前沒有可加入的行程，請先在行程頁新增。</div>
              ) : orderedPlans.map((plan) => (
                <div key={plan.uuid} className="p-3 border-bottom d-flex flex-column gap-3">
                  <div className="d-flex align-items-start justify-content-between gap-3">
                    <div>
                      <div className="fw-semibold">{plan.name}</div>
                      {plan.displayName && <div className="small text-secondary mt-1">{plan.displayName}</div>}
                      <div className="small text-secondary">{formatSchedulePlanDateTime(plan.scheduledAt)} ・ {plan.items.length} 首</div>
                    </div>
                    {plan.isPrimary && <span className="badge text-bg-warning">主行程</span>}
                  </div>
                  <button type="button" className="btn btn-success w-100" disabled={adding} onClick={() => void addToPlan(plan.id)}>
                    {plan.isPrimary ? '加入主行程' : '加入行程'}
                  </button>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-end mt-3"><button type="button" className="btn btn-outline-secondary" onClick={() => setIsAddModalOpen(false)}>取消</button></div>
          </div>
        </div>
      )}

      <button type="button" className={`font-sidebar-handle ${isFontSidebarExpanded ? 'font-sidebar-handle--expanded' : ''}`} onClick={() => setIsFontSidebarExpanded((prev) => !prev)} aria-label={isFontSidebarExpanded ? '收合字體設定' : '展開字體設定'} title={isFontSidebarExpanded ? '收合字體設定' : '展開字體設定'}>{isFontSidebarExpanded ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</button>
      <div className={`font-sidebar d-flex flex-column align-items-center gap-2 ${isFontSidebarExpanded ? 'font-sidebar--expanded' : 'font-sidebar--collapsed'}`}>
        <button type="button" className="font-sidebar__button" onClick={() => onFontSizeChange(fontSize + 1)} disabled={!canIncrease} aria-label="放大字體" title="放大字體"><Plus size={18} /></button>
        <div className="font-sidebar__value">{fontSize}px</div>
        <button type="button" className="font-sidebar__button" onClick={() => onFontSizeChange(fontSize - 1)} disabled={!canDecrease} aria-label="縮小字體" title="縮小字體"><Minus size={18} /></button>
      </div>
    </div>
  );
};
