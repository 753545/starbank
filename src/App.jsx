import { useState, useRef } from 'react'
import './App.css'

// Import assets
import starPattern from './assets/star.png'
import starCurrency from './assets/star_currency.svg'
import iconStar from './assets/star.svg'
import iconPlus from './assets/plus.svg'
import iconShop from './assets/shop.svg'

// Dynamic Inline Star matching custom sharp geometry
function StarIcon({ className = "star-inline" }) {
  return (
    <svg className={className} viewBox="0 -1 77 66" fill="currentColor" >
<path d="M75.4068 24.0906H52.5686C51.9754 24.0906 51.5349 23.5405 51.6635 22.9594L56.4627 1.13539C56.6703 0.193805 55.4883 -0.403781 54.8578 0.323906L34.5208 23.772C34.345 23.9749 34.0891 24.0917 33.821 24.0917H8.43653C7.65112 24.0917 7.22162 25.0102 7.72362 25.6177L19.5234 39.8748C19.8134 40.2254 19.8079 40.737 19.5091 41.081L0.235364 63.302C-0.436899 64.0771 0.453959 65.2127 1.36239 64.7386L27.7476 50.9599C28.1343 50.7582 28.6099 50.8541 28.8889 51.1904L40.7666 65.5424C41.2599 66.1378 42.2188 65.904 42.3858 65.1488L47.7167 40.9079C47.776 40.6389 47.9506 40.4096 48.1945 40.2828L75.8352 25.8481C76.6964 25.3983 76.3779 24.0917 75.4068 24.0917V24.0906Z"/>
    </svg>
  );
}

