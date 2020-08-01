const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const startForm = document.querySelector('form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
const countdown = document.querySelector('.countdown');
const itemContainer = document.querySelector('.item-container');
const finalTimeElement = document.querySelector('.final-time');
const baseTimeElement = document.querySelector('.base-time');
const penaltyTimeElement = document.querySelector('.penalty-time');
const playAgainButton = document.querySelector('.play-again');

let questionAmount;
let equationsArray = new Array();
let playerGuesses = new Array();
let bestScoresArray = new Array();

let firstNumber = 0;
let secondNumber = 0;
let equationObject = new Object();
const wrongFormat = new Array();

let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0';

let scrollDownY = 0;

function bestScoresToDOM() {
	bestScores.forEach((bestScore, i) => {
		const bestScoreElement = bestScore;
		bestScoreElement.textContent  = `${bestScoresArray[i].bestScore}s`;
	});
};

function getSavedBestScores() {
	if (localStorage.getItem('bestScores')) {
		bestScoresArray = JSON.parse(localStorage.getItem('bestScores'));
	} else {
		bestScoresArray = [
			{questions: 10, bestScore: finalTimeDisplay},
			{questions: 25, bestScore: finalTimeDisplay},
			{questions: 50, bestScore: finalTimeDisplay},
			{questions: 99, bestScore: finalTimeDisplay}
		];
		localStorage.setItem('bestScores', JSON.stringify(bestScoresArray));
	};

	bestScoresToDOM();
};

function updateBestScores() {
	bestScoresArray.forEach((score, i) => {
		if (questionAmount === score.questions) {
			const savedBestScore = Number(bestScoresArray[i].bestScore);
			if (savedBestScore === 0 || savedBestScore > finalTime) {
				bestScoresArray[i].bestScore = finalTimeDisplay;
			};
		};
	});

	bestScoresToDOM();
	localStorage.setItem('bestScores', JSON.stringify(bestScoresArray));
};

function playAgain() {
	scorePage.hidden = true;
	splashPage.hidden = false;
	equationsArray = [];
	playerGuesses = [];
	scrollDownY = 0;
	playAgainButton.hidden = true;
};

function showScorePage() {
	setTimeout(() => playAgainButton.hidden = false, 1000);
	gamePage.hidden = true;
	scorePage.hidden = false;
};

function scoresToDOM() {
	baseTime = timePlayed.toFixed(1);
	penaltyTime = penaltyTime.toFixed(1);
	finalTimeDisplay = finalTime.toFixed(1);

	baseTimeElement.textContent = `Base Time ${baseTime}s`;
	penaltyTimeElement.textContent = `Penalty: +${penaltyTime}s`;
	finalTimeElement.textContent = `${finalTimeDisplay}s`;

	updateBestScores();
	itemContainer.scrollTo({top: 0, behavior: 'instant'});
	showScorePage();
};

function checkTime() {
if (playerGuesses.length === questionAmount) {
		clearInterval(timer);

		equationsArray.forEach((equation, i) => {
			if (equation.evaluated === playerGuesses[i]) {
	
			} else {
				penaltyTime += 0.5;
			};
		});

		finalTime = timePlayed + penaltyTime;
		scoresToDOM();
	};
};

function addTime() {
	timePlayed += 0.1;
	checkTime();
};

function startTimer() {
	timePlayed = 0;
	penaltyTime = 0;
	finalTime = 0;

	timer = setInterval(addTime, 100);
};

function select(guess) {
	scrollDownY += 80;
	itemContainer.scroll(0, scrollDownY);

	return guess === true ? playerGuesses.push('true') : playerGuesses.push('false');
};

function showGamePage() {
	gamePage.hidden = false;
	countdownPage.hidden = true;
	startTimer();
};

function getRandomInteger(max) {
	return Math.floor(Math.random() * Math.floor(max));
};

function createEquations() {
	const rightEquations = getRandomInteger(questionAmount);
	const wrongEquations = questionAmount - rightEquations;

	for (let i = 0; i < rightEquations; i++) {
		firstNumber = getRandomInteger(9);
		secondNumber = getRandomInteger(9);

		const equationValue = firstNumber * secondNumber;
		const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
		equationObject = {value: equation, evaluated: 'true'};

		equationsArray.push(equationObject);
	};

	for (let i = 0; i < wrongEquations; i++) {
		firstNumber = getRandomInteger(9);
		secondNumber = getRandomInteger(9);

		const equationValue = firstNumber * secondNumber;
		wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
		wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
		wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
		const formatChoice = getRandomInteger(3);
		const equation = wrongFormat[formatChoice];
		equationObject = {value: equation, evaluated: 'false'};

		equationsArray.push(equationObject);
	};

	shuffle(equationsArray);
};

function equationsToDOM() {
	equationsArray.forEach(equation => {
		const item = document.createElement('div');
		item.classList.add('item');
		const equationText = document.createElement('h1');
		equationText.textContent = equation.value;

		item.appendChild(equationText);
		itemContainer.appendChild(item);
	});
};

function populateGamePage() {
	itemContainer.textContent = '';

	const topSpacer = document.createElement('div');
	topSpacer.classList.add('height-240');

	const selectedItem = document.createElement('div');
	selectedItem.classList.add('selected-item');
	itemContainer.append(topSpacer, selectedItem);

	createEquations();
	equationsToDOM();

	const bottomSpacer = document.createElement('div');
	bottomSpacer.classList.add('height-500');
	itemContainer.appendChild(bottomSpacer);
};

function startCountdown() {
	let count = 3;
	countdown.textContent = count;

	const countdownTime = setInterval(() => {
		count--;

		if (count === 0) {
			countdown.textContent = 'GO!';
		} else if (count === -1) {
			showGamePage();
			clearInterval(countdownTime);
		} else {
			countdown.textContent = count;
		};
	}, 1000);
};

function showCountdown() {
	countdownPage.hidden = false;
	splashPage.hidden = true;
	populateGamePage();
	startCountdown();
};

function getRadioValue() {
	let radioValue;
	radioInputs.forEach(input => {
		if (input.checked) {
			radioValue = input.value;
		};
	});

	return Number(radioValue); 
};

function selectQuestionAmount(e) {
	e.preventDefault();
	questionAmount = getRadioValue();
	if (questionAmount) {
		showCountdown();
	};
};

startForm.addEventListener('click', () => {
	radioContainers.forEach(radio => {
		radio.classList.remove('selected-label');
		if (radio.children[1].checked) {
			radio.classList.add('selected-label');
		};
	});
});
startForm.addEventListener('submit', selectQuestionAmount);

getSavedBestScores();