import { useHymnApp } from './presentation/hooks/useHymnApp';
import { IosDeviceWrapper } from './presentation/components/IosDeviceWrapper';
import { HeaderTabBar } from './presentation/components/HeaderTabBar';
import { DashboardScreen } from './presentation/screens/DashboardScreen';
import { HomeScreen } from './presentation/screens/HomeScreen';
import { SearchScreen } from './presentation/screens/SearchScreen';
import { ScheduleScreen } from './presentation/screens/ScheduleScreen';
import { HistoryScreen } from './presentation/screens/HistoryScreen';
import { SettingsScreen } from './presentation/screens/SettingsScreen';
import { HymnDetailModal } from './presentation/components/HymnDetailModal';
import { getCategoryText } from './domain/entities/Hymn';
import { formatSchedulePlanDateTime } from './domain/entities/SchedulePlan';

const PICKER_TAB_INDEX = 1;
const SEARCH_TAB_INDEX = 2;
const SCHEDULE_TAB_INDEX = 3;
const HISTORY_TAB_INDEX = 4;
const SETTINGS_TAB_INDEX = 5;

export function App() {
  const {
    activeTab,
    setActiveTab,
    activeHymn,
    activeHymnTab,
    closeActiveHymn,
    restoreRememberedPickerHymn,
    historyRecords,
    schedulePlans,
    settings,
    updateSettings,
    homeDraft,
    setHomeDraft,
    dataSourceInfo,
    isInitializing,
    toasts,
    showToast,
    openHymn,
    openHymnByNumber,
    findAndOpenHymn,
    searchHymns,
    importSqliteDb,
    resetToDefaultJson,
    clearHistory,
    addSchedulePlan,
    deleteSchedulePlan,
    setPrimarySchedulePlan,
    clearExpiredSchedulePlans,
    addHymnToSchedulePlan,
    addExistingHymnToSchedulePlan,
    removeHymnFromSchedulePlan,
    moveSchedulePlanItem,
    getSchedulePlanShareData,
    shareSchedulePlan,
    pendingImportedPlan,
    dismissPendingImportedPlan,
    confirmImportSharedPlan,
  } = useHymnApp();

  const handleShareHymn = async () => {
    if (!activeHymn) return;

    const categoryText = getCategoryText(activeHymn.bookId);
    const shareTitle = `(${categoryText})${activeHymn.number} - ${activeHymn.title}`;
    const shareUrl = window.location.href;
    const shareText = `${shareTitle}\n\n${activeHymn.body}`;
    const shareData = {
      title: shareTitle,
      text: shareText,
      url: shareUrl,
    };

    if (!navigator.share) {
      showToast('目前這個開啟方式不支援 iOS 原生分享，請用 Safari 開啟', 'error');
      return;
    }

    try {
      if (navigator.canShare && !navigator.canShare(shareData)) {
        showToast('目前這個頁面無法叫出 iOS 原生分享，請改用 Safari 開啟', 'error');
        return;
      }

      await navigator.share(shareData);
      showToast('已開啟 iOS 分享選單', 'info');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      showToast('目前無法叫出 iOS 原生分享，請確認是在 Safari 裡開啟', 'error');
    }
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);

    if (index === PICKER_TAB_INDEX) {
      if (activeHymn && activeHymnTab !== PICKER_TAB_INDEX) {
        closeActiveHymn({ clearRemembered: false });
      }

      if (!activeHymn || activeHymnTab !== PICKER_TAB_INDEX) {
        restoreRememberedPickerHymn();
      }
      return;
    }

    if (activeHymn) {
      closeActiveHymn({ clearRemembered: false });
    }
  };

  const openTab = (index: number) => {
    handleTabChange(index);
  };

  return (
    <IosDeviceWrapper>
      {isInitializing && (
        <div className="app-loading-overlay">
          <div className="bg-white rounded-4 shadow-lg px-4 py-3 d-flex align-items-center gap-3 text-secondary fw-semibold small">
            <div
              className="app-spinner spinner-border text-success"
              role="status"
              aria-hidden="true"
            />
            載入資料庫中...
          </div>
        </div>
      )}

      <div className="app-toast-stack d-flex flex-column gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-card rounded-4 px-3 py-2 small fw-semibold ${
              toast.type === 'error'
                ? 'toast-card--error'
                : toast.type === 'success'
                  ? 'toast-card--success'
                  : 'toast-card--info'
            }`}
          >
            {toast.text}
          </div>
        ))}
      </div>

      <div className="app-shell">
        {activeTab === 0 && (
          <DashboardScreen
            plans={schedulePlans}
            onOpenPicker={() => openTab(PICKER_TAB_INDEX)}
            onOpenSchedules={() => openTab(SCHEDULE_TAB_INDEX)}
            onSelectHymn={(bookId, number) => {
              void openHymnByNumber(bookId, number);
            }}
          />
        )}
        {activeTab === PICKER_TAB_INDEX && (
          <HomeScreen
            input={homeDraft}
            onInputChange={setHomeDraft}
            onConfirm={(category, number) => findAndOpenHymn(category, number)}
          />
        )}
        {activeTab === SEARCH_TAB_INDEX && (
          <SearchScreen
            onSearch={searchHymns}
            onSelectHymn={openHymn}
          />
        )}
        {activeTab === SCHEDULE_TAB_INDEX && (
          <ScheduleScreen
            plans={schedulePlans}
            onAddPlan={addSchedulePlan}
            onDeletePlan={deleteSchedulePlan}
            onSetPrimaryPlan={setPrimarySchedulePlan}
            onClearExpiredPlans={clearExpiredSchedulePlans}
            onSelectHymn={(bookId, number) => {
              void openHymnByNumber(bookId, number);
            }}
            onAddHymn={addHymnToSchedulePlan}
            onRemoveHymn={removeHymnFromSchedulePlan}
            onMoveItem={moveSchedulePlanItem}
            onSharePlan={shareSchedulePlan}
            getShareData={getSchedulePlanShareData}
          />
        )}
        {activeTab === HISTORY_TAB_INDEX && (
          <HistoryScreen
            records={historyRecords}
            onSelectHymn={openHymnByNumber}
            onClearHistory={clearHistory}
          />
        )}
        {activeTab === SETTINGS_TAB_INDEX && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={updateSettings}
            dataSourceInfo={dataSourceInfo}
            onImportDb={importSqliteDb}
            onResetDb={resetToDefaultJson}
          />
        )}

        <HymnDetailModal
          hymn={activeHymn}
          fontSize={settings.fontSize}
          onFontSizeChange={(nextFontSize) =>
            updateSettings({
              fontSize: Math.max(12, Math.min(32, nextFontSize)),
            })
          }
          onShare={handleShareHymn}
          onClose={() => closeActiveHymn({ clearRemembered: true })}
          schedulePlans={schedulePlans}
          onAddHymnToPlan={addHymnToSchedulePlan}
          onAddExistingHymnToPlan={addExistingHymnToSchedulePlan}
        />

        {pendingImportedPlan && (
          <div className="overlay-modal-backdrop">
            <div className="overlay-modal-card overlay-modal-card--wide">
              <h3 className="h5 fw-bold text-dark mb-2">匯入分享行程</h3>
              <p className="small text-secondary mb-3">
                這個連結包含一個可匯入的行程。確認後會加入你的行程分頁，同一個 UUID 不會重複匯入。
              </p>

              <div className="schedule-export-block">
                <div className="fw-semibold text-dark">{pendingImportedPlan.name}</div>
                <div className="small text-secondary mt-1">
                  時間：{formatSchedulePlanDateTime(pendingImportedPlan.scheduledAt)} ・ {pendingImportedPlan.items.length} 首
                </div>

                <div className="d-flex flex-column gap-2 mt-3">
                  {pendingImportedPlan.items.length === 0 ? (
                    <div className="small text-secondary">這個分享行程目前沒有詩歌。</div>
                  ) : (
                    pendingImportedPlan.items.map((item, index) => (
                      <div key={item.id} className="small text-dark">
                        {index + 1}. ({getCategoryText(item.bookId)}){item.number} - {item.title}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={dismissPendingImportedPlan}>
                  取消
                </button>
                <button type="button" className="btn btn-success" onClick={confirmImportSharedPlan}>
                  匯入
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <HeaderTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </IosDeviceWrapper>
  );
}

export default App;
