import starCurrency from './assets/star_currency.svg';
import { useState, useRef } from 'react';

export default function CardDesigner({ 
  card, 
  onClose, 
  onSave, 
  onBuySticker,
  systemStickers = [], 
  systemVideos = [] 
}) {
  const [activeTab, setActiveTab] = useState('backgrounds');
  const [design, setDesign] = useState(card.design || { type: 'color', value: card.background });
  const [stickers, setStickers] = useState(card.stickers || []);
  const [activeStickerId, setActiveStickerId] = useState(null);
  const [errorFeedback, setErrorFeedback] = useState(null);

  const cardRef = useRef(null);
  const dragStartRef = useRef({ type: null, stickerId: null, startX: 0, startY: 0, initialX: 0, initialY: 0, initialScale: 1, initialRotation: 0 });

  const handleSelectDesign = (type, value) => {
    setDesign({ type, value });
  };

  const handleAddSticker = (stickerObj) => {
    const isLocked = stickerObj.price > 0 && !(card.unlockedStickers || []).includes(stickerObj.src);

    if (isLocked) {
      // Trigger Purchase flow
      if (card.balance < stickerObj.price) {
        setErrorFeedback("Недостаточно звезд! ⭐");
        setTimeout(() => setErrorFeedback(null), 1500);
        return;
      }

      const confirmBuy = window.confirm(`Купить этот стикер за ${stickerObj.price} звезд?`);
      if (confirmBuy) {
        onBuySticker(stickerObj.price, stickerObj.src);
        // MUTATION LINES REMOVED: React handles state cascading down safely now!
      } else {
        return;
      }
    }

    const newStkr = {
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      src: stickerObj.src,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      isCustom: stickerObj.isCustom || false
    };
    setStickers(prev => [...prev, newStkr]);
    setActiveStickerId(newStkr.id);
  };

  const handleTouchStart = (e, stickerId, type) => {
    e.stopPropagation();
    setActiveStickerId(stickerId);

    const stkr = stickers.find(s => s.id === stickerId);
    if (!stkr) return;

    const touch = e.touches[0];
    dragStartRef.current = {
      type,
      stickerId,
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: stkr.x || 0,
      initialY: stkr.y || 0,
      initialScale: stkr.scale || 1,
      initialRotation: stkr.rotation || 0
    };
  };

  const handleTouchMove = (e) => {
    const drag = dragStartRef.current;
    if (!drag.stickerId) return;
    e.preventDefault();

    const touch = e.touches[0];
    setStickers(prev => prev.map(stkr => {
      if (stkr.id !== drag.stickerId) return stkr;

      if (drag.type === 'move') {
        const dx = touch.clientX - drag.startX;
        const dy = touch.clientY - drag.startY;
        return { ...stkr, x: drag.initialX + dx, y: drag.initialY + dy };
      } else if (drag.type === 'control') {
        const dx = touch.clientX - drag.startX;
        const dy = touch.clientY - drag.startY;
        const distance = Math.hypot(dx, dy);
        const scaleChange = distance / 50;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        return {
          ...stkr,
          scale: Math.max(0.4, Math.min(drag.initialScale + (touch.clientX > drag.startX ? scaleChange : -scaleChange), 3.0)),
          rotation: drag.initialRotation + angle
        };
      }
      return stkr;
    }));
  };

  const handleTouchEnd = () => {
    dragStartRef.current = { type: null, stickerId: null };
  };

  const handleDeleteSticker = (e, stickerId) => {
    e.stopPropagation();
    setStickers(prev => prev.filter(s => s.id !== stickerId));
    if (activeStickerId === stickerId) setActiveStickerId(null);
  };

  const processCameraFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;
        ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);
        handleAddSticker({ src: canvas.toDataURL('image/jpeg', 0.8), price: 0, isCustom: true });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const isVideo = design.type === 'video';

  return (
    <div className="designer-sandbox" onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      
      {/* 1. Preview Card Container */}
      <div className="designer-card-container">
        {errorFeedback && <div className="designer-error-toast">{errorFeedback}</div>}
        <div 
          ref={cardRef} 
          className="bank-card designer-restricted-card"
          style={!isVideo ? { background: design.value } : { background: '#000000' }}
          onClick={() => setActiveStickerId(null)}
        >
          {isVideo && <video className="card-video-bg" src={design.value} autoPlay loop muted playsInline />}

          <div className="card-content-layer">
            <div className="card-name">{card.name}</div>
            <div className="card-balance-container">
              <span className="card-balance">{card.balance}</span>
              <img src={starCurrency} alt="Stars" className="star-currency-icon" />
            </div>
          </div>

          <div className="stickers-layer-restricted">
            {stickers.map(stkr => {
              const isActive = activeStickerId === stkr.id;
              return (
                <div 
                  key={stkr.id}
                  className={`designer-sticker ${isActive ? 'active' : ''} ${stkr.isCustom ? 'custom-camera' : ''}`}
                  style={{
                    width: 70, height: 70,
                    transform: `translate(${stkr.x}px, ${stkr.y}px) rotate(${stkr.rotation}deg) scale(${stkr.scale})`,
                    zIndex: stkr.zIndex || 10
                  }}
                  onTouchStart={(e) => handleTouchStart(e, stkr.id, 'move')}
                >
                  <img src={stkr.src} alt="sticker" draggable="false" />
                  {isActive && (
                    <>
                      <div className="stkr-del-handle" onTouchStart={(e) => handleDeleteSticker(e, stkr.id)}>✕</div>
                      <div className="stkr-ctrl-handle" onTouchStart={(e) => handleTouchStart(e, stkr.id, 'control')}>🔄</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Control Menu Drawer */}
      <div className="designer-control-drawer">
        <div className="customize-tabs">
          <button className={`cust-tab-btn ${activeTab === 'backgrounds' ? 'active' : ''}`} onClick={() => setActiveTab('backgrounds')}>Фоны</button>
          <button className={`cust-tab-btn ${activeTab === 'stickers' ? 'active' : ''}`} onClick={() => setActiveTab('stickers')}>Стикеры</button>
        </div>

        <div className="designer-drawer-body">
          {activeTab === 'backgrounds' ? (
            <div className="design-options">
              <h4>Цвета</h4>
              <div className="design-grid">
                <button onClick={() => handleSelectDesign('color', '#8C00FF')} style={{ background: '#8C00FF' }}></button>
                <button onClick={() => handleSelectDesign('color', '#00C2FF')} style={{ background: '#00C2FF' }}></button>
                <button onClick={() => handleSelectDesign('color', '#FF5C00')} style={{ background: '#FF5C00' }}></button>
                <div className="color-picker-wrap">
                  <span>+</span>
                  <input type="color" value={design.type === 'color' ? design.value : '#8C00FF'} onChange={(e) => handleSelectDesign('color', e.target.value)} />
                </div>
              </div>

              <h4>Градиенты</h4>
              <div className="design-grid">
                <button onClick={() => handleSelectDesign('gradient', 'linear-gradient(135deg, #5D5753 0%, #EED5A0 100%)')} style={{ background: 'linear-gradient(135deg, #5D5753 0%, #EED5A0 100%)' }}></button>
                <button onClick={() => handleSelectDesign('gradient', 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)')} style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' }}></button>
                <button onClick={() => handleSelectDesign('gradient', 'linear-gradient(135deg, #2E0854 0%, #000000 100%)')} style={{ background: 'linear-gradient(135deg, #2E0854 0%, #000000 100%)' }}></button>
              </div>

              <h4>Живые Обои</h4>
              <div className="design-grid">
                {systemVideos.map((vid, idx) => (
                  <button key={idx} onClick={() => handleSelectDesign('video', vid)}>
                    <video src={vid} autoPlay loop muted playsInline />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="stickers-grid">
              <label className="sticker-item-btn camera-sticker-btn">
                <span>📷</span>
                <span style={{ fontSize: '11px', marginTop: '2px' }}>Фото</span>
                <input type="file" accept="image/*" capture="environment" onChange={(e) => processCameraFile(e.target.files[0])} />
              </label>
              {systemStickers.map((item, idx) => {
                const isPriceObject = typeof item === 'object';
                const src = isPriceObject ? item.src : item;
                const price = isPriceObject ? item.price : 0;
                const isLocked = price > 0 && !(card.unlockedStickers || []).includes(src);

                return (
                  <button 
                    key={idx} 
                    className="sticker-item-btn" 
                    onClick={() => handleAddSticker({ src, price })}
                    style={{ position: 'relative' }}
                  >
                    <img src={src} alt="stkr" style={{ opacity: isLocked ? 0.4 : 1 }} />
                    {isLocked && (
                      <div className="sticker-lock-badge">
                        {price}⭐
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="designer-footer-actions">
          <button className="confirm-transfer-btn" onClick={() => onSave({ design, stickers })}>Сохранить</button>
          <button className="menu-action-btn" style={{ background: '#CCD3D9', color: '#202020' }} onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}