// 3D Card Wrapper Component
function Interactive3DCard({ background, name, balance, onClick }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Get client touch/mouse coordinate positions
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;

    // Constrain perspective rotation angles
    const rotateY = (x / (rect.width / 2)) * 15;
    const rotateX = -(y / (rect.height / 2)) * 15;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={cardRef}
      className="bank-card"
      style={{ 
        background: background,
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onTouchMove={handleMove}
      onTouchEnd={handleLeave}
      onClick={onClick}
    >
      <div className="card-name">{name}</div>
      <div className="card-balance-container">
        <span className="card-balance">{balance}</span>
        <img src={starCurrency} alt="Stars" className="star-currency-icon" />
      </div>
    </div>
  );
}

// Mock Images
const imgRainbowHigh = 'https://i.imgur.com/XqT7hCj.png' 
const imgDraculaura = 'https://i.imgur.com/vH1N7wS.png'

// Achievements list
const achievementsList = [
  { id: 'ach_1', title: 'помощь', reward: 200, visibleTo: 'all' },
  { id: 'ach_2', title: 'съесть завтрак', reward: 200, visibleTo: 'all' },
  { id: 'ach_3', title: 'прочитать книгу', reward: 200, visibleTo: 'all' },
  { id: 'ach_4', title: 'убрать игрушки', reward: 150, visibleTo: 'LIYA' },
  { id: 'ach_5', title: 'помыть посуду', reward: 150, visibleTo: 'ZLATA' }
]

// Shop rewards
const shopList = [
  { id: 'shop_1', title: 'Rainbow High', price: 5000, type: 'image', img: imgRainbowHigh, visibleTo: 'all' },
  { id: 'shop_2', title: 'компьютер', price: 20, type: 'text', visibleTo: 'all' },
  { id: 'shop_3', title: 'Draculaura', price: 5000, type: 'image', img: imgDraculaura, visibleTo: 'all' },
  { id: 'shop_4', title: 'Сладкий набор', price: 350, type: 'text', visibleTo: 'LIYA' }
]

const initialCardsData = [
  {
    id: 1,
    name: 'LIYA',
    balance: 2000,
    background: '#8C00FF',
    pin: '1111',
    history: [
      { id: 101, title: 'помощь', value: 250, type: 'positive' },
      { id: 102, title: 'кукла', value: -1200, type: 'neutral' },
      { id: 103, title: 'драка', value: -450, type: 'negative' }
    ]
  },
  {
    id: 2,
    name: 'ZLATA',
    balance: 1300,
    background: 'linear-gradient(135deg, #5D5753 0%, #EED5A0 100%)',
    pin: '2222',
    history: [
      { id: 201, title: 'помощь', value: 250, type: 'positive' },
      { id: 202, title: 'сладости', value: -150, type: 'neutral' }
    ]
  }
]

export default function App() {
  const [cards, setCards] = useState(initialCardsData);
  const [activeTab, setActiveTab] = useState('home');
  const [currentScreen, setCurrentScreen] = useState('home'); 
  
  // Login Session state
  const [loggedInCard, setLoggedInCard] = useState(null); 
  const [selectedCard, setSelectedCard] = useState(null); 
  
  // PIN Overlay inputs
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Success/Lock Feedback States
  const [completedTaskFeedback, setCompletedTaskFeedback] = useState(null);
  const [deniedTaskFeedback, setDeniedTaskFeedback] = useState(null);

  // Global Page Swiping state
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeStartY, setSwipeStartY] = useState(0);

  // Disc Spin drag calculations
  const [discRotation, setDiscRotation] = useState({}); 
  const activeRotationRef = useRef(null);

  // Customizable overlays
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');

  // Touch Swipe Page Navigation
  const handlePageTouchStart = (e) => {
    if (e.target.closest('.text-disc')) return;
    setSwipeStartX(e.touches[0].clientX);
    setSwipeStartY(e.touches[0].clientY);
  };

  const handlePageTouchEnd = (e) => {
    if (e.target.closest('.text-disc')) return;
    const diffX = e.changedTouches[0].clientX - swipeStartX;
    const diffY = e.changedTouches[0].clientY - swipeStartY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 80) {
      if (diffX > 0) {
        if (activeTab === 'shop') {
          setActiveTab('earn');
        } else if (activeTab === 'earn') {
          setActiveTab('home');
        } else if (activeTab === 'home' && currentScreen === 'card_details') {
          handleLogout();
        }
      } else {
        if (activeTab === 'home') {
          setActiveTab('earn');
        } else if (activeTab === 'earn') {
          setActiveTab('shop');
        }
      }
    }
  };

  const handleCardClick = (card) => {
    if (loggedInCard?.id === card.id) {
      setSelectedCard(card);
      setCurrentScreen('card_details');
      setActiveTab('home');
      return;
    }
    setSelectedCard(card);
    setPinInput('');
    setIsPinOpen(true);
  };

  const handleKeyPress = (num) => {
    if (isShaking || pinInput.length >= 4) return;
    const nextPin = pinInput + num;
    setPinInput(nextPin);

    if (nextPin.length === 4) {
      if (nextPin === selectedCard.pin) {
        setTimeout(() => {
          setIsPinOpen(false);
          setLoggedInCard(selectedCard);
          setCurrentScreen('card_details');
          setActiveTab('home');
        }, 300);
      } else {
        setTimeout(() => {
          setIsShaking(true);
          setTimeout(() => {
            setIsShaking(false);
            setPinInput('');
          }, 500);
        }, 200);
      }
    }
  };

  const handleLogout = () => {
    setLoggedInCard(null);
    setSelectedCard(null);
    setCurrentScreen('home');
    setActiveTab('home');
  };

  const handleCompleteAchievement = (achievement) => {
    if (!loggedInCard) {
      setDeniedTaskFeedback(achievement.id);
      setTimeout(() => setDeniedTaskFeedback(null), 500);
      return;
    }

    setCompletedTaskFeedback(achievement.id);

    const updatedCards = cards.map(card => {
      if (card.id === loggedInCard.id) {
        const newHistoryItem = {
          id: Date.now(),
          title: achievement.title,
          value: achievement.reward,
          type: 'positive'
        };
        const updatedCard = {
          ...card,
          balance: card.balance + achievement.reward,
          history: [newHistoryItem, ...card.history]
        };
        setLoggedInCard(updatedCard);
        return updatedCard;
      }
      return card;
    });

    setCards(updatedCards);
    setTimeout(() => setCompletedTaskFeedback(null), 2500);
  };

  // Drag-to-Rotate Disc Logic
  const handleDiscDragStart = (id, e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const discElement = document.getElementById(`disc-${id}`);
    const rect = discElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    activeRotationRef.current = {
      id,
      centerX,
      centerY,
      startAngle: Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI),
      currentBaseAngle: discRotation[id] || 0
    };

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
    const rotationDiff = currentAngle - startAngle;

    setDiscRotation(prev => ({
      ...prev,
      [id]: currentBaseAngle + rotationDiff
    }));
  };

  const handleDiscDragEnd = () => {
    activeRotationRef.current = null;
    window.removeEventListener('mousemove', handleDiscDragMove);
    window.removeEventListener('mouseup', handleDiscDragEnd);
    window.removeEventListener('touchmove', handleDiscDragMove);
    window.removeEventListener('touchend', handleDiscDragEnd);
  };

  // Render SVG Arc Progress Indicator (with Flat Ends)
  const renderRadialProgress = (price) => {
    if (!loggedInCard) return null;
    const progress = Math.min(loggedInCard.balance / price, 1);
    
    if (progress >= 1) return null;

    const radius = 43; 
    const circ = Math.PI * radius; 
    const strokeDashoffset = circ - (progress * circ);

    return (
      <svg className="radial-progress-svg" viewBox="0 0 100 100">
        <path 
          d="M 10 50 A 40 40 0 0 0 90 50" 
          stroke="white" 
          strokeWidth={2} 
          fill="none" 
        />
        {progress > 0 && (
          <path 
            d="M 10 50 A 40 40 0 0 0 90 50" 
            stroke="#005C6D" 
            strokeWidth={6} // Adjustable thickness of the active tracker
            fill="none" 
            strokeDasharray={circ}
            strokeDashoffset={strokeDashoffset}
          />
        )}
      </svg>
    );
  };

  // Design Customizer Action
  const handleSelectDesign = (bgValue) => {
    const updatedCards = cards.map(card => {
      if (card.id === loggedInCard.id) {
        const updatedCard = { ...card, background: bgValue };
        setLoggedInCard(updatedCard);
        return updatedCard;
      }
      return card;
    });
    setCards(updatedCards);
    setIsCustomizeOpen(false);
  };

  // Secure Inter-sibling transfer system
  const handleProcessTransfer = () => {
    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (loggedInCard.balance < amount) return;

    // Identify transfer recipient
    const recipient = cards.find(card => card.id !== loggedInCard.id);

    const updatedCards = cards.map(card => {
      if (card.id === loggedInCard.id) {
        // Debiting active card
        const updated = {
          ...card,
          balance: card.balance - amount,
          history: [
            { id: Date.now(), title: `перевод для ${recipient.name}`, value: -amount, type: 'neutral' },
            ...card.history
          ]
        };
        setLoggedInCard(updated);
        return updated;
      }
      if (card.id === recipient.id) {
        // Crediting target card
        return {
          ...card,
          balance: card.balance + amount,
          history: [
            { id: Date.now() + 1, title: `перевод от ${loggedInCard.name}`, value: amount, type: 'positive' },
            ...card.history
          ]
        };
      }
      return card;
    });

    setCards(updatedCards);
    setTransferAmount('');
    setIsTransferOpen(false);
  };

  const filterListByVisibility = (list) => {
    return list.filter(item => {
      if (item.visibleTo === 'all') return true;
      if (loggedInCard && item.visibleTo === loggedInCard.name) return true;
      return false;
    });
  };

  return (
    <div 
      className={`app-wrapper tab-${activeTab}`}
      onTouchStart={handlePageTouchStart}
      onTouchEnd={handlePageTouchEnd}
    >
      
      {activeTab === 'home' && (
        <div 
          className="animated-background" 
          style={{ backgroundImage: `url(${starPattern})` }}
        ></div>
      )}

      {/* PIN OVERLAY SCREEN */}
      <div 
        className={`pin-overlay ${isPinOpen ? 'open' : ''}`}
        style={{ transform: isPinOpen ? 'translateY(0)' : 'translateY(-100%)' }}
      >
        {selectedCard && (
          <div className="pin-content">
            <div 
              className="pin-pill" 
              style={{ background: selectedCard.background }}
            >
              {selectedCard.name}
            </div>

            <div className={`pin-dots ${isShaking ? 'shake' : ''}`}>
              {[0, 1, 2, 3].map((index) => (
                <div 
                  key={index} 
                  className={`dot ${index < pinInput.length ? 'filled' : ''}`}
                ></div>
              ))}
            </div>

            <div className="numpad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button 
                  key={num} 
                  className="numpad-btn"
                  onClick={() => handleKeyPress(num)}
                >
                  {num}
                </button>
              ))}
              <div className="numpad-spacer"></div>
              <button 
                className="numpad-btn"
                onClick={() => handleKeyPress(0)}
              >
                0
              </button>
              <div className="numpad-spacer"></div>
            </div>

            <div className="drag-handle" onClick={() => setIsPinOpen(false)}>
              <div className="drag-line"></div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM-UP SLIDING CUSTOMIZER OVERLAY */}
      <div className={`sliding-panel ${isCustomizeOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <div className="drag-bar" onClick={() => setIsCustomizeOpen(false)}></div>
          <h3>выберите дизайн</h3>
        </div>
        <div className="panel-body">
          <div className="design-options">
            <h4>солидные цвета</h4>
            <div className="design-grid">
              <button onClick={() => handleSelectDesign('#8C00FF')} style={{ background: '#8C00FF' }}></button>
              <button onClick={() => handleSelectDesign('#00C2FF')} style={{ background: '#00C2FF' }}></button>
              <button onClick={() => handleSelectDesign('#FF5C00')} style={{ background: '#FF5C00' }}></button>
            </div>
            <h4>премиум градиенты</h4>
            <div className="design-grid">
              <button onClick={() => handleSelectDesign('linear-gradient(135deg, #5D5753 0%, #EED5A0 100%)')} style={{ background: 'linear-gradient(135deg, #5D5753 0%, #EED5A0 100%)' }}></button>
              <button onClick={() => handleSelectDesign('linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)')} style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' }}></button>
              <button onClick={() => handleSelectDesign('linear-gradient(135deg, #2E0854 0%, #000000 100%)')} style={{ background: 'linear-gradient(135deg, #2E0854 0%, #000000 100%)' }}></button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM-UP SLIDING TRANSFER OVERLAY */}
      <div className={`sliding-panel ${isTransferOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <div className="drag-bar" onClick={() => setIsTransferOpen(false)}></div>
          <h3>перевести звезды</h3>
        </div>
        <div className="panel-body">
          {loggedInCard && (
            <div className="transfer-form">
              <p className="transfer-target-desc">
                Кому: <strong>{cards.find(card => card.id !== loggedInCard.id)?.name}</strong>
              </p>
              <div className="transfer-input-wrapper">
                <input 
                  type="number" 
                  placeholder="Сумма перевода"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="transfer-input"
                />
                <StarIcon className="transfer-star" />
              </div>
              <button className="confirm-transfer-btn" onClick={handleProcessTransfer}>
                Подтвердить
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN SCREEN ROUTING */}
      <div className="content-area">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          currentScreen === 'home' ? (
            <div className="cards-stack animate-fade-in">
              {cards.map((card) => (
                <Interactive3DCard 
                  key={card.id}
                  background={card.background}
                  name={card.name}
                  balance={card.balance}
                  onClick={() => handleCardClick(card)}
                />
              ))}
            </div>
          ) : (
            <div className="card-details-screen animate-fade-in">
              {loggedInCard && (
                <>
                  <Interactive3DCard 
                    background={loggedInCard.background}
                    name={loggedInCard.name}
                    balance={loggedInCard.balance}
                    onClick={handleLogout}
                  />

                  <div className="sub-menu">
                    <button className="menu-action-btn" onClick={() => setIsCustomizeOpen(true)}>поменять карту</button>
                    <button className="menu-action-btn" onClick={() => setIsTransferOpen(true)}>перевести звезды</button>
                  </div>

                  <div className="history-section">
                    <h3 className="history-header">ИСТОРИЯ ОПЕРАЦИЙ</h3>
                    <div className="history-list">
                      {loggedInCard.history.map((item) => (
                        <div key={item.id} className={`history-item ${item.type}`}>
                          <span className="history-title">{item.title}</span>
                          <span className="history-badge">
                            {item.value > 0 ? `+${item.value}` : item.value}
                            <StarIcon />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        )}

        {/* TAB 2: ACHIEVEMENTS (+) */}
        {activeTab === 'earn' && (
          <div className="achievements-screen animate-fade-in">
            <div className="achievements-list">
              {filterListByVisibility(achievementsList).map((ach) => {
                const isCompleted = completedTaskFeedback === ach.id;
                const isDenied = deniedTaskFeedback === ach.id;
                
                return (
                  <div 
                    key={ach.id} 
                    className={`achievement-card ${isDenied ? 'denied-shake' : ''} ${isCompleted ? 'success-pulse' : ''}`}
                    onClick={() => handleCompleteAchievement(ach)}
                  >
                    {isCompleted ? (
                      <div className="achievement-success-info animate-fade-in">
                        Супер! Тебе начислено +{ach.reward}
                        <StarIcon />
                      </div>
                    ) : (
                      <>
                        <span className="achievement-title">{ach.title}</span>
                        <span className="achievement-badge">
                          +{ach.reward}
                          <StarIcon />
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SHOP */}
        {activeTab === 'shop' && (
          <div className="shop-screen animate-fade-in">
            <div className="shop-grid">
              {filterListByVisibility(shopList).map((item) => (
                <div 
                  key={item.id} 
                  className={`shop-card-wrapper ${!loggedInCard ? 'interaction-locked' : ''}`}
                >
                  <div className="shop-price-badge">
                    {item.price}
                    <StarIcon />
                  </div>

                  <div className="shop-circle-outer">
                    {item.type === 'image' ? (
                      <div className="shop-image-circle">
                        <img 
                          src={item.img} 
                          alt={item.title} 
                          className="shop-reward-image" 
                        />
                      </div>
                    ) : (
                      <div 
                        id={`disc-${item.id}`}
                        className="text-disc"
                        style={{ transform: `rotate(${discRotation[item.id] || 0}deg)` }}
                        onMouseDown={(e) => handleDiscDragStart(item.id, e)}
                        onTouchStart={(e) => handleDiscDragStart(item.id, e)}
                      >
                        <span className="disc-label">{item.title}</span>
                      </div>
                    )}

                    {renderRadialProgress(item.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION (Absolute over content layout) */}
      <nav className="bottom-nav">
        <button 
          className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('home');
            setCurrentScreen(loggedInCard ? 'card_details' : 'home');
          }}
        >
          {loggedInCard ? (
            <div 
              className="nav-profile-avatar"
              style={{ background: loggedInCard.background }}
            ></div>
          ) : (
            <img src={iconStar} alt="Home" />
          )}
        </button>
        <button 
          className={`nav-btn ${activeTab === 'earn' ? 'active' : ''}`}
          onClick={() => setActiveTab('earn')}
        >
          <img src={iconPlus} alt="Earn" />
        </button>
        <button 
          className={`nav-btn ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          <img src={iconShop} alt="Shop" />
        </button>
      </nav>

    </div>
  )
}