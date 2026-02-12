// --- CONFIGURATION ---
const TAUX_COMMISSION = 0.25; // 25%
const GAIN_TESTEUR = 300;     // 300 F par test

document.addEventListener('DOMContentLoaded', () => {
    initialiserDashboard();
    // Vérifier les mises à jour toutes les 2 secondes (simule le temps réel)
    setInterval(synchroniserDonnees, 2000);
});

// --- SESSION ET INITIALISATION ---
function initialiserDashboard() {
    const user = JSON.parse(localStorage.getItem('employeur_user'));
    if (!user) {
        window.location.href = 'auth.html';
        return;
    }
    document.getElementById('userName').innerText = `${user.prenom} ${user.nom}`;
    calculerTesteurs();
    rafraichirInterface();
}

// --- CALCULATEUR DE BUDGET ---
function calculerTesteurs() {
    const budgetTotal = parseFloat(document.getElementById('budgetInput').value) || 0;
    // Formule : Budget / 1.25 (pour enlever les 25%) / 300
    const partTesteurs = budgetTotal / (1 + TAUX_COMMISSION);
    const nombreTesteurs = Math.floor(partTesteurs / GAIN_TESTEUR);
    
    document.getElementById('nbTesteursResult').innerText = nombreTesteurs > 0 ? nombreTesteurs : 0;
}

// --- PUBLICATION DE MISSION ---
function lancerMission() {
    const nom = document.getElementById('siteNom').value;
    const url = document.getElementById('siteUrl').value;
    const budget = parseFloat(document.getElementById('budgetInput').value);
    const testeurs = parseInt(document.getElementById('nbTesteursResult').innerText);

    if (!nom || !url || testeurs <= 0) {
        alert("❌ Erreur : Veuillez remplir tous les champs.");
        return;
    }

    const mission = {
        id: Date.now(),
        nom: nom,
        url: url,
        budget: budget,
        testeursInitiaux: testeurs,
        testeursRestants: testeurs,
        statut: 'en_attente', // L'Admin doit valider
        date: new Date().toLocaleDateString(),
        fraisAdmin: budget - (budget / (1 + TAUX_COMMISSION))
    };

    // 1. Envoyer à l'Admin
    let pending = JSON.parse(localStorage.getItem('missions_pending') || "[]");
    pending.push(mission);
    localStorage.setItem('missions_pending', JSON.stringify(pending));

    // 2. Enregistrer dans l'historique Employeur
    let mesMissions = JSON.parse(localStorage.getItem('mes_missions_employeur') || "[]");
    mesMissions.push(mission);
    localStorage.setItem('mes_missions_employeur', JSON.stringify(mesMissions));

    alert("✅ Mission envoyée ! Elle apparaîtra après validation de l'admin.");
    window.location.reload();
}

// --- SYNCHRONISATION TEMPS RÉEL ---
function synchroniserDonnees() {
    let mesMissions = JSON.parse(localStorage.getItem('mes_missions_employeur') || "[]");
    let missionsPubliques = JSON.parse(localStorage.getItem('missions_publiques') || "[]");
    let notifs = JSON.parse(localStorage.getItem('notifs_employeur') || "[]");
    let aChange = false;

    mesMissions.forEach(m => {
        // Trouver la version publique de la mission
        const mPublique = missionsPubliques.find(p => p.id === m.id);

        if (m.statut === 'publiee') {
            if (!mPublique || mPublique.testeurs <= 0) {
                // CAMPAGNE TERMINÉE
                m.statut = 'terminee';
                m.testeursRestants = 0;
                notifs.push({
                    id: Date.now(),
                    titre: "🎊 Campagne Terminée",
                    message: `L'objectif de ${m.testeursInitiaux} testeurs pour "${m.nom}" est atteint.`,
                    heure: new Date().toLocaleTimeString(),
                    type: 'succes',
                    avis: "Tous les rapports sont disponibles."
                });
                aChange = true;
            } else if (mPublique.testeurs !== m.testeursRestants) {
                // MISE À JOUR DU NOMBRE DE PLACES
                m.testeursRestants = mPublique.testeurs;
                aChange = true;
            }
        }
    });

    if (aChange) {
        localStorage.setItem('mes_missions_employeur', JSON.stringify(mesMissions));
        localStorage.setItem('notifs_employeur', JSON.stringify(notifs));
        rafraichirInterface();
    }
}

