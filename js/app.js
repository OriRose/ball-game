const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BALL = 'BALL';
const GAMER = 'GAMER';
const GLUE = 'GLUE';

const GAMER_IMG = '<img src="img/gamer.png">';
const BALL_IMG = '<img src="img/ball.png">';
const GLUE_IMG = '<img src="img/glue.png">';

var gGamerPos = { i: 2, j: 9 };
var gBoard = buildBoard();
var gScore = 0;
var gBallCount = 2;
var gGlueCount = 0;
var gGameOver = false;
var gGlueInterval;
var gBallInterval;
var gGlued = false;

renderBoard(gBoard);
// generateBall();
// generateGlue();
gGlueInterval = setInterval(generateGlue, 5000);
gBallInterval = setInterval(generateBall, 3700);

function buildBoard() {
	// Create the Matrix 10 * 12 
	var board = createMat(10, 12);
	console.log('board', board)

	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR everywhere and WALL at edges
			var cell = { type: FLOOR, gameElement: null }
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL
			}
			board[i][j] = cell
		}
	}

	// Place the gamer and two balls
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	board[2][3].gameElement = BALL;
	board[6][7].gameElement = BALL;
	board[0][5] = { type: FLOOR, gameElement: null };
	board[9][5] = { type: FLOOR, gameElement: null };
	board[5][0] = { type: FLOOR, gameElement: null };
	board[5][11] = { type: FLOOR, gameElement: null };

	// console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {
	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';

		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}
			else if (currCell.gameElement === GLUE) {
				strHTML += GLUE_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}
	// console.log('strHTML is:');
	// console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
	console.log('i', i)
	console.log('j', j)

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	// if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

	if (targetCell.gameElement === BALL) {
		console.log('Collecting!');
		playBallSound();
		gScore++;
		elScore = document.querySelector('.scoreboard span');
		elScore.innerText = gScore;
		gBallCount--;
		if (gBallCount === 0) {
			gGameOver = true;
			playVictorySound();
			clearInterval(gBallInterval);
			clearInterval(gGlueInterval);
		}
	}
	if (targetCell.gameElement === GLUE) {
		gGlueCount--;
		playGlueSound();
		gGlued = true;
		setTimeout(clearGlue, 3000);
	}

	// Todo: Move the gamer
	targetCell.gameElement = GAMER;
	gBoard[gGamerPos.i][gGamerPos.j].gameElement = '';
	gGamerPos.i = i;
	gGamerPos.j = j;
	renderBoard(gBoard);

	// } else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
	if (!gGlued && !gGameOver) {
		var i = gGamerPos.i;
		var j = gGamerPos.j;

		switch (event.key) {
			case 'ArrowLeft':
				if (j - 1 < 0) j = 12;
				moveTo(i, j - 1);
				break;
			case 'ArrowRight':
				if (j + 1 > 11) j = -1;
				moveTo(i, j + 1);
				break;
			case 'ArrowUp':
				if (i - 1 < 0) i = 10;
				moveTo(i - 1, j);
				break;
			case 'ArrowDown':
				if (i + 1 > 9) i = -1;
				moveTo(i + 1, j);
				break;

		}
	}
}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function playBallSound() {
	var audio = new Audio('pickup.wav');
	audio.play();
}

function playVictorySound() {
	var audio = new Audio('victory.wav');
	audio.play();
}

function playGlueSound() {
	var audio = new Audio('glue.wav');
	audio.play();
}

function restart() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	gScore = 0;
	gBallCount = 2;
	gGameOver = false;
	gGlued = false;
	elScore = document.querySelector('.scoreboard span');
	elScore.innerText = gScore;
	renderBoard(gBoard);
	gGlueInterval = setInterval(generateGlue, 5000);
	gBallInterval = setInterval(generateBall, 3700);
}

function generateBall() {
	if (gBallCount > 9) return null;
	var targetCell = gBoard[getRandomInteger(1, 8)][getRandomInteger(1, 10)];
	if (targetCell.gameElement !== null) generateBall();
	else {
		targetCell.gameElement = BALL;
		renderBoard(gBoard);
		gBallCount++;
	}
}

function generateGlue() {
	if (gGlueCount > 6) return null;
	var targetCell = gBoard[getRandomInteger(1, 8)][getRandomInteger(1, 10)];
	if (targetCell.gameElement !== null) generateGlue();
	else {
		targetCell.gameElement = GLUE;
		renderBoard(gBoard);
		gGlueCount++;
	}
}

// function removeGlue() {
// 	var targetCell = gBoard[getRandomInteger(1, 8)][getRandomInteger(1, 10)];
// 	if (targetCell.gameElement !== GLUE) removeGlue();
// 	else {
// 		targetCell.gameElement = null;
// 		renderBoard(gBoard);
// 		gGlueCount--;
// 	}
// }

function clearGlue() {
	gGlued = false;
}