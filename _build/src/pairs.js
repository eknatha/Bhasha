/* Bhasha: minimal pairs for listening practice. Each entry is [word A, word B, meaning of A, meaning of B].
   Drafts for native review. Some device voices may blur these differences. */
(function (B) {
  'use strict';
  B.PAIRS = {
    te: [['పాలు', 'పలు', 'milk', 'several'], ['నది', 'నాది', 'river', 'mine'], ['కాలం', 'కలం', 'time', 'pen'], ['వీడు', 'విడు', 'this fellow', 'leave / release']],
    hi: [['पल', 'फल', 'moment', 'fruit'], ['दाल', 'डाल', 'lentils', 'branch'], ['कान', 'खान', 'ear', 'mine, a surname'], ['बात', 'भात', 'talk', 'cooked rice'], ['चाल', 'छाल', 'gait', 'bark'], ['ताल', 'थाल', 'pond, rhythm', 'plate']],
    kn: [['ಹಾಲು', 'ಹಲ್ಲು', 'milk', 'tooth'], ['ಕಾಲು', 'ಕಲ್ಲು', 'leg', 'stone'], ['ಕೆರೆ', 'ಕರೆ', 'lake', 'call']],
    ta: [['கல்', 'கள்', 'stone', 'toddy'], ['மலை', 'மழை', 'hill', 'rain'], ['வால்', 'வாள்', 'tail', 'sword'], ['கடை', 'கதை', 'shop', 'story'], ['பல்', 'பால்', 'tooth', 'milk']],
    ml: [['കാല്', 'കല', 'leg', 'art'], ['മല', 'മഴ', 'hill', 'rain'], ['വാള്', 'വാല്', 'sword', 'tail'], ['കട', 'കഥ', 'shop', 'story']],
    bn: [['চাল', 'ছাল', 'rice', 'bark'], ['কাটা', 'কাঁটা', 'to cut', 'thorn'], ['কাল', 'খাল', 'tomorrow / yesterday', 'canal'], ['দান', 'ধান', 'gift', 'paddy']],
    mr: [['चाल', 'छाल', 'gait', 'bark'], ['बाग', 'भाग', 'garden', 'part'], ['दार', 'धार', 'door', 'edge'], ['गाव', 'घाव', 'village', 'wound']],
    gu: [['બાગ', 'ભાગ', 'garden', 'part'], ['ચાલ', 'છાલ', 'walk', 'bark'], ['દાન', 'ધાન', 'donation', 'grain']],
    as: [['দান', 'ধান', 'gift', 'paddy'], ['কাল', 'খাল', 'time', 'canal'], ['বাগ', 'ভাগ', 'garden', 'part']],
    ko: [['불', '풀', 'fire', 'grass'], ['달', '딸', 'moon', 'daughter'], ['자다', '차다', 'to sleep', 'to kick / be cold'], ['사다', '싸다', 'to buy', 'cheap']],
    es: [['pero', 'perro', 'but', 'dog'], ['caro', 'carro', 'expensive', 'cart, car'], ['para', 'parra', 'for', 'grapevine'], ['cana', 'caña', 'grey hair', 'cane'], ['pena', 'peña', 'sorrow', 'rock']],
    de: [['Stadt', 'Staat', 'city', 'state'], ['bieten', 'bitten', 'to offer', 'to ask'], ['schon', 'schön', 'already', 'beautiful'], ['Höhle', 'Hölle', 'cave', 'hell']],
    fr: [['rue', 'roue', 'street', 'wheel'], ['poisson', 'poison', 'fish', 'poison'], ['dessus', 'dessous', 'above', 'below'], ['vin', 'vent', 'wine', 'wind']],
    en: [['ship', 'sheep', 'ship', 'sheep'], ['bed', 'bad', 'bed', 'bad'], ['full', 'fool', 'full', 'fool'], ['live', 'leave', 'live', 'leave'], ['cat', 'cut', 'cat', 'cut']],
    or: [['ଦାନ', 'ଧାନ', 'gift', 'paddy'], ['ବାଗ', 'ଭାଗ', 'garden', 'part'], ['ଚାଲି', 'ଛାଲି', 'walk', 'bark']],
    ne: [['दाल', 'डाल', 'lentils', 'branch'], ['तल', 'थल', 'below', 'land'], ['दान', 'धान', 'donation', 'paddy'], ['काल', 'खाल', 'time', 'skin']],
    ja: [['おばさん', 'おばあさん', 'aunt', 'grandmother'], ['おじさん', 'おじいさん', 'uncle', 'grandfather'], ['ゆき', 'ゆうき', 'snow', 'courage'], ['ビル', 'ビール', 'building', 'beer']]
  };
  // Story mode: each story is a list of phrase ids, spoken by two people in turn.
  B.STORIES = [
    { id: 'arrive', icon: '👋', lines: ['hello', 'how', 'fine', 'name-q', 'name-is', 'from-q', 'from-india', 'nice', 'nice-too', 'thanks'] },
    { id: 'cafe', icon: '☕', lines: ['hello', 'menu-pls', 'recommend', 'tea-or-coffee', 'tea', 'sugar-q', 'no-sugar', 'here-you-are', 'thanks', 'bill'] },
    { id: 'lost', icon: '🧭', lines: ['excuse', 'lost', 'where-go', 'station', 'straight-then-left', 'five-min-walk', 'far', 'thanks-help', 'welcome', 'take-care'] },
    { id: 'market', icon: '🛍', lines: ['help-you-q', 'another', 'price', 'price-500', 'expensive', 'reduce', 'price-400', 'take', 'cash-or-card', 'pay-card'] },
    { id: 'doctor', icon: '🩺', lines: ['problem-q', 'dizzy', 'cough', 'fever-q', 'since-yesterday', 'medicine-twice', 'pharmacy', 'thanks', 'better', 'take-care'] },
    { id: 'hotel', icon: '🏨', lines: ['hello', 'reservation-q', 'have-reservation', 'passport-pls', 'passport', 'nights-q', 'two-nights', 'third-floor', 'breakfast-incl', 'breakfast-8'] },
    { id: 'train', icon: '🚆', lines: ['train-q', 'leaves-six', 'platform-q', 'platform-two', 'tickets-two', 'train-late', 'how-long', 'half-hour', 'seat-free', 'yes-please'] },
    { id: 'friend', icon: '🤝', lines: ['new-q', 'came-yesterday', 'like-here', 'beautiful', 'show-around', 'free-tomorrow-q', 'free-tomorrow', 'meet-where', 'at-station', 'meet-five'] },
    { id: 'dinner', icon: '🍛', lines: ['come-dinner', 'thank-invite', 'come-in', 'make-home', 'water-q', 'dinner-ready', 'delicious', 'more-q', 'enough', 'visit-again'] },
    { id: 'work', icon: '💼', lines: ['hello', 'intro-yourself', 'engineer', 'office', 'when-start', 'start-tomorrow', 'meeting-ready-q', 'send-report', 'by-evening', 'well-done'] }
  ];
})(window.B = window.B || {});
