// --- CONFIGURATION ET ETAT ---
let activeMissionId = null;
let missionTimer = null;
const TEMPS_LIMITE = 10; // 10 minutes pour faire le test

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    afficherSolde();
    chargerMissions();
    
    // Ecouter les changements de stockage (si l'admin valide une mission ailleurs)
    window.addEventListener('storage', () => {
        afficherSolde();
        chargerMissions();
    });
});

// --- FONCTIONS DE RENDU ---

function afficherSolde() {
    const solde = localStorage.getItem('worker_balance') || 0;
    document.getElementById('userBalance').innerText = `${solde} F CFA`;
}

function chargerMissions() {
    const feed = document.getElementById('missionsFeed');
    const missions = JSON.parse(localStorage.getItem('missions_publiques') || "[]");
    const missionsFinies = JSON.parse(localStorage.getItem('missions_terminees_user') || "[]");

    if (missions.length === 0) {
        feed.innerHTML = '<div class="feed-card text-center">Aucune mission disponible.</div>';
        return;
    }

    feed.innerHTML = missions.map((m, index) => {
        const estDejaFaite = missionsFinies.includes(m.id);
        const placesRestantes = m.testeurs || 0;
        
        // Simulation de testeurs ayant fini (Preuve sociale)
        const nomsSimules = ["Jean Claude", "Mariam K.", "Ousmane"];
        const historiqueFini = nomsSimules.slice(0, Math.min(3, 10 - placesRestantes));

        return `
            <div class="feed-card">
                <div class="card-header">
                    <div class="employer-info">
                        <img src="https://ui-avatars.com" style="width:40px; border-radius:50%">
                        <div>
                            <span style="font-weight:bold; display:block">Administrateur Afritask</span>
                            <small style="color:gray italic">Sponsorisé</small>
                        </div>
                    </div>
                    <span class="places-badge font-bold">Places : ${placesRestantes}</span>
                </div>
                
                <div class="card-content">
                    <h3>${m.nom}</h3>
                    <p>Visitez le site <a href="${m.url}" target="_blank" class="text-blue-600">${m.url}</a> et donnez votre avis honnête.</p>
                </div>

                <div class="card-actions">
                    <button class="action-btn" onclick="toggleLike(this)">
                        <i class="far fa-thumbs-up"></i> J'aime
                    </button>
                    <button class="action-btn">
                        <i class="far fa-comment"></i> ${historiqueFini.length} Témoignages
                    </button>
                </div>

                ${estDejaFaite ? 
                    `<button class="btn-accomplir" style="background:#ccc" disabled>Déjà effectuée</button>` :
                    `<button class="btn-accomplir" onclick="reserverMission(${index})">Accomplir la tâche</button>`
                }

                <div class="completed-list">
                    ${historiqueFini.map(nom => `
                        <div class="completion-item">
                            <i class="fas fa-check-circle text-green-500"></i> ${nom} a terminé cette mission.
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// --- LOGIQUE DES MISSIONS ---

function toggleLike(btn) {
    btn.classList.toggle('like-active');
    const icon = btn.querySelector('i');
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
}

function reserverMission(index) {
    if (activeMissionId) {
        alert("Vous avez déjà une tâche en cours ! Terminez-la ou attendez la fin du chrono.");
        return;
    }

    let missions = JSON.parse(localStorage.getItem('missions_publiques') || "[]");
    let m = missions[index];

    if (m.testeurs <= 0) {
        alert("Désolé, plus de places disponibles !");
        return;
    }

    // Début de la réservation
    activeMissionId = m.id;
    m.testeurs--;
    localStorage.setItem('missions_publiques', JSON.stringify(missions));
    
    // Lancer le Timer
    demarrerChrono(index);
    alert("Mission réservée ! Vous avez 10 minutes pour remplir le questionnaire.");
    
    // Ouvrir le questionnaire (simulé après 2 secondes pour laisser le temps de voir le site)
    setTimeout(() => {
        document.getElementById('modalQuestionnaire').classList.remove('hidden');
    }, 2000);
}

function demarrerChrono(missionIndex) {
    let tempsRestant = TEMPS_LIMITE * 60;
    const display = document.getElementById('activeTaskTimer');

    missionTimer = setInterval(() => {
        let min = Math.floor(tempsRestant / 60);
        let sec = tempsRestant % 60;
        display.innerHTML = `Temps restant : <span style="color:red">${min}:${sec < 10 ? '0'+sec : sec}</span>`;
        
        if (tempsRestant <= 0) {
            annulerMissionAutomatique(missionIndex);
        }
        tempsRestant--;
    }, 1000);
}

function annulerMissionAutomatique(index) {
    clearInterval(missionTimer);
    activeMissionId = null;
    document.getElementById('activeTaskTimer').innerText = "Temps expiré !";
    
    // Rendre la place
    let missions = JSON.parse(localStorage.getItem('missions_publiques') || "[]");
    missions[index].testeurs++;
    localStorage.setItem('missions_publiques', JSON.stringify(missions));
    
    document.getElementById('modalQuestionnaire').classList.add('hidden');
    chargerMissions();
    alert("Temps écoulé ! La place a été remise en jeu.");
}

// --- VALIDATION DU QUESTIONNAIRE ---

document.getElementById('taskForm').onsubmit = function(e) {
    e.preventDefault();
    
    // 1. Créditer le solde
    let solde = parseInt(localStorage.getItem('worker_balance') || 0);
    localStorage.setItem('worker_balance', solde + 300);

    // 2. Marquer comme finie pour cet utilisateur (pour ne pas répéter)
    let finies = JSON.parse(localStorage.getItem('missions_terminees_user') || "[]");
    finies.push(activeMissionId);
    localStorage.setItem('missions_terminees_user', JSON.stringify(finies));

    // 3. Nettoyer
    clearInterval(missionTimer);
    activeMissionId = null;
    document.getElementById('activeTaskTimer').innerText = "Mission validée ! +300F";
    document.getElementById('modalQuestionnaire').classList.add('hidden');
    
    alert("Félicitations ! 300 F CFA ont été ajoutés à votre solde.");
    chargerMissions();
    afficherSolde();
};

// Fermeture du modal
document.getElementById('closeModal').onclick = () => {
    document.getElementById('modalQuestionnaire').classList.add('hidden');
};
