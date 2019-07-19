//Canvası seçtik
const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

//Satır ve Sıralama ayaları

const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;

const VACANT = "WHITE" //Boş tahta rengi

//Kare Çizimi

function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

    ctx.strokeStyle = "BLACK";
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

//Tahtayı oluştur

let board = [];

for (r = 0; r < ROW; r++) {
    board[r] = [];
    for (c = 0; c < COL; c++) {
        board[r][c] = VACANT;
    }
}

//Tahtayı Çiz 

function drawBoard() {
    for (r = 0; r < ROW; r++) {
        for (c = 0; c < COL; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
}


drawBoard();

//Tetrominoların renkleri

const PIECES = [
    [Z, "red"],
    [S, "green"],
    [T, "yellow"],
    [O, "blue"],
    [L, "purple"],
    [I, "cyan"],
    [J, "orange"],
];

//Rastgele Tetromino üretimi 

function RandomPiece() {
    let r = randomN = Math.floor(Math.random() * PIECES.length);
    return new Piece(PIECES[r][0], PIECES[r][1]);
}

//Yeni bir parça örnekleme

let p = RandomPiece(); 

//Parçaların oluşturulması

function Piece(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0; //Nerden başlayaca
    this.activeTetromino = this.tetromino[this.tetrominoN];

    //Parçaların kontrol edilmesi
    this.x = 3;
    this.y = -2;
}

//Doldurma Fonksiyonu

Piece.prototype.fill = function (color) {
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {

            if (this.activeTetromino[r][c]) {
                drawSquare(this.x + c, this.y + r, color)
            }
        }
    }
}


//Parçanın tahtaya eklenmesi


Piece.prototype.draw = function () {
    this.fill(this.color)
}

//Kayan parçaların silinmesi 


Piece.prototype.unDraw = function () {
    this.fill(VACANT);
}

//Parçaların aşağıya kayması
Piece.prototype.moveDown = function () {
    if (!this.collision(0,1, this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
    }
    else {
        this.lock();
        p = RandomPiece();
    }
}

//Parçanın sağa hareket ettirilmesi

Piece.prototype.moveRight = function () {
    if (!this.collision(1,0, this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

//Parçaların sola hareket ettirilmesi

Piece.prototype.moveLeft = function () {
    if (!this.collision(-1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}

//Nesnenin rotasyonu

Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
    let kick = 0;
    
    if(this.collision(0,0,nextPattern)){
        if(this.x > COL/2){
            // it's the right wall
            kick = -1; // we need to move the piece to the left
        }else{
            // it's the left wall
            kick = 1; // we need to move the piece to the right
        }
    }
    
    if(!this.collision(kick,0,nextPattern)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}


//Sıkışma fonksiyonu 
let score = 0;
Piece.prototype.lock = function() {
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {

            if (!this.activeTetromino[r][c]) {
                continue;
            }

            if(this.y + r < 0) {
                alert("Game Over");
                gameOver = true;
                break;
            }

            board[this.y+r][this.x+c] = this.color;
        }
    }

    //Tüm satırın kaldırılması
    for(r = 0; r < ROW; r++) {
        let isRowFull = true;

        for(c = 0; c < COL; c++) {
            isRowFull = isRowFull && (board[r][c] != VACANT);
        }

        if(isRowFull) {
            for(y = r; y >1; y--) {
                for(c = 0; c < COL; c++) {
                    board[y][c] = board[y-1][c];
                }
            }

            for(c = 0; c < COL; c++) {
                board[0][c] = VACANT;
            }

            score += 10;
        }
    }
    drawBoard();
    scoreElement.innerHTML = score;
}


//Yığılma fonksiyonu

Piece.prototype.collision = function (x, y, piece) {
    for (r = 0; r < piece.length; r++) {
        for (c = 0; c < piece.length; c++) {
            //Kare boşsa bişey yapma
            if (!piece[r][c]) {
                continue;
            }

            let newX = this.x + c + x;
            let newY = this.y + r + y;

            if (newX < 0 || newX >= COL || newY >= ROW) {
                return true;
            }

            if (newY < 0) {
                continue;
            }

            if (board[newY][newX] != VACANT) {
                return true;
            }
        }
    }

    return false;
}


//Parçanın Kontrolü

document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
    if (event.keyCode == 37) {
        p.moveLeft();
        dropStart = Date.now()
    }

    else if (event.keyCode == 38) {
        p.rotate();
        dropStart = Date.now()
    }

    else if (event.keyCode == 39) {
        p.moveRight();
        dropStart = Date.now();
    }

    else if (event.keyCode == 40) {
        p.moveDown();
    }
}

//Kaymanın hesaplanması
let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 1000){
        p.moveDown();
        dropStart = Date.now();
    }
    if( !gameOver){
        requestAnimationFrame(drop);
    }
}

drop();