// --- RENDU DE L'INTERFACE ---
function rafraichirInterface() {
    // 1. Liste des missions
    const list = document.getElementById('mesMissionsList');
    const missions = JSON.parse(localStorage.getItem('mes_missions_employeur') || "[]");
    document.getElementById('countMissions').innerText = missions.length;

    if (missions.length > 0) {
        list.innerHTML = missions.map(m => {
            let color = m.statut === 'en_attente' ? 'orange' : (m.statut === 'terminee' ? 'emerald' : 'blue');
            let percent = ((m.testeursInitiaux - m.testeursRestants) / m.testeursInitiaux) * 100;
            
            return `
                <div class="campaign-card bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                    <div class="flex justify-between items-start mb-3">
                        <h4 class="font-bold text-slate-800">${m.nom}</h4>
                        <span class="text-[9px] font-black px-2 py-1 rounded-lg bg-${color}-100 text-${color}-600 uppercase tracking-tighter italic">
                            ${m.statut}
                        </span>
                    </div>
                    <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                        <div class="progress-bar-fill bg-indigo-600 h-full" style="width: ${percent}%"></div>
                    </div>
                    <div class="flex justify-between text-[10px] font-bold text-slate-400 uppercase italic">
                        <span>Progression</span>
                        <span>${m.testeursInitiaux - m.testeursRestants} / ${m.testeursInitiaux}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 2. Notifications
    const notifList = document.getElementById('notifList');
    const notifBadge = document.getElementById('notifBadge');
    const notifications = JSON.parse(localStorage.getItem('notifs_employeur') || "[]");

    if (notifications.length > 0) {
        notifBadge.innerText = notifications.length;
        notifBadge.classList.remove('hidden');
        notifList.innerHTML = notifications.reverse().map((n, i) => `
            <div class="notif-item p-4 border-b cursor-pointer" onclick="voirRapport(${i})">
                <p class="text-sm font-bold text-slate-800">${n.titre}</p>
                <p class="text-xs text-slate-500 line-clamp-1">${n.message}</p>
                <span class="text-[10px] text-indigo-500 font-bold italic">${n.heure}</span>
            </div>
        `).join('');
    }
}

// --- MODALE DES RAPPORTS ---
function voirRapport(idx) {
    const notifs = JSON.parse(localStorage.getItem('notifs_employeur') || "[]").reverse();
    const n = notifs[idx];
    const content = document.getElementById('rapportContent');

    content.innerHTML = `
        <div class="text-center mb-8">
            <div class="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                <i class="fas fa-file-invoice"></i>
            </div>
            <h3 class="text-2xl font-black text-slate-800 italic">Détails du Feedback</h3>
            <p class="text-slate-400 text-sm italic">Reçu à ${n.heure}</p>
        </div>
        <div class="rapport-bubble text-slate-600 leading-relaxed mb-6">
            ${n.avis || "Le testeur a trouvé l'interface claire mais suggère d'agrandir les polices de caractères sur mobile."}
        </div>
        <button onclick="fermerRapport()" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold italic uppercase tracking-widest text-sm">Fermer le rapport</button>
    `;
    document.getElementById('modalRapport').classList.remove('hidden');
}

function fermerRapport() {
    document.getElementById('modalRapport').classList.add('hidden');
}

function effacerNotifs() {
    localStorage.setItem('notifs_employeur', "[]");
    rafraichirInterface();
    document.getElementById('notifBadge').classList.add('hidden');
}
