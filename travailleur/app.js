// --- CONFIGURATION ET ETAT ---
let activeMissionId = null;
let missionTimer = null;
const TEMPS_LIMITE = 10; // Minutes

// Liste de noms pour la simulation de "Preuve Sociale"
const NOMS_BOTS = ["Moussa S.", "Alice B.", "Koffi 225", "Fatou D.", "Jean-Marc", "Sarah L.", "Bamba", "Idriss", "Christian T.", "Aminata"];

document.addEventListener('DOMContentLoaded', () => {
    afficherSolde();
    chargerMissions();
    
    // LANCER LE MOTEUR DE SIMULATION (Likes et places)
    setInterval(simulerActiviteMondiale, 1000); 

    window.addEventListener('storage', () => {
        afficherSolde();
        chargerMissions();
    });
});

// --- FORMATAGE STYLE FACEBOOK (1K, 2.5K...) ---
function formaterNombre(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num;
}

// --- FONCTION DE RENDU PRINCIPALE ---
function chargerMissions() {
    const feed = document.getElementById('missionsFeed');
    const missions = JSON.parse(localStorage.getItem('missions_publiques') || "[]");
    const missionsFinies = JSON.parse(localStorage.getItem('missions_terminees_user') || "[]");
    const mesLikes = JSON.parse(localStorage.getItem('mes_likes') || "[]");

    if (missions.length === 0) {
        feed.innerHTML = '<div class="feed-card" style="text-align:center; padding:40px; color:#65676b;">Aucune mission disponible pour le moment...</div>';
        return;
    }

    feed.innerHTML = missions.map((m, index) => {
        const estDejaFaite = missionsFinies.includes(m.id);
        const dejaLike = mesLikes.includes(m.id);
        
        // Initialiser les likes fictifs s'ils n'existent pas
        if (!m.fakeLikes) m.fakeLikes = Math.floor(Math.random() * 800) + 100;

        return `
            <div class="feed-card" id="card-${m.id}">
                <div class="card-header">
                    <div class="employer-info">
                        <img src="https://ui-avatars.com" style="width:40px; border-radius:50%">
                        <div>
                            <span style="font-weight:bold; display:block">Administrateur Afritask</span>
                            <small style="color:gray">Sponsorisé • <i class="fas fa-globe-africa"></i></small>
                        </div>
                    </div>
                    <span class="places-badge" id="place-text-${m.id}">Places : ${m.testeurs}</span>
                </div>
                
                <div class="card-content">
                    <h3 style="font-size:18px; font-weight:bold; margin-bottom:10px;">${m.nom}</h3>
                    <p style="color:#1c1e21; margin-bottom:15px;">Tester l'ergonomie et la rapidité du site. <br>
                    <a href="${m.url}" target="_blank" style="color:#1877f2; text-decoration:underline;">${m.url}</a></p>
                </div>

                <div class="likes-count-display" style="padding:10px 0; font-size:13px; color:#65676b; border-bottom:1px solid #eee; display:flex; align-items:center; gap:5px;">
                    <span style="background:#1877f2; color:white; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; font-size:10px;">
                        <i class="fas fa-thumbs-up"></i>
                    </span>
                    <span id="count-like-${m.id}">${formaterNombre(m.fakeLikes)}</span> personnes aiment ça
                </div>

                <div class="card-actions" style="border-top:none;">
                    <button class="action-btn ${dejaLike ? 'like-active' : ''}" onclick="gererLike('${m.id}')" id="btn-like-${m.id}">
                        <i class="${dejaLike ? 'fas' : 'far'} fa-thumbs-up"></i> J'aime
                    </button>
                    <button class="action-btn"><i class="far fa-comment"></i> Partager</button>
                </div>

                ${estDejaFaite ? 
                    `<button class="btn-accomplir" style="background:#ccd0d5; color:#4b4f56; cursor:not-allowed" disabled>Mission accomplie</button>` :
                    `<button class="btn-accomplir" onclick="reserverMission(${index})">Accomplir la tâche</button>`
                }

                <div class="completed-list" id="logs-${m.id}" style="margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
                    ${m.logsBots ? m.logsBots.map(log => `
                        <div class="completion-item" style="font-size:12px; color:#65676b; margin-bottom:4px;">
                            <i class="fas fa-check-circle text-green-500"></i> ${log}
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `;
    }).join('');
}

// --- MOTEUR DE SIMULATION (Likes et Places) ---
function simulerActiviteMondiale() {
    let missions = JSON.parse(localStorage.getItem('missions_publiques') || "[]");
    let modifie = false;

    missions.forEach((m) => {
        // 1. Simuler +10 likes par seconde (aléatoire)
        if (!m.fakeLikes) m.fakeLikes = 100;
        m.fakeLikes += Math.floor(Math.random() * 5); 

        // 2. Simuler perte d'une place toutes les 2 minutes (120 sec)
        if (!m.cyclePlace) m.cyclePlace = 0;
        m.cyclePlace++;

        if (m.cyclePlace >= 120 && m.testeurs > 0) {
            m.testeurs--;
            m.cyclePlace = 0;
            // Ajouter le log du bot
            if (!m.logsBots) m.logsBots = [];
            const nomRandom = NOMS_BOTS[Math.floor(Math.random() * NOMS_BOTS.length)];
            m.logsBots.unshift(`${nomRandom} a terminé cette mission.`);
            if (m.logsBots.length > 3) m.logsBots.pop();
            modifie = true;
        }
    });

    localStorage.setItem('missions_publiques', JSON.stringify(missions));
    actualiserVisuel();
}

function actualiserVisuel() {
    const missions = JSON.parse(localStorage.getItem('missions_publiques') || "[]");
    missions.forEach(m => {
        const likeSpan = document.getElementById(`count-like-${m.id}`);
        const placeSpan = document.getElementById(`place-text-${m.id}`);
        if (likeSpan) likeSpan.innerText = formaterNombre(m.fakeLikes);
        if (placeSpan) placeSpan.innerText = `Places : ${m.testeurs}`;
    });
}

// --- LOGIQUE DES LIKES ---
function gererLike(missionId) {
    let mesLikes = JSON.parse(localStorage.getItem('mes_likes') || "[]");
    const btn = document.getElementById(`btn-like-${missionId}`);
    
    if (!mesLikes.includes(missionId)) {
        mesLikes.push(missionId);
        btn.classList.add('like-active');
        btn.querySelector('i').classList.replace('far', 'fas');
    } else {
        mesLikes = mesLikes.filter(id => id !== missionId);
        btn.classList.remove('like-active');
        btn.querySelector('i').classList.replace('fas', 'far');
    }
    localStorage.setItem('mes_likes', JSON.stringify(mesLikes));
}

// --- LOGIQUE ACCOMPLIR TACHE ---
function reserverMission(index) {
    if (activeMissionId) {
        alert("Terminez d'abord votre tâche en cours !");
        return;
    }
    let missions = JSON.parse(localStorage.getItem('missions_publiques') || "[]");
    let m = missions[index];
    
    if (m.testeurs <= 0) return;

    activeMissionId = m.id;
    m.testeurs--;
    localStorage.setItem('missions_publiques', JSON.stringify(missions));
    
    document.getElementById('activeTaskTimer').innerText = "Tâche en cours...";
    document.getElementById('modalQuestionnaire').classList.remove('hidden');
}

document.getElementById('taskForm').onsubmit = function(e) {
    e.preventDefault();
    let solde = parseInt(localStorage.getItem('worker_balance') || 0);
    localStorage.setItem('worker_balance', solde + 300);

    let finies = JSON.parse(localStorage.getItem('missions_terminees_user') || "[]");
    finies.push(activeMissionId);
    localStorage.setItem('missions_terminees_user', JSON.stringify(finies));

    activeMissionId = null;
    document.getElementById('modalQuestionnaire').classList.add('hidden');
    document.getElementById('activeTaskTimer').innerText = "Aucune tâche active";
    
    alert("300 F CFA ajoutés à votre compte !");
    chargerMissions();
    afficherSolde();
};

function afficherSolde() {
    const solde = localStorage.getItem('worker_balance') || 0;
    document.getElementById('userBalance').innerText = `${solde} F CFA`;
}

document.getElementById('closeModal').onclick = () => {
    document.getElementById('modalQuestionnaire').classList.add('hidden');
};
