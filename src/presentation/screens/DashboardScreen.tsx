import React from 'react';
import { CalendarDays, Clock3, ListMusic, Music4 } from 'lucide-react';
import type { SchedulePlan } from '../../domain/entities/SchedulePlan';
import { isPlanExpired, isPlanToday } from '../../domain/entities/SchedulePlan';
import { getCategoryText } from '../../domain/entities/Hymn';

interface DashboardScreenProps {
  plans: SchedulePlan[];
  onOpenPicker: () => void;
  onOpenSchedules: () => void;
  onSelectHymn: (bookId: number, number: number) => void;
}

function formatTimeLabel(value: string): string {
  const date = new Date(value);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  plans,
  onOpenPicker,
  onOpenSchedules,
  onSelectHymn,
}) => {
  const todayPlans = plans.filter((plan) => isPlanToday(plan));
  const upcomingPlans = todayPlans.filter((plan) => !isPlanExpired(plan));
  const pastPlans = todayPlans.filter((plan) => isPlanExpired(plan));
  const primaryPlan = plans.find((plan) => plan.isPrimary);

  return (
    <div className="screen-root overflow-auto p-4 p-sm-4 pt-4 pt-sm-5">
      <div className="d-flex flex-column gap-4">
        <div className="screen-panel p-4">
          <div className="d-flex align-items-start justify-content-between gap-3">
            <div className="d-flex flex-column gap-2">
              <h2 className="h4 fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                <CalendarDays size={22} className="text-success" />
                主頁
              </h2>
              <p className="small text-secondary mb-0">
                這裡只顯示今天的行程，方便你快速查看今天要唱的詩歌。
              </p>
            </div>
            <span className="dashboard-badge badge rounded-pill text-bg-success px-3 py-2">
              今天 {todayPlans.length} 個行程
            </span>
          </div>

          <div className="d-flex flex-wrap gap-2 mt-4">
            <button type="button" className="btn btn-success" onClick={onOpenPicker}>
              前往點歌
            </button>
            <button type="button" className="btn btn-outline-success" onClick={onOpenSchedules}>
              管理行程
            </button>
          </div>
        </div>

        {primaryPlan && (
          <section className="screen-panel p-4 d-flex flex-column gap-3">
            <div className="d-flex align-items-center justify-content-between gap-3">
              <div>
                <div className="small text-success fw-semibold mb-1">主行程</div>
                <div className="fw-semibold text-dark">{primaryPlan.name}</div>
              </div>
              <span className="small text-success fw-semibold">{primaryPlan.items.length} 首</span>
            </div>
            {primaryPlan.items.length === 0 ? (
              <div className="small text-secondary">這個主行程還沒有加入詩歌。</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {primaryPlan.items.map((item) => (
                  <button key={item.id} type="button" onClick={() => onSelectHymn(item.bookId, item.number)} className="dashboard-hymn-button text-start">
                    <Music4 size={16} className="text-success flex-shrink-0" />
                    <span className="small fw-medium text-dark">({getCategoryText(item.bookId)}){item.number} - {item.title}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {todayPlans.length === 0 ? (
          <div className="screen-panel p-4 text-center">
            <div className="mx-auto mb-3 d-inline-flex rounded-circle bg-success-subtle text-success p-3">
              <ListMusic size={24} />
            </div>
            <p className="fw-semibold text-dark mb-1">今天還沒有安排行程</p>
            <p className="small text-secondary mb-3">可以先到行程分頁新增，或直接到點歌分頁選詩歌。</p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <button type="button" className="btn btn-success" onClick={onOpenSchedules}>
                新增今天行程
              </button>
              <button type="button" className="btn btn-outline-success" onClick={onOpenPicker}>
                去點歌
              </button>
            </div>
          </div>
        ) : (
          <>
            <section className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center gap-2 text-dark fw-semibold">
                <Clock3 size={18} className="text-success" />
                接下來
              </div>

              {upcomingPlans.length === 0 ? (
                <div className="screen-panel p-4 small text-secondary">今天接下來沒有未到時間的行程。</div>
              ) : (
                upcomingPlans.map((plan) => (
                  <div key={plan.id} className="screen-panel p-4 d-flex flex-column gap-3">
                    <div className="d-flex align-items-center justify-content-between gap-3">
                      <div>
                        <div className="fw-semibold text-dark">{plan.name}</div>
                        <div className="small text-secondary">{formatTimeLabel(plan.scheduledAt)}</div>
                      </div>
                      <span className="small text-success fw-semibold">{plan.items.length} 首</span>
                    </div>

                    {plan.items.length === 0 ? (
                      <div className="small text-secondary">這個行程還沒有加入詩歌。</div>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {plan.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelectHymn(item.bookId, item.number)}
                            className="dashboard-hymn-button text-start"
                          >
                            <Music4 size={16} className="text-success flex-shrink-0" />
                            <span className="small fw-medium text-dark">
                              ({getCategoryText(item.bookId)}){item.number} - {item.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </section>

            <section className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center gap-2 text-dark fw-semibold">
                <Clock3 size={18} className="text-secondary" />
                已過時間
              </div>

              {pastPlans.length === 0 ? (
                <div className="screen-panel p-4 small text-secondary">今天還沒有已過時間的行程。</div>
              ) : (
                pastPlans.map((plan) => (
                  <div key={plan.id} className="screen-panel p-4 d-flex flex-column gap-3 opacity-75">
                    <div className="d-flex align-items-center justify-content-between gap-3">
                      <div>
                        <div className="fw-semibold text-dark">{plan.name}</div>
                        <div className="small text-secondary">{formatTimeLabel(plan.scheduledAt)}</div>
                      </div>
                      <span className="small text-secondary fw-semibold">{plan.items.length} 首</span>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      {plan.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onSelectHymn(item.bookId, item.number)}
                          className="dashboard-hymn-chip"
                        >
                          ({getCategoryText(item.bookId)}){item.number}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};
