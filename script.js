// Get the canvas element and its 2D rendering context
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

// Variables for drawing
var paths = [];
var garbagePaths = [];
var currentPath = [];
var drawingShape = 'draw'; // Default to normal drawing mode
var startX, startY, isDrawing = false;
var colorPicker = document.getElementById('colorPicker'); // Color picker input element
var thickness = document.getElementById('thickness'); // Thickness input element

// Set the drawing shape based on the selected radio button
function shape() {
    var radios = document.getElementsByName('shape');
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            drawingShape = radios[i].id;
            break;
        }
    }
}

// Return to normal painting mode
function normalPainting() {
    drawingShape = 'draw';
}

// Event listener to start drawing
canvas.addEventListener('pointerdown', function(e) {
    garbagePaths = [];
    startX = e.offsetX;
    startY = e.offsetY;
    isDrawing = true;
    var color = colorPicker.value;
    var lineWidth = thickness.value;
    currentPath = { x: startX, y: startY, width: 0, height: 0, color: color, lineWidth: lineWidth, shape: drawingShape };
    if (drawingShape === 'draw') {
        currentPath.points = [{ x: startX, y: startY }];
    }
    paths.push(currentPath);
});

// Event listener for drawing movement
canvas.addEventListener('pointermove', function(e) {
    if (!isDrawing) return;
    var currentX = e.offsetX;
    var currentY = e.offsetY;

    if (drawingShape === 'draw') {
        currentPath.points.push({ x: currentX, y: currentY });
    } else {
        currentPath.width = currentX - startX;
        currentPath.height = currentY - startY;
    }

    redraw();
});

// Event listener to stop drawing
canvas.addEventListener('pointerup', function() {
    if (isDrawing) {
        isDrawing = false;
    }
});

// Function to draw the selected shape
function drawShape(path) {
    ctx.beginPath();
    switch (path.shape) {
        case 'rectangle':
            ctx.rect(path.x, path.y, path.width, path.height);
            break;
        case 'circle':
            var radius = Math.sqrt(path.width * path.width + path.height * path.height);
            ctx.arc(path.x, path.y, radius, 0, 2 * Math.PI);
            break;
        case 'triangle':
            ctx.moveTo(path.x, path.y);
            ctx.lineTo(path.x + path.width, path.y);
            ctx.lineTo(path.x + (path.width / 2), path.y - path.height);
            ctx.closePath();
            break;
        case 'square':
            var side = Math.min(path.width, path.height);
            ctx.rect(path.x, path.y, side, side);
            break;
        case 'ellipse':
            ctx.ellipse(path.x, path.y, Math.abs(path.width), Math.abs(path.height / 2), 0, 0, 2 * Math.PI);
            break;
        case 'parallelogram':
            ctx.moveTo(path.x, path.y);
            ctx.lineTo(path.x + path.width * 0.75, path.y);
            ctx.lineTo(path.x + path.width, path.y + path.height);
            ctx.lineTo(path.x + path.width * 0.25, path.y + path.height);
            ctx.closePath();
            break;
        case 'rhombus':
            ctx.moveTo(path.x, path.y);
            ctx.lineTo(path.x + path.width / 2, path.y - path.height / 2);
            ctx.lineTo(path.x + path.width, path.y);
            ctx.lineTo(path.x + path.width / 2, path.y + path.height / 2);
            ctx.closePath();
            break;
        case 'star':
            for (var i = 0; i < 5; i++) {
                ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * path.width + path.x,
                           -Math.sin((18 + i * 72) / 180 * Math.PI) * path.height + path.y);
                ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * path.width / 2 + path.x,
                           -Math.sin((54 + i * 72) / 180 * Math.PI) * path.height / 2 + path.y);
            }
            ctx.closePath();
            break;
        case 'hexagon':
            for (var i = 0; i < 6; i++) {
                ctx.lineTo(Math.cos((30 + i * 60) / 180 * Math.PI) * path.width + path.x,
                           Math.sin((30 + i * 60) / 180 * Math.PI) * path.height + path.y);
            }
            ctx.closePath();
            break;
        case 'draw':
            ctx.moveTo(path.points[0].x, path.points[0].y);
            for (var j = 1; j < path.points.length; j++) {
                var midX = (path.points[j].x + path.points[j - 1].x) / 2;
                var midY = (path.points[j].y + path.points[j - 1].y) / 2;
                ctx.quadraticCurveTo(path.points[j - 1].x, path.points[j - 1].y, midX, midY);
            }
            ctx.lineTo(path.points[path.points.length - 1].x, path.points[path.points.length - 1].y);
            break;
    }

    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.lineWidth;
    ctx.stroke();
    if (path.shape !== 'draw') {
        ctx.fillStyle = path.color;
        ctx.fill();
    }
}

// Function to redraw all paths
function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < paths.length; i++) {
        drawShape(paths[i]);
    }
}

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paths = [];
}

// Undo the last drawing
function undo() {
    if (paths.length > 0) {
        var popped = paths.pop();
        garbagePaths.push(popped);
        redraw();
    }
}

// Redo the last undone drawing
function redo() {
    if (garbagePaths.length > 0) {
        paths.push(garbagePaths.pop());
        redraw();
    }
}

// Save the drawing as an image with a white background
function save() {
    // Create a temporary canvas to add white background
    var tempCanvas = document.createElement('canvas');
    var tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Fill the temporary canvas with white background
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the original canvas on top
    tempCtx.drawImage(canvas, 0, 0);

    // Convert to data URL and trigger download
    var dataURL = tempCanvas.toDataURL();
    var link = document.createElement('a');
    link.href = dataURL;
    link.download = `drawing.png`;
    link.click();
}

// Add event listener for returning to normal painting mode
document.getElementById('normal').addEventListener('click', normalPainting);
