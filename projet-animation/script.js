// --- CONFIGURATION ---
const STAGE_WIDTH = 1280;
const STAGE_HEIGHT = 720;

const stage = new Konva.Stage({
    container: 'canvas-container',
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    scaleX: 0.6, // Zoom arrière pour voir toute la zone sur petit écran
    scaleY: 0.6
});

const layerBG = new Konva.Layer(); // Couche pour les décors
const layerMain = new Konva.Layer(); // Couche pour les personnages/objets
stage.add(layerBG, layerMain);

let selectedNode = null;

// --- DONNÉES DE LA MAQUETTE ---
const data = {
    characters: [
        { name: "Héros", img: "https://placehold.co" },
        { name: "Amie", img: "https://placehold.co" },
        { name: "Robot", img: "https://placehold.co" },
        { name: "Méchant", img: "https://placehold.co" }
    ],
    backgrounds: Array.from({length: 15}, (_, i) => ({
        id: i, url: `https://placehold.co{i+1}`
    })),
    animations: ["Marcher", "Courir", "Sauter", "Danser", "Saluer", "Tourner", "Flotter", "Zoomer", "Secouer", "Cligner"]
};

// --- LOGIQUE D'INTERFACE ---
function showTab(tab) {
    const container = document.getElementById('panel-container');
    container.innerHTML = "";

    if(tab === 'chars') {
        data.characters.forEach(c => {
            const el = document.createElement('div');
            el.className = "bg-slate-700 p-2 rounded mb-2 cursor-pointer hover:bg-blue-600 transition text-center";
            el.innerHTML = `<img src="${c.img}" class="h-20 mx-auto mb-2"><p class="text-xs">${c.name}</p>`;
            el.onclick = () => addImage(c.img, 'character');
            container.appendChild(el);
        });
    } else if(tab === 'bg') {
        const grid = document.createElement('div');
        grid.className = "grid grid-cols-2 gap-2";
        data.backgrounds.forEach(bg => {
            grid.innerHTML += `<img src="${bg.url}" onclick="setBG('${bg.url}')" class="rounded cursor-pointer hover:ring-2 ring-blue-500">`;
        });
        container.appendChild(grid);
    } else if(tab === 'anim') {
        data.animations.forEach(a => {
            const btn = document.createElement('button');
            btn.className = "w-full bg-slate-700 p-3 rounded mb-2 text-sm hover:bg-purple-600 transition";
            btn.innerText = a;
            btn.onclick = () => applyAnim(a);
            container.appendChild(btn);
        });
    }
}

// --- FONCTIONS CORE ---
function setBG(url) {
    layerBG.destroyChildren();
    Konva.Image.fromURL(url, (img) => {
        img.setAttrs({ width: STAGE_WIDTH, height: STAGE_HEIGHT });
        layerBG.add(img);
        layerBG.batchDraw();
    });
}

function addImage(url, type) {
    Konva.Image.fromURL(url, (img) => {
        img.setAttrs({
            x: 100, y: 100,
            width: type === 'character' ? 150 : 100,
            height: type === 'character' ? 220 : 100,
            draggable: true,
            name: 'object'
        });
        
        img.on('click', () => {
            selectedNode = img;
            highlightObject(img);
        });

        layerMain.add(img);
        layerMain.batchDraw();
    });
}

function applyAnim(type) {
    if(!selectedNode) return alert("Sélectionne un personnage d'abord !");
    
    let tweenData = { node: selectedNode, duration: 1, yoyo: true, repeat: 1 };

    switch(type) {
        case "Marcher": tweenData.x = selectedNode.x() + 100; break;
        case "Sauter": tweenData.y = selectedNode.y() - 50; break;
        case "Danser": tweenData.rotation = 20; break;
        case "Secouer": tweenData.x = selectedNode.x() + 10; break;
        // Ajoute les autres logiques ici
    }
    
    new Konva.Tween(tweenData).play();
}

// Initialisation
showTab('chars');
setBG(data.backgrounds[0].url);
