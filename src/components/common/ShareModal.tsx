import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, Sparkles } from 'lucide-react';
import { generateShareCard, type ShareCardData } from '../../utils/shareCard';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: ShareCardData | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, cardData }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    if (isOpen && cardData) {
      Promise.resolve().then(() => {
        if (!isCancelled) setLoading(true);
      });
      generateShareCard(cardData)
        .then((url) => {
          if (!isCancelled) {
            setImageUrl(url);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            console.error(err);
            setLoading(false);
          }
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [isOpen, cardData]);

  if (!isOpen || !cardData) return null;

  const handleCopyText = () => {
    const text = `🎋【${cardData.gameTitle}】\n` +
      `📅 日期：${cardData.formattedDate}\n` +
      `📖 诗词：“${cardData.highlightPoem}”\n` +
      `🏆 战绩：${cardData.resultSummary}\n` +
      `🔥 连击：${cardData.streak} 宿 · 功名：${cardData.rankTitle}\n` +
      `🏮 国风日课 · 东方文脉轻解谜`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `国风日课_${cardData.gameTitle}_${cardData.dateStr}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto paper-texture rounded-lg border-2 border-[#8C8377]/40 p-5 text-[#1C1A17] shadow-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B655D] hover:text-[#1A1917] hover:bg-black/5 transition"
        >
          <X size={20} />
        </button>

        {/* 标题 */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#B93A32] font-semibold tracking-widest mb-1">
            <Sparkles size={14} />
            <span>文心印契 · 雅赏打卡</span>
          </div>
          <h3 className="text-xl font-bold tracking-wider text-[#1C1A17]">生成水墨修习印谱</h3>
        </div>

        {/* 卡片预览 */}
        <div className="my-3 rounded-lg overflow-hidden border border-[#D5CCA8] shadow-inner bg-[#EDE5D6]/30 flex items-center justify-center min-h-[380px]">
          {loading ? (
            <div className="text-sm text-[#736B61] flex flex-col items-center gap-2">
              <span className="animate-spin text-2xl">🏮</span>
              <span>水墨晕染中...</span>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt="打卡图" className="w-full h-auto object-contain max-h-[50vh] shadow-md" />
          ) : (
            <span className="text-xs text-[#8C8377]">生成印谱失败</span>
          )}
        </div>

        {/* 按钮区域 */}
        <div className="flex gap-2.5 mt-5">
          <button
            onClick={handleCopyText}
            className="flex-1 py-2.5 px-3 bg-[#EAE2D2] hover:bg-[#DCD2BC] text-[#33302C] border border-[#BDB09B] rounded font-medium text-xs tracking-wider flex items-center justify-center gap-2 transition"
          >
            {copied ? <Check size={16} className="text-green-700" /> : <Copy size={16} />}
            {copied ? '已复制雅集文本' : '复制打卡文案'}
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={!imageUrl}
            className="flex-1 py-2.5 px-3 bg-[#B93A32] hover:bg-[#9E2E27] disabled:opacity-50 text-white rounded font-medium text-xs tracking-wider flex items-center justify-center gap-2 transition shadow"
          >
            <Download size={16} />
            保存水墨印谱
          </button>
        </div>
      </div>
    </div>
  );
};
