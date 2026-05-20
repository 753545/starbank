import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

// Import assets
import starPattern from './assets/star.png'
import starCurrency from './assets/star_currency.svg'
import iconStar from './assets/star.svg'
import iconPlus from './assets/plus.svg'
import iconShop from './assets/shop.svg'

function StarIcon({ className = "star-inline" }) {
  return (
    <svg className={className} viewBox="0 -1 77 66" fill="currentColor">
      <path d="M75.4068 24.0906H52.5686C51.9754 24.0906 51.5349 23.5405 51.6635 22.9594L56.4627 1.13539C56.6703 0.193805 55.4883 -0.403781 54.8578 0.323906L34.5208 23.772C34.345 23.9749 34.0891 24.0917 33.821 24.0917H8.43653C7.65112 24.0917 7.22162 25.0102 7.72362 25.6177L19.5234 39.8748C19.8134 40.2254 19.8079 40.737 19.5091 41.081L0.235364 63.302C-0.436899 64.0771 0.453959 65.2127 1.36239 64.7386L27.7476 50.9599C28.1343 50.7582 28.6099 50.8541 28.8889 51.1904L40.7666 65.5424C41.2599 66.1378 42.2188 65.904 42.3858 65.1488L47.7167 40.9079C47.776 40.6389 47.9506 40.4096 48.1945 40.2828L75.8352 25.8481C76.6964 25.3983 76.3779 24.0917 75.4068 24.0917V24.0906Z"/>
    </svg>
  );
}

let globalIdCounter = 10000;
const getNextId = () => { globalIdCounter += 1; return globalIdCounter; };

