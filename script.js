// === CORE ===
const clickSound = new Audio('https://freesound.org/data/previews/331/331912_3248244-lq.mp3');
clickSound.preload = 'auto';

let coins = 0;
let clickPower = 1;
let autoPower = 0;
let multiplier = 1;
let glitchLevel = 0;

// === 20 Jutsu Upgrades ===
let upgrades = [
  { name: "Kunai Tap", baseCost: 10, power: 1, level: 0 },
  { name: "Shuriken Throw", baseCost: 30, power: 2, level: 0 },
  { name: "Shadow Clones", baseCost: 50, auto: 1, level: 0 },
  { name: "Fireball Jutsu", baseCost: 120, power: 3, level: 0 },
  { name: "Rasengan", baseCost: 200, power: 5, level: 0 },
  { name: "Chidori", baseCost: 600, power: 12, level: 0 },
  { name: "Summoning Jutsu", baseCost: 1500, auto: 5, level: 0 },
  { name: "Sage Mode", baseCost: 3000, power: 25, level: 0 },
  { name: "Wind: Rasen Shuriken", baseCost: 8000, power: 100, level: 0 },
  { name: "Amaterasu", baseCost: 20000, power: 300, level: 0 },
  { name: "Susanoo", baseCost: 60000, power: 800, level: 0 },
  { name: "Flying Raijin", baseCost: 150000, auto: 50, level: 0 },
  { name: "Tailed Beast Bomb", baseCost: 400000, power: 2500, level: 0 },
  { name: "Rinnegan Powers", baseCost: 1000000, power: 7000, level: 0 },
  { name: "Infinite Tsukuyomi", baseCost: 3000000, auto: 500, level: 0 },
  { name: "Kotoamatsukami", baseCost: 8000000, power: 20000, level: 0 },
  { name: "Six Paths Sage Mode", baseCost: 20000000, power: 60000, level: 0 },
  { name: "Truth-Seeking Orbs", baseCost: 50000000, auto: 2000, level: 0 },
  { name: "Indra’s Arrow", baseCost: 150000000, power: 200000, level: 0 },
  { name: "Naruto’s Baryon Mode", baseCost: 500000000, power: 1000000, level: 0 }
];

// === 5 Auras ===
let auras = [
  { name: "Akatsuki Aura", cost: 5000, multiplier: 2, bought: false },
  { name: "Bijuu Aura", cost: 20000, multiplier: 5, bought: false },
  { name: "Rinnegan Aura", cost: 100000, multiplier: 10, bought: false },
  { name: "Eternal Mangekyou", cost: 1000000, multiplier: 25, bought: false },
  { name: "Six Paths Aura", cost: 5000000, multiplier: 50, bought: false }
];

// elements
const coinDisplay = document.getElementById('coins');
const powerDisplay = document.getElementById('power');
const autoDisplay = document.getElementById('auto');
const clickBtn = document.getElementById('clickBtn');
const upgradeList = document.getElementById('upgradeList');
const auraList = document.getElementById('auraList');
const glitchLevelDisplay = document.getElementById('glitchLevel');
const toastEl = document.getElementById('toast');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');

document.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    try { clickSound.currentTime = 0; clickSound.play(); } catch {}
  }
});

function fmt(n){
  if (n < 1000) return Math.floor(n);
  const units = ['K','M','B','T'];
  let i= -1;
  while(n>=1000 && i<units.length-1){ n/=1000; i++; }
  return n.toFixed(1)+units[i];
}

function showToast(msg){
  toastEl.textContent = msg;
  toastEl.style.display = 'block';
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=> toastEl.style.display='none',1500);
}

function updateDisplay(){
  coinDisplay.textContent = fmt(coins);
  powerDisplay.textContent = fmt(clickPower*multiplier);
  autoDisplay.textContent = fmt(autoPower);
  glitchLevelDisplay.textContent = glitchLevel;
}

function upgradeCost(u){
  return Math.ceil(u.baseCost * Math.pow(1.15,u.level));
}

