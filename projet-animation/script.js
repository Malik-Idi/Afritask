// Création de la scène Konva
var stage = new Konva.Stage({
  container: 'canvas-container',
  width: 800,
  height: 450,
});

var layer = new Konva.Layer();
stage.add(layer);

// Fonction pour ajouter un élément
function addShape(type) {
  let shape;
  if (type === 'rect') {
    shape = new Konva.Rect({ x: 50, y: 50, width: 100, height: 150, fill: 'blue', draggable: true });
  } else {
    shape = new Konva.Circle({ x: 100, y: 100, radius: 50, fill: 'orange', draggable: true });
  }
  layer.add(shape);
  layer.draw();
}

// Exemple d'animation simple
function startDance() {
  const shapes = layer.getChildren();
  shapes.forEach(shape => {
    new Konva.Tween({
      node: shape,
      duration: 1,
      y: shape.y() - 20,
      yoyo: true, // Fait l'aller-retour
      repeat: 5
    }).play();
  });
}
