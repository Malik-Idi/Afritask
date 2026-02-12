// --- SÉCURITÉ : VÉRIFICATION SESSION ---
if (sessionStorage.getItem('admin_logged_in') !== 'true') {
    window.location.href = 'auth.html';
}

document.addEventListener('DOMContentLoaded', () => {
    rafraichirAdmin();
    // Synchronisation automatique toutes les 3 secondes
    setInterval(rafraichirAdmin, 3000);
});

// --- NAVIGATION PAR ONGLETS ---
function changerOnglet(nom) {
    // Masquer toutes les sections
    document.querySelectorAll('.section-content').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.onglet-btn').forEach(b => b.classList.remove('active'));

    // Afficher la section choisie
    document.getElementById(`section-${nom}`).classList.remove('hidden');
    document.getElementById(`btn-${nom}`).classList.add('active');

    // Changer le titre
    const titres = {
        'attente': 'Missions en attente d\'autorisation',
        'cours': 'Missions en cours de traitement',
        'terminee': 'Archives des missions terminées',
        'notifs': 'Journal d\'activité global'
    };
    document.getElementById('titre-page').innerText = titres[nom];
}

// --- LOGIQUE PRINCIPALE ---
function rafraichirAdmin() {
    const missionsPending = JSON.parse(localStorage.getItem('missions_pending') || "[]");
    const missionsPubliques = JSON.parse(localStorage.getItem('missions_publiques') || "[]");
    const mesMissionsEmp = JSON.parse(localStorage.getItem('mes_missions_employeur') || "[]");
    const adminBalance = localStorage.getItem('admin_balance') || 0;

    document.getElementById('adminBalance').innerText = `${adminBalance} F CFA`;

    // 1. RENDU : EN ATTENTE
    const listAttente = document.getElementById('list-attente');
    if (missionsPending.length === 0) {
        listAttente.innerHTML = `<p class="p-10 text-center border-2 border-dashed border-slate-700 rounded-3xl italic text-slate-500">Aucune nouvelle demande de publication.</p>`;
    } else {
        listAttente.innerHTML = missionsPending.map((m, i) => {
            const emp = JSON.parse(localStorage.getItem('employeur_user')) || {prenom: 'Inconnu', nom: ''};
            return `
                <div class="mission-card flex justify-between items-center animate-fade">
                    <div>
                        <p class="text-indigo-400 font-bold text-sm uppercase mb-1 italic">Nouveau message</p>
                        <h3 class="text-xl font-black text-white">${emp.prenom} ${emp.nom} a une mission sur "${m.nom}"</h3>
                        <p class="text-slate-400 mt-1">Cible : <span class="text-blue-400 underline">${m.url}</span></p>
                        <div class="flex gap-4 mt-3">
                            <span class="badge badge-attente italic">${m.testeurs} Testeurs requis</span>
                            <span class="badge bg-slate-700 text-slate-300 italic">Budget: ${m.budget} F</span>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="refuserMission(${i})" class="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><i class="fas fa-times"></i> Refuser</button>
                        <button onclick="accepterMission(${i})" class="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all font-bold italic">ACCEPTER & PUBLIER</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 2. RENDU : EN COURS
    const listCours = document.getElementById('list-cours');
    const enCours = mesMissionsEmp.filter(m => m.statut === 'publiee');
    listCours.innerHTML = enCours.map(m => `
        <div class="mission-card border-l-4 border-l-blue-500">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-bold">${m.nom} <span class="text-xs text-slate-500 ml-2 italic">(${m.url})</span></h3>
                <span class="badge badge-cours">En cours : ${m.testeursRestants} / ${m.testeursInitiaux} places</span>
            </div>
        </div>
    `).join('') || `<p class="italic text-slate-600">Aucune mission sur le marché actuellement.</p>`;

    // 3. RENDU : TERMINÉES
    const listTerminee = document.getElementById('list-terminee');
    const terminees = mesMissionsEmp.filter(m => m.statut === 'terminee');
    listTerminee.innerHTML = terminees.map(m => `
        <div class="mission-card opacity-60 border-l-4 border-l-emerald-500">
            <div class="flex justify-between items-center text-slate-400">
                <h3 class="font-bold underline italic">${m.nom}</h3>
                <span class="badge badge-fini">Succès - 100% complété</span>
            </div>
        </div>
    `).join('') || `<p class="italic text-slate-600">L'historique est vide.</p>`;

    // 4. RENDU : NOTIFICATIONS (Journal)
    const listNotifs = document.getElementById('list-notifs');
    const logs = JSON.parse(localStorage.getItem('admin_logs') || "[]");
    listNotifs.innerHTML = logs.reverse().slice(0, 10).map(log => `
        <div class="log-entry">
            <p class="text-sm text-slate-300 font-medium italic">${log.msg}</p>
            <small class="text-[10px] text-slate-500 uppercase font-bold">${log.date}</small>
        </div>
    `).join('') || `<p class="italic text-slate-600">Aucune activité enregistrée.</p>`;
}

// --- ACTIONS ADMIN ---

function accepterMission(index) {
    let pending = JSON.parse(localStorage.getItem('missions_pending') || "[]");
    let m = pending[index];

    // 1. Créditer Malik Idi (25%)
    let currentBal = parseInt(localStorage.getItem('admin_balance') || 0);
    localStorage.setItem('admin_balance', currentBal + Math.floor(m.fraisAdmin));

    // 2. Publier pour les testeurs (Ajouter l'ID unique)
    let publiques = JSON.parse(localStorage.getItem('missions_publiques') || "[]");
    m.id = Date.now(); // On s'assure d'un ID unique
    m.testeurs = m.testeursInitiaux; // Réinitialiser le compteur pour les testeurs
    publiques.push(m);
    localStorage.setItem('missions_publiques', JSON.stringify(publiques));

    // 3. Mettre à jour le statut chez l'employeur
    let mesMissionsEmp = JSON.parse(localStorage.getItem('mes_missions_employeur') || "[]");
    let idxEmp = mesMissionsEmp.findIndex(me => me.nom === m.nom);
    if (idxEmp !== -1) mesMissionsEmp[idxEmp].statut = 'publiee';
    localStorage.setItem('mes_missions_employeur', JSON.stringify(mesMissionsEmp));

    // 4. Archiver le log
    ajouterLog(`Validation de la mission "${m.nom}" - Gain : +${Math.floor(m.fraisAdmin)} F CFA`);

    // 5. Nettoyer la file d'attente
    pending.splice(index, 1);
    localStorage.setItem('missions_pending', JSON.stringify(pending));

    alert("⚡ Mission publiée avec succès ! Vos 25% ont été crédités.");
    rafraichirAdmin();
}

function refuserMission(index) {
    if(confirm("Êtes-vous sûr de vouloir REFUSER cette mission ? L'employeur ne sera pas remboursé dans ce simulateur.")) {
        let pending = JSON.parse(localStorage.getItem('missions_pending') || "[]");
        let m = pending[index];
        
        ajouterLog(`Mission REFUSÉE : ${m.nom}`);
        pending.splice(index, 1);
        localStorage.setItem('missions_pending', JSON.stringify(pending));
        rafraichirAdmin();
    }
}

function ajouterLog(msg) {
    let logs = JSON.parse(localStorage.getItem('admin_logs') || "[]");
    logs.push({ msg: msg, date: new Date().toLocaleString() });
    localStorage.setItem('admin_logs', JSON.stringify(logs));
}

function deconnexion() {
    sessionStorage.removeItem('admin_logged_in');
    sessionStorage.removeItem('admin_session_start');
    window.location.href = '../index.html';
}