// render upgrades
function renderUpgrades(){
  upgradeList.innerHTML='';
  upgrades.forEach(u=>{
    const cost = upgradeCost(u);
    const card=document.createElement('div');
    card.className='upgrade';

    const title=document.createElement('div');
    title.innerHTML=`<b>${u.name}</b>`;

    const costEl=document.createElement('div');
    costEl.textContent=`Cost: ${fmt(cost)}`;

    const lvlEl=document.createElement('div');
    lvlEl.textContent=`Level: ${u.level}`;

    const btn=document.createElement('button');
    btn.textContent = u.level>0?`Upgrade (${fmt(cost)})`:`Buy (${fmt(cost)})`;
    btn.disabled = coins < cost;

    btn.onclick=()=>{
      const currentCost = upgradeCost(u);
      if(coins >= currentCost){
        coins -= currentCost;
        u.level++;
        if(u.power) clickPower += u.power;
        if(u.auto) autoPower += u.auto;
        updateDisplay();
        renderUpgrades();
        showToast("Bought "+u.name);
        saveGame();
      }else{
        showToast("Not enough coins");
      }
    };

    card.append(title,costEl,lvlEl,btn);
    upgradeList.appendChild(card);
  });
}

// render auras
function renderAuras(){
  auraList.innerHTML='';
  auras.forEach(a=>{
    const card=document.createElement('div');
    card.className='aura';

    const title=document.createElement('div');
    title.innerHTML=`<b>${a.name}</b>`;

    const costEl=document.createElement('div');
    costEl.textContent=`Cost: ${fmt(a.cost)}`;

    const btn=document.createElement('button');
    btn.textContent = a.bought? 'Bought' : `Buy (${fmt(a.cost)})`;
    btn.disabled = a.bought || coins < a.cost;

    btn.onclick=()=>{
      if(!a.bought && coins >= a.cost){
        coins -= a.cost;
        multiplier *= a.multiplier;
        a.bought=true;
        updateDisplay();
        renderAuras();
        renderUpgrades();
        showToast("Bought "+a.name);
        saveGame();
      }else{
        showToast("Not enough coins");
      }
    };

    card.append(title,costEl,btn);
    auraList.appendChild(card);
  });
}

// click button
clickBtn.onclick=()=>{
  coins += clickPower*multiplier;
  updateDisplay();
  renderUpgrades();
  renderAuras();
};

// auto/sec
setInterval(()=>{
  coins += autoPower*multiplier;
  updateDisplay();
  renderUpgrades();
  renderAuras();
},1000);

// === SAVE / RESET ===
function saveGame(){
  const data = {
    coins, clickPower, autoPower, multiplier, glitchLevel,
    upgrades: upgrades.map(u=>u.level),
    auras: auras.map(a=>a.bought)
  };
  localStorage.setItem('naruto_save', JSON.stringify(data));
  showToast("Game Saved!");
}

function resetGame(){
  if(confirm("Are you sure you want to RESET?")){
    coins=0; clickPower=1; autoPower=0; multiplier=1; glitchLevel=0;
    upgrades.forEach(u=>u.level=0);
    auras.forEach(a=>a.bought=false);
    localStorage.removeItem('naruto_save');
    updateDisplay();
    renderUpgrades();
    renderAuras();
    showToast("Game Reset!");
  }
}

// buttons
saveBtn.onclick = saveGame;
resetBtn.onclick = resetGame;

// init
renderUpgrades();
renderAuras();
updateDisplay();

// auto-load saved game if exists
(function autoLoad(){
  const s = localStorage.getItem('naruto_save');
  if(!s) return;
  try {
    const data = JSON.parse(s);
    coins = data.coins || 0;
    clickPower = data.clickPower || 1;
    autoPower = data.autoPower || 0;
    multiplier = data.multiplier || 1;
    glitchLevel = data.glitchLevel || 0;
    if(data.upgrades) data.upgrades.forEach((lvl,i)=>{ if(upgrades[i]) upgrades[i].level=lvl; });
    if(data.auras) data.auras.forEach((bought,i)=>{ if(auras[i]) auras[i].bought=bought; });
    updateDisplay();
    renderUpgrades();
    renderAuras();
    showToast("Game Loaded!");
  } catch(e){}
})();
