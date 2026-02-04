
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Exhibition, Narrative } from './types';
import { INITIAL_EXHIBITION, DEFAULT_NARRATIVES } from './constants';
import { SpatialAudioPlayer } from './components/SpatialAudioPlayer';
import { MediaOverlay } from './components/MediaOverlay';
import { generateExhibitionIntro } from './services/geminiService';

type LayoutType = 'circle' | 'square' | 'rectangle' | 'linear';
type AppView = 'gallery' | 'landing' | 'exhibition';

const App: React.FC = () => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [activeExhibition, setActiveExhibition] = useState<Exhibition | null>(null);
  const [view, setView] = useState<AppView>('gallery');
  
  const [selectedItem, setSelectedItem] = useState<Narrative | null>(null);
  const [hoveredItem, setHoveredItem] = useState<Narrative | null>(null);
  const [userPos, setUserPos] = useState({ x: 50, y: 50 });
  const [isWalking, setIsWalking] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load exhibitions from storage
  useEffect(() => {
    const saved = localStorage.getItem('exhibition_platform_data');
    if (saved) {
      setExhibitions(JSON.parse(saved));
    } else {
      setExhibitions([INITIAL_EXHIBITION]);
    }
  }, []);

  // Save on change
  useEffect(() => {
    if (exhibitions.length > 0) {
      localStorage.setItem('exhibition_platform_data', JSON.stringify(exhibitions));
    }
  }, [exhibitions]);

  const updateActiveExhibition = (updates: Partial<Exhibition>) => {
    if (!activeExhibition) return;
    const updated = { ...activeExhibition, ...updates };
    setActiveExhibition(updated);
    setExhibitions(prev => prev.map(ex => ex.id === updated.id ? updated : ex));
  };

  const createNewExhibition = () => {
    const name = prompt("اسم القرية أو المعرض الجديد:");
    if (!name) return;
    const newEx: Exhibition = {
      id: `ex-${Date.now()}`,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      context: {
        name,
        location: "تونس",
        story: "بداية حكاية جديدة لجمع التراث الغذائي والروحي."
      },
      items: DEFAULT_NARRATIVES.map(item => ({ ...item, id: Math.random() })),
      createdAt: Date.now()
    };
    setExhibitions([newEx, ...exhibitions]);
    enterExhibition(newEx);
  };

  const enterExhibition = async (ex: Exhibition) => {
    setActiveExhibition(ex);
    setView('landing');
    if (!ex.aiIntro) {
      try {
        const intro = await generateExhibitionIntro();
        const updated = { ...ex, aiIntro: intro };
        setExhibitions(prev => prev.map(e => e.id === ex.id ? updated : e));
        setActiveExhibition(updated);
      } catch (e) { console.error(e); }
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || selectedItem || view !== 'exhibition') return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setUserPos({ x, y });
    setIsWalking(true);
    
    const nearby = activeExhibition?.items.find(item => {
      const dist = Math.sqrt(Math.pow(item.x - x, 2) + Math.pow(item.y - y, 2));
      return dist < 8;
    });
    setHoveredItem(nearby || null);
  }, [selectedItem, activeExhibition, view]);

  const applyLayout = (type: LayoutType) => {
    if (!activeExhibition) return;
    const newItems = [...activeExhibition.items];
    const count = newItems.length;

    newItems.forEach((item, i) => {
      switch (type) {
        case 'circle': {
          const angle = (i / count) * 2 * Math.PI;
          item.x = Math.cos(angle) * 35 + 50;
          item.y = Math.sin(angle) * 35 + 50;
          break;
        }
        case 'square': {
          const side = Math.ceil(Math.sqrt(count));
          const row = Math.floor(i / side);
          const col = i % side;
          item.x = (col / (side - 1 || 1)) * 70 + 15;
          item.y = (row / (side - 1 || 1)) * 70 + 15;
          break;
        }
        case 'rectangle': {
          const cols = Math.ceil(Math.sqrt(count * 1.5));
          const rows = Math.ceil(count / cols);
          const row = Math.floor(i / cols);
          const col = i % cols;
          item.x = (col / (cols - 1 || 1)) * 80 + 10;
          item.y = (row / (rows - 1 || 1)) * 60 + 20;
          break;
        }
        case 'linear': {
          item.x = (i / (count - 1 || 1)) * 80 + 10;
          item.y = 50;
          break;
        }
      }
    });
    updateActiveExhibition({ items: newItems });
  };

  // Rendering Views
  if (view === 'gallery') {
    return (
      <div className="min-h-screen bg-stone-950 p-8 md:p-16 flex flex-col items-center">
        <header className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-7xl font-amiri font-bold text-amber-500">منصة زيتونة</h1>
          <p className="text-stone-400 max-w-xl mx-auto text-lg">منصة منسق المعارض الرقمية لتوثيق حكايات الزيت والتراث التونسي.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
          {/* Create Card */}
          <button 
            onClick={createNewExhibition}
            className="group relative h-80 rounded-3xl border-2 border-dashed border-stone-800 hover:border-amber-500/50 flex flex-col items-center justify-center gap-4 transition-all hover:bg-stone-900/40"
          >
            <div className="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center group-hover:bg-amber-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-stone-300 font-bold text-xl">إنشاء معرض جديد</span>
          </button>

          {exhibitions.map((ex) => (
            <div 
              key={ex.id}
              onClick={() => enterExhibition(ex)}
              className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer bg-stone-900 border border-stone-800 hover:border-amber-500/30 transition-all hover:scale-[1.02] shadow-2xl"
            >
              <img src={ex.items[0]?.image} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-right">
                <h3 className="text-3xl font-amiri font-bold text-amber-500 mb-2">{ex.context.name}</h3>
                <p className="text-stone-300 text-sm mb-4 line-clamp-2">{ex.context.story}</p>
                <div className="flex justify-end gap-3 text-[10px] uppercase tracking-widest text-stone-500">
                  <span>{ex.items.length} صورة</span>
                  <span>•</span>
                  <span>{new Date(ex.createdAt).toLocaleDateString('ar-TN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'landing' && activeExhibition) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950 p-4">
        <div className="max-w-4xl w-full text-center space-y-8 animate-in zoom-in duration-700">
          <button 
            onClick={() => setView('gallery')}
            className="absolute top-10 right-10 text-stone-500 hover:text-amber-500 transition-colors flex items-center gap-2 font-bold"
          >
            <span>العودة للمنصة</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-amiri font-bold text-amber-500 tracking-tighter text-shadow-xl">{activeExhibition.context.name}</h1>
            <p className="text-3xl text-stone-300 font-amiri italic">"ما لا يرى في الزيت"</p>
          </div>
          
          <div className="bg-stone-900/50 p-10 rounded-3xl border border-stone-800 space-y-6 shadow-inner">
            <p className="text-2xl leading-relaxed text-stone-200 font-amiri">
              {activeExhibition.context.story}
            </p>
            {activeExhibition.aiIntro && (
              <div className="p-6 border-r-4 border-amber-600 bg-amber-900/10 italic text-stone-300 font-amiri text-lg">
                 {activeExhibition.aiIntro}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <button 
              onClick={() => { setIsAdmin(false); setView('exhibition'); }}
              className="px-16 py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-bold text-2xl transition-all hover:scale-105 shadow-xl shadow-amber-900/40"
            >
              دخول كزائر
            </button>
            <button 
              onClick={() => { setIsAdmin(true); setView('exhibition'); }}
              className="px-16 py-5 bg-stone-800 hover:bg-stone-700 text-amber-500 border border-amber-500/30 rounded-full font-bold text-2xl transition-all hover:scale-105 shadow-lg"
            >
              دخول كمنسق (تعديل)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-stone-950 text-stone-100 overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#292524_0%,_#0c0a09_100%)] opacity-40 pointer-events-none"></div>
      
      {/* Admin Control Panel */}
      {isAdmin && (
        <div className="fixed top-6 right-6 z-40 bg-stone-900/90 backdrop-blur-md p-4 rounded-2xl border border-amber-500/30 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-right-4 w-64">
           <button 
            onClick={() => setView('gallery')}
            className="text-stone-400 hover:text-white text-xs flex items-center justify-center gap-1 mb-2"
          >
            العودة للمنصة الرئيسية
          </button>

          <div className="space-y-2">
            <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest text-center">أدوات المعرض</p>
            <button 
              onClick={() => {
                const newId = Date.now();
                const newItem: Narrative = {
                  id: newId,
                  title: "عنوان جديد",
                  writer: "اسم الكاتب",
                  image: "https://picsum.photos/seed/new/800/1000",
                  audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                  description: "اكتب وصف السردية هنا...",
                  x: 50, y: 50
                };
                updateActiveExhibition({ items: [...(activeExhibition?.items || []), newItem] });
                setSelectedItem(newItem);
              }}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white py-2 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              إضافة سردية
            </button>
          </div>
          
          <div className="h-px bg-stone-800"></div>

          <div className="space-y-2">
            <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">تنسيق الفراغ</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => applyLayout('circle')} className="bg-stone-800 hover:bg-stone-700 p-2 rounded text-xs border border-stone-700 transition-colors">دائري</button>
              <button onClick={() => applyLayout('square')} className="bg-stone-800 hover:bg-stone-700 p-2 rounded text-xs border border-stone-700 transition-colors">مربع</button>
              <button onClick={() => applyLayout('rectangle')} className="bg-stone-800 hover:bg-stone-700 p-2 rounded text-xs border border-stone-700 transition-colors">مستطيل</button>
              <button onClick={() => applyLayout('linear')} className="bg-stone-800 hover:bg-stone-700 p-2 rounded text-xs border border-stone-700 transition-colors">خطي</button>
            </div>
          </div>
        </div>
      )}

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsWalking(false)}
        className="relative w-full h-full cursor-none overflow-hidden"
      >
        <div 
          className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full border border-amber-500/50 flex items-center justify-center bg-amber-500/10 transition-transform duration-75 ease-out z-20 pointer-events-none"
          style={{ left: `${userPos.x}%`, top: `${userPos.y}%` }}
        >
          <div className={`w-2 h-2 bg-amber-500 rounded-full transition-all duration-300 ${isWalking ? 'scale-150 shadow-[0_0_15px_#f59e0b]' : ''}`}></div>
        </div>

        {activeExhibition?.items.map((item) => {
          const isActive = hoveredItem?.id === item.id;
          const distance = Math.sqrt(Math.pow(item.x - userPos.x, 2) + Math.pow(item.y - userPos.y, 2));
          const opacity = Math.max(0.1, 1 - distance / 40);
          const scale = isActive ? 1.5 : (1 - Math.min(distance / 100, 0.5));

          return (
            <div 
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 ease-out group"
              style={{ 
                left: `${item.x}%`, 
                top: `${item.y}%`, 
                opacity: opacity,
                scale: scale,
                zIndex: isActive ? 10 : 1
              }}
            >
              <div className={`relative flex flex-col items-center gap-2`}>
                <div className={`w-24 h-32 md:w-32 md:h-40 rounded-lg overflow-hidden border-2 transition-all duration-500 shadow-xl ${isActive ? 'border-amber-500 shadow-amber-500/20' : 'border-stone-800'}`}>
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700" />
                </div>
                {isActive && (
                  <div className="absolute -bottom-16 w-max bg-stone-900 px-4 py-2 rounded-lg border border-stone-800 animate-in fade-in slide-in-from-top-2 shadow-2xl z-50">
                    <p className="text-amber-500 font-bold font-amiri text-lg">{item.title}</p>
                    <p className="text-stone-400 text-xs text-center">{item.writer}</p>
                  </div>
                )}
              </div>
              <SpatialAudioPlayer url={item.audioUrl} isActive={isActive} volume={Math.max(0, 1 - distance / 25)} />
            </div>
          );
        })}
      </div>

      {selectedItem && (
        <MediaOverlay 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          isAdmin={isAdmin}
          onUpdate={(updated) => {
            if (!activeExhibition) return;
            updateActiveExhibition({
              items: activeExhibition.items.map(i => i.id === updated.id ? updated : i)
            });
            setSelectedItem(updated);
          }}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-between items-end pointer-events-none z-30">
        <div className="bg-stone-900/80 backdrop-blur-md p-4 rounded-2xl border border-stone-800 pointer-events-auto shadow-2xl">
          <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-1">المعرض الحالي</p>
          <h3 className="text-xl font-bold">{activeExhibition?.context.name}</h3>
          <p className="text-stone-400 text-sm">{isAdmin ? 'وضع المنسق' : 'وضع الزائر'}</p>
        </div>

        <div className="flex gap-4 pointer-events-auto">
          <button 
            onClick={() => setView('landing')}
            className="w-14 h-14 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center text-stone-400 hover:text-amber-500 transition-colors shadow-lg"
            title="رجوع للمقدمة"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
