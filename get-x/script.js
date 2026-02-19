// --- CONFIGURATION ET VARIABLES D'ÉTAT ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const multText = document.getElementById('multiplier');
const btnBet = document.getElementById('btn-bet');
const btnCashout = document.getElementById('btn-cashout');
const cashDisplay = document.getElementById('cash');
const betInput = document.getElementById('betAmount');

let balance = 1000;
let currentBet = 0;
let currentMult = 1.00;
let crashPoint = 0;
let isGaming = false;
let animationId = null;
let startTime = null;

// Ajustement de la taille du canvas au chargement
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- LOGIQUE DE DESSIN ---
function drawGame(elapsedTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const startX = 50;
    const startY = canvas.height - 50;
    const speed = 50; // Vitesse de progression horizontale
    
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00d2ff';

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    // Dessine la courbe parabolique
    for (let t = 0; t <= elapsedTime; t += 0.05) {
        let x = startX + t * speed;
        let y = startY - Math.pow(t, 2) * 5; // Courbe exponentielle
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Dessine le pointeur (la fusée/le point)
    let pointerX = startX + elapsedTime * speed;
    let pointerY = startY - Math.pow(elapsedTime, 2) * 5;
    
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pointerX, pointerY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

// --- BOUCLE DE JEU ---
function gameLoop() {
    if (!isGaming) return;

    let now = Date.now();
    let elapsedSeconds = (now - startTime) / 1000;

    // Calcul du multiplicateur : augmente plus vite avec le temps
    currentMult = Math.pow(1.08, elapsedSeconds * 2.5);
    multText.innerText = currentMult.toFixed(2) + "x";

    drawGame(elapsedSeconds);

    // Vérification du Crash
    if (currentMult >= crashPoint) {
        finishGame(true);
    } else {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// --- ACTIONS UTILISATEUR ---
btnBet.onclick = () => {
    const amount = parseFloat(betInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert("Veuillez entrer une mise valide.");
        return;
    }
    if (amount > balance) {
        alert("Solde insuffisant !");
        return;
    }

    // Initialisation du tour
    balance -= amount;
    currentBet = amount;
    cashDisplay.innerText = balance.toFixed(2);
    
    // Génération du crash point (Logique simplifiée : min 1.01x)
    // Plus le nombre est élevé, plus c'est rare
    crashPoint = generateCrashPoint();
    
    isGaming = true;
    startTime = Date.now();
    
    // UI Update
    btnBet.disabled = true;
    btnCashout.disabled = false;
    betInput.disabled = true;
    multText.style.color = "#00d2ff";
    
    gameLoop();
};

btnCashout.onclick = () => {
    if (!isGaming) return;
    
    let win = currentBet * currentMult;
    balance += win;
    cashDisplay.innerText = balance.toFixed(2);
    
    finishGame(false);
};

// --- FIN DU TOUR ---
function finishGame(hasCrashed) {
    isGaming = false;
    cancelAnimationFrame(animationId);
    
    btnBet.disabled = false;
    btnCashout.disabled = true;
    betInput.disabled = false;

    if (hasCrashed) {
        multText.innerText = "CRASH !";
        multText.style.color = "#ff4b2b";
        // Effet de secousse sur l'écran (optionnel)
    } else {
        multText.innerText = "GAGNÉ: " + currentMult.toFixed(2) + "x";
        multText.style.color = "#2ecc71";
    }
}

// Algorithme de crash "équitable" simplifié
function generateCrashPoint() {
    let rand = Math.random();
    // 3% de chance de crash instantané à 1.00x
    if (rand < 0.03) return 1.00;
    // Formule pour simuler une distribution de probabilité
    return (0.99 / (1 - rand));
}
