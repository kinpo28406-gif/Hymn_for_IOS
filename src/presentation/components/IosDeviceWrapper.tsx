import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Radio } from 'lucide-react';

export type IosDevicePreset = 'auto' | 'iphone-x' | 'iphone-pro' | 'iphone-promax';

interface IosDeviceWrapperProps {
  children: React.ReactNode;
}

export const IosDeviceWrapper: React.FC<IosDeviceWrapperProps> = ({ children }) => {
  const [preset, setPreset] = useState<IosDevicePreset>('auto');
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const getDeviceSpecs = () => {
    if (preset === 'iphone-x') {
      return { width: 375, height: 812, name: 'iPhone X / 10 (一般版)', type: 'notch' };
    }
    if (preset === 'iphone-pro') {
      return { width: 393, height: 852, name: 'iPhone 15 / 16 Pro (Pro 版)', type: 'island' };
    }
    if (preset === 'iphone-promax') {
      return { width: 430, height: 932, name: 'iPhone 16 Pro Max (Pro Max 版)', type: 'island' };
    }

    if (windowWidth < 380) {
      return { width: '100%', height: '100%', name: 'Auto RWD - iPhone 10 (一般版)', type: 'notch' };
    } else if (windowWidth < 410) {
      return { width: '100%', height: '100%', name: 'Auto RWD - iPhone Pro 系列', type: 'island' };
    } else {
      return { width: '100%', height: '100%', name: 'Auto RWD - iPhone Pro Max 系列', type: 'island' };
    }
  };

  const specs = getDeviceSpecs();
  const isFrameMode = preset !== 'auto';

  if (windowWidth < 640 && preset === 'auto') {
    return (
      <div className="device-mobile-shell">
        {children}
      </div>
    );
  }

  return (
    <div className="device-shell d-flex flex-column align-items-center justify-content-start p-2 p-sm-4">
      <div className="device-toolbar rounded-4 p-3 mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2">
          <Smartphone size={20} className="text-info" />
          <span className="small fw-semibold text-light">
            {specs.name}
          </span>
        </div>

        <div
          className="device-toggle-group hide-scrollbar rounded-4 p-1 d-flex align-items-center gap-1 flex-nowrap w-100 overflow-auto"
          style={{ width: windowWidth >= 576 ? 'auto' : '100%' }}
        >
          <button
            onClick={() => setPreset('auto')}
            className={`device-toggle-btn px-3 py-2 small fw-medium ${preset === 'auto' ? 'active' : ''}`}
            title="自動偵測裝置寬度 (Auto RWD)"
          >
            <Monitor size={14} className="me-1 align-text-bottom" />
            自動偵測
          </button>
          <button
            onClick={() => setPreset('iphone-x')}
            className={`device-toggle-btn px-3 py-2 small fw-medium ${preset === 'iphone-x' ? 'active' : ''}`}
          >
            一般版 (X)
          </button>
          <button
            onClick={() => setPreset('iphone-pro')}
            className={`device-toggle-btn px-3 py-2 small fw-medium ${preset === 'iphone-pro' ? 'active' : ''}`}
          >
            Pro 版
          </button>
          <button
            onClick={() => setPreset('iphone-promax')}
            className={`device-toggle-btn px-3 py-2 small fw-medium ${preset === 'iphone-promax' ? 'active' : ''}`}
          >
            Pro Max
          </button>
        </div>
      </div>

      <div
        className={`device-frame ${
          isFrameMode
            ? 'device-frame--fixed'
            : 'device-frame--auto'
        }`}
        style={{
          width: isFrameMode ? `${specs.width}px` : undefined,
          height: isFrameMode ? `${specs.height}px` : undefined,
        }}
      >
        {specs.type === 'island' ? (
          <div className="device-cutout device-cutout--island d-flex align-items-center justify-content-between px-2 shadow">
            <div
              className="rounded-circle border border-secondary-subtle"
              style={{ width: '0.625rem', height: '0.625rem', backgroundColor: '#0f172a' }}
            />
            <div
              className="rounded-circle border"
              style={{ width: '0.625rem', height: '0.625rem', backgroundColor: 'rgba(6, 78, 59, 0.85)', borderColor: '#14532d' }}
            />
          </div>
        ) : (
          <div className="device-cutout device-cutout--notch d-flex align-items-center justify-content-center">
            <div
              className="rounded-pill"
              style={{ width: '3rem', height: '0.25rem', backgroundColor: '#1e293b' }}
            />
          </div>
        )}

        <div className="device-statusbar d-flex align-items-start justify-content-between">
          <span className="small fw-semibold">{timeStr || '9:41'}</span>
          <div className="d-flex align-items-center gap-1 opacity-75">
            <Radio size={12} />
            <Wifi size={14} />
            <Battery size={16} />
          </div>
        </div>

        <div className="device-content">
          {children}
        </div>

        <div className="device-home-indicator" />
      </div>
    </div>
  );
};