function Interactive3DCard({ background, name, balance, onClick }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    const rotateY = (x / (rect.width / 2)) * 15;
    const rotateX = -(y / (rect.height / 2)) * 15;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div 
      ref={cardRef}
      className="bank-card"
      style={{ background: background, transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      onMouseMove={handleMove} onMouseLeave={handleLeave} onTouchMove={handleMove} onTouchEnd={handleLeave} onClick={onClick}
    >
      <div className="card-name">{name}</div>
      <div className="card-balance-container">
        <span className="card-balance">{balance}</span>
        <img src={starCurrency} alt="Stars" className="star-currency-icon" />
      </div>
    </div>
  );
}

const defaultCardsData = [
  { id: 1, name: 'LIYA', balance: 1000, background: '#8C00FF', pin: '1111', history: [{ id: 101, title: 'помощь', value: 250, type: 'positive' }, { id: 102, title: 'кукла', value: -1200, type: 'negative' }] },
  { id: 2, name: 'ZLATA', balance: 1000, background: 'linear-gradient(135deg, #5D5753 0%, #EED5A0 100%)', pin: '2222', history: [{ id: 201, title: 'помощь', value: 250, type: 'positive' }] }
];
const defaultAchievementsList = [
  { id: 'ach_1', title: 'помощь', reward: 200, visibleTo: 'all' },
  { id: 'ach_2', title: 'съесть завтрак', reward: 200, visibleTo: 'all' },
  { id: 'ach_3', title: 'прочитать книгу', reward: 200, visibleTo: 'all' },
  { id: 'ach_4', title: 'убрать игрушки', reward: 150, visibleTo: 'LIYA' },
  { id: 'ach_5', title: 'помыть посуду', reward: 150, visibleTo: 'ZLATA' }
];
const imgRainbowHigh = 'https://i.imgur.com/XqT7hCj.png';
const imgDraculaura = 'https://i.imgur.com/vH1N7wS.png';
const defaultShopList = [
  { id: 'shop_1', title: 'Rainbow High', price: 5000, type: 'image', img: imgRainbowHigh, visibleTo: 'all' },
  { id: 'shop_2', title: 'компьютер', price: 20, type: 'text', visibleTo: 'all' },
  { id: 'shop_3', title: 'Draculaura', price: 5000, type: 'image', img: imgDraculaura, visibleTo: 'all' }
];

const getSafeStorageArray = (key, defaultList) => {
  try {
    const local = localStorage.getItem(key);
    if (!local || local === 'undefined') return defaultList;
    const parsed = JSON.parse(local);
    return Array.isArray(parsed) ? parsed : defaultList;
  } catch (error) { return defaultList; }
};

export default function App() {
  const [isAdminMode] = useState(() => window.location.search.includes('admin=true'));

  const [cards, setCards] = useState(() => getSafeStorageArray('starbank_cards', defaultCardsData));
  const [pendingRequests, setPendingRequests] = useState(() => getSafeStorageArray('starbank_pending', []));
  const [achievements, setAchievements] = useState(() => getSafeStorageArray('starbank_achievements', defaultAchievementsList));
  const [shopItems, setShopItems] = useState(() => getSafeStorageArray('starbank_shop', defaultShopList));

  useEffect(() => { localStorage.setItem('starbank_cards', JSON.stringify(cards)); }, [cards]);
  useEffect(() => { localStorage.setItem('starbank_pending', JSON.stringify(pendingRequests)); }, [pendingRequests]);
  useEffect(() => { localStorage.setItem('starbank_achievements', JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => { localStorage.setItem('starbank_shop', JSON.stringify(shopItems)); }, [shopItems]);

  useEffect(() => {
    const handleStorageUpdate = (e) => {
      if (e.key === 'starbank_cards' && e.newValue) setCards(JSON.parse(e.newValue));
      if (e.key === 'starbank_pending' && e.newValue) setPendingRequests(JSON.parse(e.newValue));
      if (e.key === 'starbank_achievements' && e.newValue) setAchievements(JSON.parse(e.newValue));
      if (e.key === 'starbank_shop' && e.newValue) setShopItems(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  // --- MOBILE ROUTING STATE ---
  const [loggedInCard, setLoggedInCard] = useState(null); 
  const [activeRoute, setActiveRoute] = useState('main');
  const routes = loggedInCard ? ['main', 'card', 'earn', 'shop'] : ['main', 'earn', 'shop'];
  const activeIndex = routes.indexOf(activeRoute) === -1 ? 0 : routes.indexOf(activeRoute);

  const [swipeDeltaX, setSwipeDeltaX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalMove = useRef(null);

  const navigateRoute = (route) => {
    setActiveRoute(route);
    if (route === 'main' && loggedInCard) {
      setTimeout(() => setLoggedInCard(null), 350); 
    }
  };

  const handleTrackTouchStart = (e) => {
    if (e.target.closest('.text-disc')) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalMove.current = null; setIsSwiping(true); setSwipeDeltaX(0);
  };
  const handleTrackTouchMove = (e) => {
    if (!isSwiping || e.target.closest('.text-disc')) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;
    if (isHorizontalMove.current === null) isHorizontalMove.current = Math.abs(diffX) > Math.abs(diffY);
    if (isHorizontalMove.current) setSwipeDeltaX(diffX);
  };
  const handleTrackTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    if (isHorizontalMove.current) {
      const threshold = 80;
      let nextIndex = activeIndex;
      if (swipeDeltaX < -threshold) nextIndex = Math.min(activeIndex + 1, routes.length - 1);
      else if (swipeDeltaX > threshold) nextIndex = Math.max(activeIndex - 1, 0);
      navigateRoute(routes[nextIndex]);
    }
    setSwipeDeltaX(0); isHorizontalMove.current = null;
  };

  // --- MOBILE OVERLAYS ---
  const [selectedCard, setSelectedCard] = useState(null); 
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [completedTaskFeedback, setCompletedTaskFeedback] = useState(null);
  const [deniedTaskFeedback, setDeniedTaskFeedback] = useState(null);
  const [discRotation, setDiscRotation] = useState({}); 
  const activeRotationRef = useRef(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');

  const [pinSwipeY, setPinSwipeY] = useState(0);
  const [isSwipingPin, setIsSwipingPin] = useState(false);
  const [pinStartY, setPinStartY] = useState(0);

  const [panelSwipeY, setPanelSwipeY] = useState(0);
  const [isSwipingPanel, setIsSwipingPanel] = useState(false);
  const [panelStartY, setPanelStartY] = useState(0);

  const handlePinTouchStart = (e) => { e.stopPropagation(); setPinStartY(e.touches[0].clientY); setIsSwipingPin(true); };
  const handlePinTouchMove = (e) => { e.stopPropagation(); if (!isPinOpen) return; const diffY = e.touches[0].clientY - pinStartY; if (diffY < 0) setPinSwipeY(diffY); };
  const handlePinTouchEnd = (e) => { e.stopPropagation(); setIsSwipingPin(false); if (pinSwipeY < -80) { setIsPinOpen(false); setPinInput(''); } setPinSwipeY(0); };

  const handlePanelTouchStart = (e) => {
    e.stopPropagation();
    const scrollable = e.target.closest('.panel-body');
    if (scrollable && scrollable.scrollTop > 0) return;
    setPanelStartY(e.touches[0].clientY); setIsSwipingPanel(true);
  };
  const handlePanelTouchMove = (e) => { e.stopPropagation(); if (!isSwipingPanel) return; const diffY = e.touches[0].clientY - panelStartY; if (diffY > 0) setPanelSwipeY(diffY); };
  const handlePanelTouchEnd = (e) => { e.stopPropagation(); if (!isSwipingPanel) return; setIsSwipingPanel(false); if (panelSwipeY > 80) { setIsCustomizeOpen(false); setIsTransferOpen(false); } setPanelSwipeY(0); };

  const handleCardClick = (card) => {
    const freshCard = cards.find(c => c.id === card.id);
    setSelectedCard(freshCard); setPinInput(''); setIsPinOpen(true);
  };

  const handleKeyPress = (num) => {
    if (isShaking || pinInput.length >= 4) return;
    const nextPin = pinInput + num; setPinInput(nextPin);
    if (nextPin.length === 4) {
      if (nextPin === selectedCard.pin) {
        setTimeout(() => { setIsPinOpen(false); setLoggedInCard(selectedCard); setActiveRoute('card'); }, 300);
      } else {
        setTimeout(() => { setIsShaking(true); setTimeout(() => { setIsShaking(false); setPinInput(''); }, 500); }, 200);
      }
    }
  };

  const handleCompleteRequestSubmission = (achievement) => {
    if (!loggedInCard) { setDeniedTaskFeedback(achievement.id); setTimeout(() => setDeniedTaskFeedback(null), 500); return; }
    setCompletedTaskFeedback(achievement.id);
    const newRequest = { id: getNextId(), kidId: loggedInCard.id, kidName: loggedInCard.name, title: achievement.title, reward: achievement.reward };
    setPendingRequests(prev => [newRequest, ...prev]);
    setTimeout(() => setCompletedTaskFeedback(null), 2500);
  };

  const renderRadialProgress = (price) => {
    if (!loggedInCard) return null;
    const freshLoggedIn = cards.find(c => c.id === loggedInCard.id);
    if (!freshLoggedIn) return null;
    const progress = Math.min(freshLoggedIn.balance / price, 1);
    if (progress >= 1) return null;
    const radius = 43; const circ = Math.PI * radius; const strokeDashoffset = circ - (progress * circ);
    return (
      <svg className="radial-progress-svg" viewBox="0 0 100 100">
        <path d="M 10 50 A 40 40 0 0 0 90 50" stroke="white" strokeWidth={2} fill="none" />
        {progress > 0 && <path d="M 10 50 A 40 40 0 0 0 90 50" stroke="#005C6D" strokeWidth={6} fill="none" strokeDasharray={circ} strokeDashoffset={strokeDashoffset} />}
      </svg>
    );
  };

  const handleSelectDesign = (bgValue) => {
    setCards(prev => prev.map(card => {
      if (card.id === loggedInCard.id) { const updated = { ...card, background: bgValue }; setLoggedInCard(updated); return updated; }
      return card;
    }));
    setIsCustomizeOpen(false);
  };

  const handleProcessTransfer = () => {
    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0 || loggedInCard.balance < amount) return;
    const recipient = cards.find(card => card.id !== loggedInCard.id);
    setCards(prev => prev.map(card => {
      if (card.id === loggedInCard.id) {
        const updated = { ...card, balance: card.balance - amount, history: [{ id: getNextId(), title: `перевод для ${recipient.name}`, value: -amount, type: 'neutral' }, ...card.history] };
        setLoggedInCard(updated); return updated;
      }
      if (card.id === recipient.id) {
        return { ...card, balance: card.balance + amount, history: [{ id: getNextId(), title: `перевод от ${loggedInCard.name}`, value: amount, type: 'positive' }, ...card.history] };
      }
      return card;
    }));
    setTransferAmount(''); setIsTransferOpen(false);
  };

  const handleDiscDragStart = (id, e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const discElement = document.getElementById(`disc-${id}`);
    const rect = discElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2; const centerY = rect.top + rect.height / 2;
    activeRotationRef.current = { id, centerX, centerY, startAngle: Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI), currentBaseAngle: discRotation[id] || 0 };
    window.addEventListener('mousemove', handleDiscDragMove);
    window.addEventListener('mouseup', handleDiscDragEnd);
    window.addEventListener('touchmove', handleDiscDragMove, { passive: false });
    window.addEventListener('touchend', handleDiscDragEnd);
  };

  const handleDiscDragMove = (e) => {
    if (!activeRotationRef.current) return;
    if (e.cancelable) e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const { id, centerX, centerY, startAngle, currentBaseAngle } = activeRotationRef.current;
    const currentAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    setDiscRotation(prev => ({ ...prev, [id]: currentBaseAngle + (currentAngle - startAngle) }));
  };

  const handleDiscDragEnd = () => {
    activeRotationRef.current = null;
    window.removeEventListener('mousemove', handleDiscDragMove);
    window.removeEventListener('mouseup', handleDiscDragEnd);
    window.removeEventListener('touchmove', handleDiscDragMove);
    window.removeEventListener('touchend', handleDiscDragEnd);
  };

  // --- MANAGER DASHBOARD STATES & LOGIC ---
  const [adminActiveTab, setAdminActiveTab] = useState('commands');
  const [adminAddAmount, setAdminAddAmount] = useState({ 1: '', 2: '' });
  const [adminReason, setAdminReason] = useState({ 1: '', 2: '' });
  
  const [managingHistoryFor, setManagingHistoryFor] = useState(null); // Kid ID
  
  const [editAchId, setEditAchId] = useState(null);
  const [newAchTitle, setNewAchTitle] = useState('');
  const [newAchReward, setNewAchReward] = useState('');
  const [newAchVisibleTo, setNewAchVisibleTo] = useState('all');
  
  const [editShopId, setEditShopId] = useState(null);
  const [newShopTitle, setNewShopTitle] = useState('');
  const [newShopPrice, setNewShopPrice] = useState('');
  const [newShopType, setNewShopType] = useState('text');
  const [newShopImgUrl, setNewShopImgUrl] = useState('');
  const [newShopVisibleTo, setNewShopVisibleTo] = useState('all');

  // Fast Image processor for Copy/Paste/Upload
  const processImageFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH > img.width ? img.width : MAX_WIDTH;
        canvas.height = MAX_WIDTH > img.width ? img.height : img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setNewShopImgUrl(canvas.toDataURL('image/webp', 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFormPaste = useCallback((e) => {
    const pasteItems = e.clipboardData?.items;
    if (!pasteItems) return;
    for (let i = 0; i < pasteItems.length; i++) {
      if (pasteItems[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        processImageFile(pasteItems[i].getAsFile());
        break;
      }
    }
  }, [processImageFile]);

  // Balance & History Adjustments
  const handleAdminAdjustBalance = (kidId, type) => {
    const amount = parseInt(adminAddAmount[kidId]);
    const reasonText = adminReason[kidId].trim() || (type === 'add' ? 'Поощрение' : 'Штраф');
    if (isNaN(amount) || amount <= 0) return;
    setCards(prev => prev.map(card => {
      if (card.id === kidId) {
        const finalValue = type === 'add' ? amount : -amount;
        return { ...card, balance: card.balance + finalValue, history: [{ id: getNextId(), title: reasonText, value: finalValue, type: type === 'add' ? 'positive' : 'negative' }, ...card.history] };
      }
      return card;
    }));
    setAdminAddAmount(prev => ({ ...prev, [kidId]: '' })); setAdminReason(prev => ({ ...prev, [kidId]: '' }));
  };

  const handleEditHistoryItem = (kidId, historyId, field, newValue) => {
    setCards(prev => prev.map(card => {
      if (card.id === kidId) {
        const oldItem = card.history.find(h => h.id === historyId);
        const updatedVal = field === 'value' ? parseInt(newValue) || 0 : newValue;
        const newHistory = card.history.map(h => h.id === historyId ? { ...h, [field]: updatedVal } : h);
        const balanceDiff = field === 'value' ? updatedVal - oldItem.value : 0;
        return { ...card, balance: card.balance + balanceDiff, history: newHistory };
      }
      return card;
    }));
  };

  const handleDeleteHistoryItem = (kidId, historyId) => {
    setCards(prev => prev.map(card => {
      if (card.id === kidId) {
        const oldItem = card.history.find(h => h.id === historyId);
        return { ...card, balance: card.balance - oldItem.value, history: card.history.filter(h => h.id !== historyId) };
      }
      return card;
    }));
  };

  const handleAdminApproveRequest = (request) => {
    setCards(prev => prev.map(card => card.id === request.kidId ? { ...card, balance: card.balance + request.reward, history: [{ id: getNextId(), title: request.title, value: request.reward, type: 'positive' }, ...card.history] } : card));
    setPendingRequests(prev => prev.filter(req => req.id !== request.id));
  };
  const handleAdminRejectRequest = (requestId) => setPendingRequests(prev => prev.filter(req => req.id !== requestId));
  
  const handleMoveItem = (type, index, direction) => {
    const list = type === 'ach' ? [...achievements] : [...shopItems];
    const tIdx = index + direction;
    if (tIdx < 0 || tIdx >= list.length) return;
    const temp = list[index]; list[index] = list[tIdx]; list[tIdx] = temp;
    if (type === 'ach') setAchievements(list); else setShopItems(list);
  };

  // Editing Items
  const startEditAch = (ach) => {
    setEditAchId(ach.id); setNewAchTitle(ach.title); setNewAchReward(ach.reward.toString()); setNewAchVisibleTo(ach.visibleTo);
  };
  const cancelEditAch = () => {
    setEditAchId(null); setNewAchTitle(''); setNewAchReward(''); setNewAchVisibleTo('all');
  };
  const handleSaveAchievement = (e) => {
    e.preventDefault(); const rewardVal = parseInt(newAchReward);
    if (!newAchTitle.trim() || isNaN(rewardVal)) return;
    if (editAchId) {
      setAchievements(prev => prev.map(ach => ach.id === editAchId ? { ...ach, title: newAchTitle.trim(), reward: rewardVal, visibleTo: newAchVisibleTo } : ach));
      cancelEditAch();
    } else {
      setAchievements(prev => [...prev, { id: `ach_${getNextId()}`, title: newAchTitle.trim(), reward: rewardVal, visibleTo: newAchVisibleTo }]);
      setNewAchTitle(''); setNewAchReward('');
    }
  };

  const startEditShop = (item) => {
    setEditShopId(item.id); setNewShopTitle(item.title); setNewShopPrice(item.price.toString());
    setNewShopType(item.type); setNewShopImgUrl(item.img || ''); setNewShopVisibleTo(item.visibleTo);
  };
  const cancelEditShop = () => {
    setEditShopId(null); setNewShopTitle(''); setNewShopPrice(''); setNewShopType('text'); setNewShopImgUrl(''); setNewShopVisibleTo('all');
  };
  const handleSaveShopItem = (e) => {
    e.preventDefault(); const priceVal = parseInt(newShopPrice);
    if (!newShopTitle.trim() || isNaN(priceVal)) return;
    if (editShopId) {
      setShopItems(prev => prev.map(item => item.id === editShopId ? { ...item, title: newShopTitle.trim(), price: priceVal, type: newShopType, img: newShopType === 'image' ? newShopImgUrl : '', visibleTo: newShopVisibleTo } : item));
      cancelEditShop();
    } else {
      setShopItems(prev => [...prev, { id: `shop_${getNextId()}`, title: newShopTitle.trim(), price: priceVal, type: newShopType, img: newShopType === 'image' ? newShopImgUrl : '', visibleTo: newShopVisibleTo }]);
      setNewShopTitle(''); setNewShopPrice(''); setNewShopImgUrl('');
    }
  };

  const handleDeleteItem = (type, id) => {
    if (type === 'ach') { setAchievements(prev => prev.filter(item => item.id !== id)); if(editAchId === id) cancelEditAch(); }
    else { setShopItems(prev => prev.filter(item => item.id !== id)); if(editShopId === id) cancelEditShop(); }
  };

  // --- MANAGER RENDERING ---
  if (isAdminMode) {
    return (
      <div className="admin-portal">
        <div className="admin-tabs">
          <button className={`admin-tab-btn ${adminActiveTab === 'commands' ? 'active' : ''}`} onClick={() => setAdminActiveTab('commands')}>Управление балансом и заявками</button>
          <button className={`admin-tab-btn ${adminActiveTab === 'lists' ? 'active' : ''}`} onClick={() => setAdminActiveTab('lists')}>Настройка задач и магазина</button>
        </div>

        {adminActiveTab === 'commands' ? (
          <div className="admin-main-grid">
            <div className="admin-kids-grid">
              {cards.map(card => (
                <div key={card.id} className="admin-kid-card">
                  <div className="kid-summary"><h2>{card.name}</h2><div className="admin-balance-display">{card.balance} <StarIcon /></div></div>
                  
                  {managingHistoryFor === card.id ? (
                    <div className="admin-history-editor">
                      {card.history.map(h => (
                        <div key={h.id} className="admin-history-edit-row">
                          <input type="text" value={h.title} onChange={(e) => handleEditHistoryItem(card.id, h.id, 'title', e.target.value)} />
                          <input type="number" value={h.value} onChange={(e) => handleEditHistoryItem(card.id, h.id, 'value', e.target.value)} />
                          <button className="btn-delete-history" onClick={() => handleDeleteHistoryItem(card.id, h.id)}>✖</button>
                        </div>
                      ))}
                      {card.history.length === 0 && <p style={{color: '#718096', fontSize: 13, textAlign: 'center'}}>Нет записей</p>}
                      <button className="admin-history-toggle" onClick={() => setManagingHistoryFor(null)}>Назад к управлению</button>
                    </div>
                  ) : (
                    <>
                      <div className="admin-controls-form">
                        <input type="number" placeholder="Сумма звезд" value={adminAddAmount[card.id]} onChange={(e) => setAdminAddAmount(prev => ({ ...prev, [card.id]: e.target.value }))} className="admin-number-input" />
                        <input type="text" placeholder="Причина" value={adminReason[card.id]} onChange={(e) => setAdminReason(prev => ({ ...prev, [card.id]: e.target.value }))} className="admin-text-input" />
                        <div className="admin-action-row">
                          <button className="admin-btn-add" onClick={() => handleAdminAdjustBalance(card.id, 'add')}>Начислить (+)</button>
                          <button className="admin-btn-deduct" onClick={() => handleAdminAdjustBalance(card.id, 'deduct')}>Снять (-)</button>
                        </div>
                      </div>
                      <button className="admin-history-toggle" onClick={() => setManagingHistoryFor(card.id)}>История операций ({card.history.length})</button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="admin-queue-card">
              <h3>Очередь подтверждения ({pendingRequests.length})</h3>
              {pendingRequests.length === 0 ? (
                <p className="empty-queue-msg">Ждем, пока девочки отправят задачи с телефонов...</p>
              ) : (
                <div className="queue-list">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="queue-item">
                      <div className="queue-item-info">
                        <p className="queue-sender"><strong>{req.kidName}</strong> выполнила:</p>
                        <p className="queue-task">{req.title} (+{req.reward} <StarIcon />)</p>
                      </div>
                      <div className="queue-actions">
                        <button className="btn-approve" onClick={() => handleAdminApproveRequest(req)}>Одобрить</button>
                        <button className="btn-reject" onClick={() => handleAdminRejectRequest(req.id)}>Отклонить</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="admin-main-grid lists-tab">
            {/* TASKS COLUMN */}
            <div className="admin-queue-card list-editor-panel">
              <h3>{editAchId ? '✏️ Редактирование Задачи' : 'Настройка Задач (Achievements)'}</h3>
              <form onSubmit={handleSaveAchievement} className={`admin-add-form ${editAchId ? 'editing' : ''}`}>
                <input type="text" placeholder="Название задачи" value={newAchTitle} onChange={(e) => setNewAchTitle(e.target.value)} required />
                <input type="number" placeholder="Звезды награды" value={newAchReward} onChange={(e) => setNewAchReward(e.target.value)} required />
                <select value={newAchVisibleTo} onChange={(e) => setNewAchVisibleTo(e.target.value)}><option value="all">Для всех</option><option value="LIYA">Только Лия</option><option value="ZLATA">Только Злата</option></select>
                <div className="form-actions-row">
                  <button type="submit" className="admin-btn-add">{editAchId ? 'Сохранить' : 'Создать задачу'}</button>
                  {editAchId && <button type="button" className="btn-cancel-edit" onClick={cancelEditAch}>Отмена</button>}
                </div>
              </form>
              <div className="admin-preview-grid">
                {achievements.map((ach, idx) => (
                  <div key={ach.id} className={`preview-wrapper ${editAchId === ach.id ? 'is-editing' : ''}`}>
                    {ach.visibleTo !== 'all' && <div className="preview-badge">{ach.visibleTo}</div>}
                    <div className="preview-scale">
                      <div className="achievement-card" style={{cursor: 'default', pointerEvents: 'none'}}>
                        <span className="achievement-title">{ach.title}</span>
                        <span className="achievement-badge">+{ach.reward}<StarIcon /></span>
                      </div>
                    </div>
                    <div className="preview-controls">
                      <button onClick={() => startEditAch(ach)}>✏️</button>
                      <button onClick={() => handleMoveItem('ach', idx, -1)} disabled={idx === 0}>▲</button>
                      <button onClick={() => handleMoveItem('ach', idx, 1)} disabled={idx === achievements.length - 1}>▼</button>
                      <button onClick={() => handleDeleteItem('ach', ach.id)} className="btn-delete">✖</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SHOP COLUMN */}
            <div className="admin-queue-card list-editor-panel">
              <h3>{editShopId ? '✏️ Редактирование Магазина' : 'Настройка Магазина (Shop)'}</h3>
              <form onSubmit={handleSaveShopItem} className={`admin-add-form ${editShopId ? 'editing' : ''}`} onPaste={handleFormPaste}>
                <input type="text" placeholder="Название товара" value={newShopTitle} onChange={(e) => setNewShopTitle(e.target.value)} required />
                <input type="number" placeholder="Стоимость товара" value={newShopPrice} onChange={(e) => setNewShopPrice(e.target.value)} required />
                <select value={newShopType} onChange={(e) => setNewShopType(e.target.value)}><option value="text">Текст (Винил-крутилка)</option><option value="image">Картинка</option></select>
                
                {newShopType === 'image' && (
                  <div className="image-upload-zone">
                    <input type="text" placeholder="Ссылка (URL) или Ctrl+V ->" value={newShopImgUrl} onChange={(e) => setNewShopImgUrl(e.target.value)} />
                    <label>Файл...<input type="file" accept="image/*" style={{display: 'none'}} onChange={(e) => { if(e.target.files[0]) processImageFile(e.target.files[0]); }} /></label>
                  </div>
                )}
                <select value={newShopVisibleTo} onChange={(e) => setNewShopVisibleTo(e.target.value)}><option value="all">Для всех</option><option value="LIYA">Только Лия</option><option value="ZLATA">Только Злата</option></select>
                <div className="form-actions-row">
                  <button type="submit" className="admin-btn-add">{editShopId ? 'Сохранить' : 'Создать товар'}</button>
                  {editShopId && <button type="button" className="btn-cancel-edit" onClick={cancelEditShop}>Отмена</button>}
                </div>
              </form>
              <div className="admin-preview-grid">
                {shopItems.map((item, idx) => (
                  <div key={item.id} className={`preview-wrapper ${editShopId === item.id ? 'is-editing' : ''}`}>
                    {item.visibleTo !== 'all' && <div className="preview-badge">{item.visibleTo}</div>}
                    <div className="preview-scale-shop">
                      <div className="shop-card-wrapper">
                        <div className="shop-price-badge">{item.price}<StarIcon /></div>
                        <div className="shop-circle-outer">
                          {item.type === 'image' ? (
                            <div className="shop-image-circle"><img src={item.img} alt={item.title} className="shop-reward-image" /></div>
                          ) : (
                            <div className="text-disc"><span className="disc-label">{item.title}</span></div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="preview-controls">
                      <button onClick={() => startEditShop(item)}>✏️</button>
                      <button onClick={() => handleMoveItem('shop', idx, -1)} disabled={idx === 0}>▲</button>
                      <button onClick={() => handleMoveItem('shop', idx, 1)} disabled={idx === shopItems.length - 1}>▼</button>
                      <button onClick={() => handleDeleteItem('shop', item.id)} className="btn-delete">✖</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // NIECE MOBILE APP VIEW
  return (
    <div className={`app-wrapper tab-${activeRoute}`}>
      <div className={`animated-background ${(activeRoute === 'main' || activeRoute === 'card') ? 'show' : ''}`} style={{ backgroundImage: `url(${starPattern})` }} />

      <div className={`pin-overlay ${isPinOpen ? 'open' : ''}`} onTouchStart={handlePinTouchStart} onTouchMove={handlePinTouchMove} onTouchEnd={handlePinTouchEnd} style={{ transform: isPinOpen && pinSwipeY < 0 ? `translateY(${pinSwipeY}px)` : undefined, transition: isSwipingPin ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {selectedCard && (
          <div className="pin-content">
            <div className="pin-pill" style={{ background: selectedCard.background }}>{selectedCard.name}</div>
            <div className={`pin-dots ${isShaking ? 'shake' : ''}`}>{[0, 1, 2, 3].map((index) => <div key={index} className={`dot ${index < pinInput.length ? 'filled' : ''}`}></div>)}</div>
            <div className="numpad">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => <button key={num} className="numpad-btn" onClick={() => handleKeyPress(num)}>{num}</button>)}<div className="numpad-spacer"></div><button className="numpad-btn" onClick={() => handleKeyPress(0)}>0</button><div className="numpad-spacer"></div></div>
            <div className="drag-handle" onClick={() => setIsPinOpen(false)}><div className="drag-line"></div></div>
          </div>
        )}
      </div>

      <div className={`panel-backdrop ${(isCustomizeOpen || isTransferOpen) ? 'open' : ''}`} onClick={() => { setIsCustomizeOpen(false); setIsTransferOpen(false); }} />

      <div className={`sliding-panel ${isCustomizeOpen ? 'open' : ''}`} onTouchStart={handlePanelTouchStart} onTouchMove={handlePanelTouchMove} onTouchEnd={handlePanelTouchEnd} style={{ transform: isCustomizeOpen && panelSwipeY > 0 ? `translateY(${panelSwipeY}px)` : undefined, transition: isSwipingPanel ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="panel-header"><div className="drag-bar" onClick={() => setIsCustomizeOpen(false)}></div><h3>выберите дизайн</h3></div>
        <div className="panel-body">
          <div className="design-options">
            <h4>солидные цвета</h4><div className="design-grid"><button onClick={() => handleSelectDesign('#8C00FF')} style={{ background: '#8C00FF' }}></button><button onClick={() => handleSelectDesign('#00C2FF')} style={{ background: '#00C2FF' }}></button><button onClick={() => handleSelectDesign('#FF5C00')} style={{ background: '#FF5C00' }}></button></div>
            <h4>премиум градиенты</h4><div className="design-grid"><button onClick={() => handleSelectDesign('linear-gradient(135deg, #5D5753 0%, #EED5A0 100%)')} style={{ background: 'linear-gradient(135deg, #5D5753 0%, #EED5A0 100%)' }}></button><button onClick={() => handleSelectDesign('linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)')} style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' }}></button><button onClick={() => handleSelectDesign('linear-gradient(135deg, #2E0854 0%, #000000 100%)')} style={{ background: 'linear-gradient(135deg, #2E0854 0%, #000000 100%)' }}></button></div>
          </div>
        </div>
      </div>

      <div className={`sliding-panel ${isTransferOpen ? 'open' : ''}`} onTouchStart={handlePanelTouchStart} onTouchMove={handlePanelTouchMove} onTouchEnd={handlePanelTouchEnd} style={{ transform: isTransferOpen && panelSwipeY > 0 ? `translateY(${panelSwipeY}px)` : undefined, transition: isSwipingPanel ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="panel-header"><div className="drag-bar" onClick={() => setIsTransferOpen(false)}></div><h3>перевести звезды</h3></div>
        <div className="panel-body">
          {loggedInCard && (
            <div className="transfer-form">
              <p className="transfer-target-desc">Кому: <strong>{cards.find(card => card.id !== loggedInCard.id)?.name}</strong></p>
              <div className="transfer-input-wrapper"><input type="number" placeholder="Сумма перевода" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="transfer-input" /><StarIcon className="transfer-star" /></div>
              <button className="confirm-transfer-btn" onClick={handleProcessTransfer}>Подтвердить</button>
            </div>
          )}
        </div>
      </div>

      <div className="viewport" onTouchStart={handleTrackTouchStart} onTouchMove={handleTrackTouchMove} onTouchEnd={handleTrackTouchEnd}>
        <div className="swipe-track" style={{ transform: `translateX(calc(-${activeIndex * 100}% + ${swipeDeltaX}px))`, transition: isSwiping ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {routes.map((route) => {
            if (route === 'main') return (<div className="swipe-page" key="main"><div className="cards-stack">{cards.map((card) => <Interactive3DCard key={card.id} background={card.background} name={card.name} balance={card.balance} onClick={() => handleCardClick(card)} />)}</div></div>);
            if (route === 'card') {
              const displayCard = loggedInCard || selectedCard;
              return (<div className="swipe-page" key="card">{displayCard && (<div className="card-details-screen"><Interactive3DCard background={displayCard.background} name={displayCard.name} balance={displayCard.balance} onClick={() => {}} /><div className="sub-menu"><button className="menu-action-btn" onClick={() => setIsCustomizeOpen(true)}>поменять карту</button><button className="menu-action-btn" onClick={() => setIsTransferOpen(true)}>перевести звезды</button></div><div className="history-section"><h3 className="history-header">ИСТОРИЯ ОПЕРАЦИЙ</h3><div className="history-list">{(cards.find(c => c.id === displayCard.id)?.history || []).map((item) => (<div key={item.id} className={`history-item ${item.type}`}><span className="history-title">{item.title}</span><span className="history-badge">{item.value > 0 ? `+${item.value}` : item.value}<StarIcon /></span></div>))}</div></div></div>)}</div>);
            }
            if (route === 'earn') return (<div className="swipe-page" key="earn"><div className="achievements-screen"><div className="achievements-list">{achievements.filter(ach => ach.visibleTo === 'all' || (loggedInCard && ach.visibleTo === loggedInCard.name)).map((ach) => { const isCompleted = completedTaskFeedback === ach.id; const isDenied = deniedTaskFeedback === ach.id; return (<div key={ach.id} className={`achievement-card ${isDenied ? 'denied-shake' : ''} ${isCompleted ? 'success-pulse' : ''}`} onClick={() => handleCompleteRequestSubmission(ach)}>{isCompleted ? (<div className="achievement-success-info">Отправлено!<StarIcon /></div>) : (<><span className="achievement-title">{ach.title}</span><span className="achievement-badge">+{ach.reward}<StarIcon /></span></>)}</div>); })}</div></div></div>);
            if (route === 'shop') return (<div className="swipe-page" key="shop"><div className="shop-screen"><div className="shop-grid">{shopItems.filter(item => item.visibleTo === 'all' || (loggedInCard && item.visibleTo === loggedInCard.name)).map((item) => (<div key={item.id} className={`shop-card-wrapper ${!loggedInCard ? 'interaction-locked' : ''}`}><div className="shop-price-badge">{item.price}<StarIcon /></div><div className="shop-circle-outer">{item.type === 'image' ? (<div className="shop-image-circle"><img src={item.img} alt={item.title} className="shop-reward-image" /></div>) : (<div id={`disc-${item.id}`} className="text-disc" style={{ transform: `rotate(${discRotation[item.id] || 0}deg)` }} onMouseDown={(e) => handleDiscDragStart(item.id, e)} onTouchStart={(e) => handleDiscDragStart(item.id, e)}><span className="disc-label">{item.title}</span></div>)}{renderRadialProgress(item.price)}</div></div>))}</div></div></div>);
            return null;
          })}
        </div>
      </div>

      <nav className="bottom-nav">
        <button className={`nav-btn ${(activeRoute === 'main' || activeRoute === 'card') ? 'active' : ''}`} onClick={() => navigateRoute(loggedInCard ? 'card' : 'main')}>{loggedInCard ? <div className="nav-profile-avatar" style={{ background: loggedInCard.background }}></div> : <img src={iconStar} alt="Home" />}</button>
        <button className={`nav-btn ${activeRoute === 'earn' ? 'active' : ''}`} onClick={() => navigateRoute('earn')}><img src={iconPlus} alt="Earn" /></button>
        <button className={`nav-btn ${activeRoute === 'shop' ? 'active' : ''}`} onClick={() => navigateRoute('shop')}><img src={iconShop} alt="Shop" /></button>
      </nav>
    </div>
  )
}