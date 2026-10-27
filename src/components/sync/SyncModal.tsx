import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Eye, EyeOff, CloudUpload, CloudDownload, RefreshCw, Key, Shield, User, AlertTriangle } from 'lucide-react';
import { useI18n } from '../../i18n';
import {
  LoongIdentity,
  LoongSyncClient,
  getOrCreateLocalProfile,
  updateLocalProfile,
  bumpLocalVersion,
  recordSyncSuccess,
  mergePlayerStats
} from '../../lib/loongclan';
import type { PlayerStats } from '../../types/game';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onStatsUpdated: (newStats: PlayerStats) => void;
}

const syncClient = new LoongSyncClient();

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  stats,
  onStatsUpdated,
}) => {
  const { t, locale, formatErrorCode } = useI18n();
  const [activeTab, setActiveTab] = useState<'identity' | 'sync'>('identity');

  // 用户身份状态
  const [profile, setProfile] = useState(() => getOrCreateLocalProfile());
  const [showKouling, setShowKouling] = useState(false);
  const [copiedKouling, setCopiedKouling] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // 昵称编辑
  const [nicknameInput, setNicknameInput] = useState(profile.nickname);
  const [savedNickname, setSavedNickname] = useState(false);

  // 切换已有口令状态 (三独立输入框 + 密码遮罩 + 智能跳格/退格/粘贴)
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [part1, setPart1] = useState('');
  const [part2, setPart2] = useState('');
  const [part3, setPart3] = useState('');
  const [showInputKouling, setShowInputKouling] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const box1Ref = useRef<HTMLInputElement>(null);
  const box2Ref = useRef<HTMLInputElement>(null);
  const box3Ref = useRef<HTMLInputElement>(null);

  // 同步执行状态
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // 冲突状态
  const [conflictData, setConflictData] = useState<{
    serverVersion: number;
    serverSnapshotAt?: string;
  } | null>(null);

  // 重新打开时刷新当前 profile
  useEffect(() => {
    if (isOpen) {
      Promise.resolve().then(() => {
        const p = getOrCreateLocalProfile();
        setProfile(p);
        setNicknameInput(p.nickname);
        setSyncMessage(null);
        setConflictData(null);
        setShowSwitchDialog(false);
        setPart1('');
        setPart2('');
        setPart3('');
        setShowInputKouling(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setSyncMessage({ text, type });
    setTimeout(() => {
      setSyncMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const handleCopyKouling = () => {
    navigator.clipboard.writeText(profile.kouling);
    setCopiedKouling(true);
    showToast(t('sync.copied_toast'), 'success');
    setTimeout(() => setCopiedKouling(false), 2000);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(profile.userHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleSaveNickname = () => {
    try {
      const updated = updateLocalProfile(profile.kouling, nicknameInput);
      setProfile(updated);
      setSavedNickname(true);
      setTimeout(() => setSavedNickname(false), 2000);
      showToast(t('btn.save') + ' ' + t('btn.copied'), 'success');
    } catch {
      showToast(t('err.bad_request'), 'error');
    }
  };

  const handleGenerateNewKouling = () => {
    if (!window.confirm(t('sync.generate_confirm'))) {
      return;
    }
    const newKouling = LoongIdentity.generateRandom('lg');
    const updated = updateLocalProfile(newKouling, profile.nickname);
    setProfile(updated);
    showToast(t('sync.modal_title'), 'success');
  };

  const handlePart1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes('.') || val.includes('。') || val.includes('·')) {
      const cleaned = LoongIdentity.cleanInput(val);
      const [first, ...rest] = cleaned.split('.');
      setPart1([...(first || '')].slice(0, 8).join(''));
      if (rest.length > 0) {
        setPart2([...rest.join('.')].slice(0, 8).join(''));
      }
      box2Ref.current?.focus();
      return;
    }
    setPart1(val);
    if ([...val].length >= 8) {
      box2Ref.current?.focus();
    }
  };

  const handlePart2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes('.') || val.includes('。') || val.includes('·')) {
      const cleaned = LoongIdentity.cleanInput(val);
      const [second, ...rest] = cleaned.split('.');
      setPart2([...(second || '')].slice(0, 8).join(''));
      if (rest.length > 0) {
        setPart3([...rest.join('.')].slice(0, 8).join(''));
      }
      box3Ref.current?.focus();
      return;
    }
    setPart2(val);
    if ([...val].length >= 8) {
      box3Ref.current?.focus();
    }
  };

  const handlePart3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[.·。]/g, '');
    setPart3(val);
  };

  const handlePart2KeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !part2) {
      box1Ref.current?.focus();
    }
  };

  const handlePart3KeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !part3) {
      box2Ref.current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const cleaned = LoongIdentity.cleanInput(text);
    if (cleaned.includes('.')) {
      e.preventDefault();
      const parts = cleaned.split('.');
      if (parts.length >= 2) {
        const p1 = [...(parts[0] || '').trim()].slice(0, 8).join('');
        const p2 = [...(parts[1] || '').trim()].slice(0, 8).join('');
        const p3 = [...(parts[2] || '').trim()].slice(0, 8).join('');
        setPart1(p1);
        setPart2(p2);
        setPart3(p3);
        if (p3) {
          box3Ref.current?.focus();
        } else if (p2) {
          box3Ref.current?.focus();
        } else {
          box2Ref.current?.focus();
        }
      }
    }
  };

  const handleSwitchKouling = async () => {
    const p1 = part1.trim();
    const p2 = part2.trim();
    const p3 = part3.trim();
    if (!LoongIdentity.isValidParts(p1, p2, p3)) {
      setSwitchError(t('err.kouling_format'));
      return;
    }
    const combined = `${p1}.${p2}.${p3}`;
    setSwitchError(null);
    try {
      const updated = updateLocalProfile(combined, profile.nickname);
      setProfile(updated);
      setShowSwitchDialog(false);
      setPart1('');
      setPart2('');
      setPart3('');
      setShowInputKouling(false);
      showToast(t('sync.switch_title') + ' ' + t('btn.copied'), 'success');

      // 切换后自动尝试从云端拉取该口令的存档
      handleDownload(updated.userHash, updated.syncToken);
    } catch (err: any) {
      setSwitchError(err.message || t('err.bad_request'));
    }
  };

  // 上传快照 (零明文传输铁律：仅传输 userHash 与 syncToken)
  const handleUpload = async (force = false) => {
    setSyncing(true);
    setConflictData(null);
    try {
      const targetVersion = force ? profile.localVersion + 1 : bumpLocalVersion();
      const res = await syncClient.uploadSnapshot({
        appId: 'words',
        userHash: profile.userHash,
        syncToken: profile.syncToken,
        nickname: profile.nickname,
        clientVersion: '1.1.0',
        localVersion: targetVersion,
        force,
        payload: {
          stats,
          preferences: {
            language: locale,
            sound: true
          }
        }
      });

      if (res.code === 0 && res.data) {
        recordSyncSuccess(res.data.serverVersion);
        setProfile(getOrCreateLocalProfile());
        showToast(t('sync.upload_success', { version: res.data.serverVersion }), 'success');
      } else if (res.code === 409) {
        // 版本冲突
        setConflictData({
          serverVersion: res.data?.serverVersion || profile.localVersion + 1,
          serverSnapshotAt: res.data?.savedAt
        });
        showToast(formatErrorCode('version_conflict'), 'error');
      } else {
        showToast(formatErrorCode(res.err_code, res.message), 'error');
      }
    } catch {
      showToast(t('err.network'), 'error');
    } finally {
      setSyncing(false);
    }
  };

  // 下载并合并快照
  const handleDownload = async (customHash?: string, customToken?: string) => {
    setSyncing(true);
    setConflictData(null);
    const useHash = customHash || profile.userHash;
    const useToken = customToken || profile.syncToken;

    try {
      const res = await syncClient.downloadSnapshot({
        appId: 'words',
        userHash: useHash,
        syncToken: useToken
      });

      if (res.code === 0 && res.data) {
        const remoteData = res.data;
        const remoteStats = remoteData.payload?.stats || {};
        const merged = mergePlayerStats(stats, remoteStats);

        onStatsUpdated(merged);
        recordSyncSuccess(remoteData.serverVersion, remoteData.snapshotAt);
        setProfile(getOrCreateLocalProfile());

        showToast(t('sync.download_success'), 'success');
      } else {
        showToast(formatErrorCode(res.err_code, res.message), 'error');
      }
    } catch {
      showToast(t('err.network'), 'error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto paper-texture rounded-lg border-2 border-[#8C8377]/40 p-6 text-[#1C1A17] shadow-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B655D] hover:text-[#1A1917] hover:bg-black/5 transition"
        >
          <X size={20} />
        </button>

        {/* 顶部标题 */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#8C6036] font-semibold tracking-widest uppercase font-serif">
            <Shield size={14} className="text-[#B93A32]" />
            <span>LOONGCLAN · SPEC_SYNC</span>
          </div>
          <h2 className="text-2xl font-bold tracking-wider mt-1 text-[#1C1A17] font-serif">
            {t('sync.modal_title')}
          </h2>
          <p className="text-xs text-[#7A7165] mt-1">
            {t('sync.desc')}
          </p>
        </div>

        {/* Tab 导航 */}
        <div className="flex border-b border-[#D8CFBF] mb-5">
          <button
            onClick={() => setActiveTab('identity')}
            className={`flex-1 pb-2.5 text-xs md:text-sm font-semibold tracking-wider transition border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'identity'
                ? 'border-[#B93A32] text-[#B93A32]'
                : 'border-transparent text-[#6B655D] hover:text-[#1A1917]'
            }`}
          >
            <Key size={15} />
            <span>{t('sync.tab_identity')}</span>
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex-1 pb-2.5 text-xs md:text-sm font-semibold tracking-wider transition border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-[#2E4B6E] text-[#2E4B6E]'
                : 'border-transparent text-[#6B655D] hover:text-[#1A1917]'
            }`}
          >
            <CloudUpload size={15} />
            <span>{t('sync.tab_sync')}</span>
          </button>
        </div>

        {/* 提示消息 */}
        {syncMessage && (
          <div
            className={`mb-4 p-3 rounded text-xs font-medium border flex items-center gap-2 ${
              syncMessage.type === 'success'
                ? 'bg-[#EBF5EE] text-[#2E6F40] border-[#BCE1C7]'
                : syncMessage.type === 'error'
                ? 'bg-[#FDF2F2] text-[#B93A32] border-[#F4C7C7]'
                : 'bg-[#F0F4F8] text-[#2E4B6E] border-[#C8D7E6]'
            }`}
          >
            <span>{syncMessage.text}</span>
          </div>
        )}

        {/* TAB 1: 口令身份 */}
        {activeTab === 'identity' && (
          <div className="space-y-4 text-xs md:text-sm">
            {/* 三维口令卡片 */}
            <div className="p-4 bg-[#FAF5EC] rounded-lg border border-[#DACDB6]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[#4A433A] flex items-center gap-1.5">
                  <Key size={14} className="text-[#B93A32]" />
                  <span>{t('sync.kouling_label')}</span>
                </span>
                <button
                  onClick={() => setShowKouling(!showKouling)}
                  className="text-xs text-[#7A7165] hover:text-[#1A1917] flex items-center gap-1"
                >
                  {showKouling ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showKouling ? 'Hide' : 'Show'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between bg-white px-3 py-2 rounded border border-[#CFC3A5] font-mono text-sm tracking-wider text-[#1C1A17] font-semibold">
                <span>{showKouling ? profile.kouling : LoongIdentity.mask(profile.kouling)}</span>
                <button
                  onClick={handleCopyKouling}
                  className="p-1 text-[#6E675D] hover:text-[#B93A32] transition"
                  title={t('btn.copy')}
                >
                  {copiedKouling ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-[#8C8377] mt-1.5 leading-tight">
                {t('sync.kouling_tip')}
              </p>
            </div>

            {/* UserHash 卡片 */}
            <div className="p-3 bg-[#F4EFE3]/80 rounded border border-[#DACDB6]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-[#5A5247] text-xs">
                  {t('sync.user_hash_label')}
                </span>
                <button
                  onClick={handleCopyHash}
                  className="text-[11px] text-[#7A7165] hover:text-[#B93A32] flex items-center gap-1"
                >
                  {copiedHash ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  <span>{copiedHash ? t('btn.copied') : t('btn.copy')}</span>
                </button>
              </div>
              <div className="text-[11px] font-mono break-all text-[#6E675D] bg-white/70 p-2 rounded border border-[#E3D8C2]">
                {profile.userHash}
              </div>
            </div>

            {/* 昵称设置 */}
            <div className="p-3 bg-[#FAF5EC] rounded border border-[#DACDB6]">
              <label className="block font-semibold text-[#4A433A] mb-1.5 flex items-center gap-1.5">
                <User size={14} className="text-[#8C6036]" />
                <span>{t('sync.nickname_label')}</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nicknameInput}
                  maxLength={30}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-[#CFC3A5] rounded text-sm text-[#1C1A17] focus:outline-none focus:border-[#B93A32]"
                />
                <button
                  onClick={handleSaveNickname}
                  className="px-4 py-1.5 bg-[#B93A32] text-white rounded text-xs font-semibold hover:bg-[#9C2E27] transition"
                >
                  {savedNickname ? t('btn.copied') : t('btn.save')}
                </button>
              </div>
            </div>

            {/* 口令操作按钮区 */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowSwitchDialog(!showSwitchDialog)}
                className="flex-1 py-2 px-3 bg-[#ECE4D0] hover:bg-[#DFD3BA] border border-[#C5B898] text-[#453F37] font-semibold rounded text-xs transition"
              >
                {t('sync.btn_switch')}
              </button>
              <button
                onClick={handleGenerateNewKouling}
                className="py-2 px-3 bg-transparent hover:bg-black/5 text-[#8C6036] font-medium rounded text-xs transition"
              >
                {t('sync.btn_generate')}
              </button>
            </div>

            {/* 导入已有口令弹层 */}
            {showSwitchDialog && (
              <div className="p-4 bg-[#F2ECE0] rounded-lg border border-[#CFC3A5] mt-3 animate-fadeIn space-y-2">
                <h4 className="font-bold text-xs text-[#2A2621]">
                  {t('sync.switch_title')}
                </h4>
                <p className="text-[11px] text-[#7A7165]">
                  {t('sync.switch_desc')}
                </p>
                <div className="flex items-center justify-center gap-1.5 py-1">
                  <input
                    ref={box1Ref}
                    type={showInputKouling ? 'text' : 'password'}
                    placeholder="lg"
                    maxLength={8}
                    value={part1}
                    onChange={handlePart1Change}
                    onPaste={handlePaste}
                    className="w-20 px-2 py-1.5 bg-white border border-[#CFC3A5] rounded text-xs font-mono text-center text-[#1C1A17] focus:outline-none focus:border-[#2E4B6E]"
                  />
                  <span className="font-bold text-[#7A7165]">.</span>
                  <input
                    ref={box2Ref}
                    type={showInputKouling ? 'text' : 'password'}
                    placeholder="888"
                    maxLength={8}
                    value={part2}
                    onChange={handlePart2Change}
                    onKeyDown={handlePart2KeyDown}
                    onPaste={handlePaste}
                    className="w-20 px-2 py-1.5 bg-white border border-[#CFC3A5] rounded text-xs font-mono text-center text-[#1C1A17] focus:outline-none focus:border-[#2E4B6E]"
                  />
                  <span className="font-bold text-[#7A7165]">.</span>
                  <input
                    ref={box3Ref}
                    type={showInputKouling ? 'text' : 'password'}
                    placeholder="abc"
                    maxLength={8}
                    value={part3}
                    onChange={handlePart3Change}
                    onKeyDown={handlePart3KeyDown}
                    onPaste={handlePaste}
                    className="w-20 px-2 py-1.5 bg-white border border-[#CFC3A5] rounded text-xs font-mono text-center text-[#1C1A17] focus:outline-none focus:border-[#2E4B6E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowInputKouling(!showInputKouling)}
                    className="ml-1 p-1 text-[#7A7165] hover:text-[#1A1917] transition border border-[#CFC3A5] rounded bg-white/60"
                    title={showInputKouling ? 'Hide' : 'Show'}
                  >
                    {showInputKouling ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {switchError && (
                  <p className="text-xs text-[#B93A32]">{switchError}</p>
                )}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowSwitchDialog(false)}
                    className="px-3 py-1 text-xs text-[#6B655D]"
                  >
                    {t('btn.cancel')}
                  </button>
                  <button
                    onClick={handleSwitchKouling}
                    className="px-4 py-1 bg-[#2E4B6E] text-white rounded text-xs font-semibold hover:bg-[#203752]"
                  >
                    {t('btn.confirm')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: 云端同步 */}
        {activeTab === 'sync' && (
          <div className="space-y-4 text-xs md:text-sm">
            {/* 同步状态元数据 */}
            <div className="p-4 bg-[#FAF5EC] rounded-lg border border-[#DACDB6] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#6B655D]">{t('sync.local_version', { version: profile.localVersion })}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ECE4D0] text-[#735A38]">
                  Obsidian Relay
                </span>
              </div>
              <div className="text-[#7A7165] text-xs">
                {profile.lastSyncAt
                  ? t('sync.last_sync', { time: new Date(profile.lastSyncAt).toLocaleString() })
                  : t('sync.never_synced')}
              </div>
            </div>

            {/* 版本冲突警告与处理 */}
            {conflictData && (
              <div className="p-4 bg-[#FFF6F5] rounded-lg border-2 border-[#ECA6A0] space-y-3">
                <div className="flex items-center gap-2 text-[#B93A32] font-bold">
                  <AlertTriangle size={18} />
                  <span>{t('sync.conflict_title')}</span>
                </div>
                <p className="text-xs text-[#6B322D]">
                  {t('sync.conflict_msg', {
                    serverVersion: conflictData.serverVersion,
                    serverTime: conflictData.serverSnapshotAt
                      ? new Date(conflictData.serverSnapshotAt).toLocaleString()
                      : 'Recently'
                  })}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={() => handleDownload()}
                    disabled={syncing}
                    className="flex-1 py-2 px-3 bg-[#2E4B6E] hover:bg-[#203752] text-white font-semibold rounded text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <CloudDownload size={14} />
                    <span>{t('sync.conflict_merge')}</span>
                  </button>
                  <button
                    onClick={() => handleUpload(true)}
                    disabled={syncing}
                    className="flex-1 py-2 px-3 bg-[#B93A32] hover:bg-[#9C2E27] text-white font-semibold rounded text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <CloudUpload size={14} />
                    <span>{t('sync.conflict_force')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 同步按钮区 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleUpload(false)}
                disabled={syncing}
                className="py-3 px-4 bg-[#B93A32] hover:bg-[#9C2E27] disabled:opacity-50 text-white font-bold rounded-lg text-xs md:text-sm tracking-wider shadow-xs transition flex items-center justify-center gap-2"
              >
                {syncing ? <RefreshCw size={16} className="animate-spin" /> : <CloudUpload size={16} />}
                <span>{t('sync.btn_upload')}</span>
              </button>

              <button
                onClick={() => handleDownload()}
                disabled={syncing}
                className="py-3 px-4 bg-[#2E4B6E] hover:bg-[#203752] disabled:opacity-50 text-white font-bold rounded-lg text-xs md:text-sm tracking-wider shadow-xs transition flex items-center justify-center gap-2"
              >
                {syncing ? <RefreshCw size={16} className="animate-spin" /> : <CloudDownload size={16} />}
                <span>{t('sync.btn_download')}</span>
              </button>
            </div>

            {/* 提示说明 */}
            <div className="p-3 bg-[#F4EFE3]/80 rounded border border-[#DACDB6] text-[11px] text-[#7A7165] space-y-1">
              <p>• <strong>本地优先 (Local-First)</strong>：游戏记录优先储存在浏览器本地，即使离线也可畅玩。</p>
              <p>• <strong>多端合并 (CRDT)</strong>：下载同步将合并两端通关关卡与成就最高峰值，绝不会丢失已有进度。</p>
              <p>• <strong>API 端点</strong>：统一受控于 <span className="font-mono">https://api.loongclan.xyz</span>。</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
