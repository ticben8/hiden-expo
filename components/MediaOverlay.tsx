
import React, { useState } from 'react';
import { Narrative } from '../types';

interface MediaOverlayProps {
  item: Narrative;
  onClose: () => void;
  isAdmin?: boolean;
  onUpdate?: (updated: Narrative) => void;
}

export const MediaOverlay: React.FC<MediaOverlayProps> = ({ item, onClose, isAdmin, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Narrative>(item);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editData);
      setIsEditing(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?item=${item.id}`;
    const shareData = {
      title: `زيتونة: ${item.title}`,
      text: `اكتشف سردية "${item.title}" في معرض زيتونة: ما لا يرى في الزيت.`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      } catch (err) {
        console.error("Error copying to clipboard:", err);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md transition-all duration-500 animate-in fade-in zoom-in">
      <div className="relative max-w-6xl w-full h-full md:h-auto flex flex-col md:flex-row bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800">
        
        {/* Navigation Buttons Group */}
        <div className="absolute top-6 left-6 z-20 flex gap-3">
          <button 
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors border border-white/20"
            title="إغلاق"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button 
            onClick={handleShare}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-amber-600 transition-all border border-white/20"
            title="مشاركة"
          >
            {shareStatus === 'copied' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
          </button>
        </div>

        {/* Curator Edit Toggle */}
        {isAdmin && (
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-6 left-36 z-20 px-4 h-12 flex items-center gap-2 rounded-full bg-amber-600 text-white hover:bg-amber-500 transition-colors shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            {isEditing ? 'إلغاء التعديل' : 'تعديل السردية'}
          </button>
        )}

        {/* Image Side */}
        <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden group">
          <img 
            src={isEditing ? editData.image : item.image} 
            alt={item.title} 
            className="w-full h-full object-cover transition-all duration-500"
          />
          {isEditing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 opacity-100 transition-opacity p-6">
              <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl border border-white/30 backdrop-blur-sm transition-all text-white font-bold w-full text-center">
                رفع صورة جديدة
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
              <div className="w-full flex items-center gap-2">
                <div className="h-px flex-1 bg-white/20"></div>
                <span className="text-white/40 text-xs uppercase tracking-widest">أو</span>
                <div className="h-px flex-1 bg-white/20"></div>
              </div>
              <div className="w-full">
                <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-1 mr-1">رابط الصورة المباشر</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/image.jpg"
                  value={editData.image.startsWith('data:') ? '' : editData.image}
                  onChange={e => setEditData(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:border-amber-500 outline-none transition-colors"
                />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-60 pointer-events-none"></div>
        </div>

        {/* Content Side */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-stone-900 overflow-y-auto">
          {isEditing ? (
            <div className="space-y-6 animate-in slide-in-from-left-4">
              <h2 className="text-2xl font-bold text-amber-500 mb-4">تعديل المحتوى النصي</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-500 mb-1 mr-1">عنوان السردية</label>
                  <input 
                    type="text" 
                    value={editData.title}
                    onChange={e => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black/40 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 focus:border-amber-500 outline-none transition-colors font-amiri text-2xl"
                  />
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-500 mb-1 mr-1">اسم الكاتب</label>
                  <input 
                    type="text" 
                    value={editData.writer}
                    onChange={e => setEditData(prev => ({ ...prev, writer: e.target.value }))}
                    className="w-full bg-black/40 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 focus:border-amber-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-500 mb-1 mr-1">النص السردي</label>
                  <textarea 
                    rows={6}
                    value={editData.description}
                    onChange={e => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-black/40 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 focus:border-amber-500 outline-none transition-colors font-amiri text-lg leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-500 mb-1 mr-1">رابط الصوت (MP3)</label>
                  <input 
                    type="text" 
                    value={editData.audioUrl}
                    onChange={e => setEditData(prev => ({ ...prev, audioUrl: e.target.value }))}
                    className="w-full bg-black/40 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 focus:border-amber-500 outline-none transition-colors text-xs font-mono"
                  />
                </div>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 mt-4"
              >
                حفظ التغييرات
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-amber-500 font-bold tracking-widest text-sm uppercase">سردية رقم {item.id}</span>
                <h2 className="text-4xl md:text-5xl font-amiri font-bold text-stone-100">{item.title}</h2>
                <p className="text-stone-400 text-lg">بقلم: <span className="text-stone-200">{item.writer}</span></p>
              </div>
              
              <div className="h-px w-24 bg-amber-500/50"></div>

              <p className="text-stone-300 leading-relaxed text-xl font-amiri whitespace-pre-wrap">
                {item.description}
              </p>

              <div className="flex items-center gap-4 mt-8 bg-black/30 p-4 rounded-xl border border-stone-800">
                <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <div>
                  <p className="text-stone-200 font-bold">يتم تشغيل القراءة الصوتية الآن</p>
                  <p className="text-stone-400 text-sm">استمع إلى ما وراء الصورة...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
