chosenLevel = "medium";
categories = [];
chosenCategory = "Człowiek";
chosenWords = words;
answers=[];
answerCount = 10;
sessionHistory = [];

function _(el){
	return document.getElementById(el);
}

const hideElement = (elementId) => {
	_(elementId).classList.add("hide");
}

const showElement = (elementId) => {
	_(elementId).classList.remove("hide");
}

const changeLevel = () => {
	if (_("level").value === "easy") {
		chosenWords = wordsEasy;
        chosenCategory = 'FAMILY';
	} else {
		chosenWords = words;
        chosenCategory = 'Człowiek';
	}
    getCategoriesForLevel();
    renderCategorySelect();
    setWordCategory(chosenCategory);
	changeWordCategory();
	printWord();
	
}

const getCategoriesForLevel = () => {
    categories = new Set(chosenWords.map(word => word.category));
}

const renderCategorySelect = () => {
    let categoryItems = Array.from(categories).map(category => {return `<option value="${category}">${category}</option>`});
    _("category-select").innerHTML =
    `<label for="category">Wybierz kategorię</label>
    <select id="category" class="mb-40">
        <option selected disabled value="0">Wybierz kategorię</option>
        ${categoryItems}
    </select>`;
    _("category").addEventListener('click', changeWordCategory);
}

const changeWordCategory = () => {
    chosenCategory = getWordCategory();
    wordsForChosenCategory = chosenWords.filter((item => item.category === chosenCategory));
}

const getWordCategory = () => {
    return _("category").value;
}

const setWordCategory = (newValue) => {
    _("category").value = newValue;
}

const getRandomWord = () => {
	wordsForChosenCategory = wordsForChosenCategory.length > 1 
	? wordsForChosenCategory 
	: chosenWords.filter((item => item.category === chosenCategory));
	let randomNumber = Math.floor(Math.random() * wordsForChosenCategory.length);
	let randomWord = wordsForChosenCategory[randomNumber];
	wordsForChosenCategory.splice(randomNumber, 1);
	return randomWord;
}

const getRandomEvaluation = (result) => {
	let evaluations = result === 1 ? ["Super", "Doskonale", "Znakomicie", "Jesteś świetna", "Wymiatasz"]
	: result === 2 ? ["Całkiem dobrze", "Nieźle Ci idzie", "Jest OK"]
	: ["Spróbuj jeszcze raz", "Ups. Nie jest najlepiej", "Musisz jeszcze poćwiczyć"];

	let randomNumber = Math.floor(Math.random() * evaluations.length);
	return evaluations[randomNumber];
}

const startGame = () => {
    showElement("game");
    hideElement("start");
	hideElement("settings");
    printWord();
}

const endGame = () => {
	restartLearningSession();
	hideElement("game");
	hideElement("summary-details");
	showElement("start");
	showElement("settings");
}

const finishGameAndLogToHistory = () => {
	endGame();
	logToHistory();
}

const logToHistory = () => {
	console.log("tu logi");
}

const printWord = () => {
	let question = getRandomWord();
	_("question").innerHTML = question ? question.pl : "koniec słówek (zmień kategorię)";
	_("answer").innerHTML = question ? question.en : "end of words (change category)";
	_("title").innerHTML = "Słowo " + (answers.length + 1) + "/" + answerCount;
	_("translation").value = "";
	_("translation").focus();
}

const nextWord = () => {

	addAnswerToSessionAnswers();

	if (answers.length < answerCount) {
		printWord();
	}
	else {
		showSummary();
		hideElement("next");
		hideElement("exit-game");
		hideElement("game");
	}
}

const addAnswerToSessionAnswers = () => {
	let result = checkIfAnswerIsCorrect() ? 1 : 0;
	let answer = {"question" : _("question").innerHTML, "answer" : _("translation").value, "correct" : _("answer").innerHTML, "result" : result}
	answers.push(answer);
}

const checkIfAnswerIsCorrect = () => {
	return _("answer").innerHTML.toLowerCase() === _("translation").value.toLowerCase();
}

const showSummary = () => {
	let summary;
	let points = calculatePoints();
	let percentageResult = calculatePercentageOfCorrectAnswers(points);
	let result = isVeryGoodResult(points) ? 1
	: isGoodResult(points) ? 2 
	: 3;

	let evaluation = getRandomEvaluation(result);
	
	let color = isVeryGoodResult(points) ? "green"
	: isGoodResult(points) ? "orange" 
	: "red";

	summary = `<p class="${ color }">${ evaluation }. </p>
	<p class="${ color }">Twój wynik to ${ points }/${ answers.length } (${ percentageResult }%)</p>
	<button id="details" class="my-20 print-hide">POKAŻ WYNIKI SZCZEGÓŁOWE</button>`;
	
	_("evaluation").innerHTML = summary
    _("details").addEventListener('click', showSummaryDetails)
}

const calculatePoints = () => {
	let points = 0;
	answers.forEach(function(item) {
		points += item.result;
	})
	return points;
}

const calculatePercentageOfCorrectAnswers = (points) => {
	return Math.floor(points / answers.length * 100)
}

const isVeryGoodResult = (points) => {
	return Math.floor(points * 100) >= Math.floor(answerCount * 0.7 * 100);
}

const isGoodResult = (points) => {
	return Math.floor(points * 100) < Math.floor(answerCount * 0.7 * 100) && Math.floor(points * 100) >= Math.floor(answerCount * 0.45 * 100);
}

const showSummaryDetails = () => {
	let points = calculatePoints();
	
	
	_("summary-details").innerHTML = renderSummaryDetails();
	showElement("summary-details");
	_("summary-title").innerHTML = 'Podsumowanie wyników '+ points + "/" + answerCount +" ("+ Math.floor(points/answers.length * 100) + "%)";
	hideElement("details");
    _("restart").addEventListener('click', restartLearningSession);
	_("end-game").addEventListener('click', endGame);
	_("finish-game").addEventListener('click', finishGameAndLogToHistory);
}

const renderSummaryDetails = () => {
	let summaryInfo = '';
	answers.forEach(function(answer, index) {
		summaryInfo += generateOneRowForDetailsInfo(answer, index);
	})
	return `
	<div class="summary-header">
		<h2 id='summary-title' class='center mb-20'>Podsumowanie wyników</h2>
	</div>
	<div class="summary-content">
		<div class="table-container">
			<table><tr><th>Lp</th><th>Słowo</th><th>Tłumaczenie</th><th>Twoja odpowiedź</th><th>Punkty</th></tr>
				${summaryInfo}
			</tr></table>
		</div>
		<button id="restart" class="mr-20 print-hide">ZAGRAJ JESZCZE RAZ</button>
		<button id="end-game" class="mr-20 print-hide">ZAGRAJ W INNEJ KATEGORII</button>
		<button id="finish-game" class="secondary print-hide">ZAKOŃCZ GRĘ</button>
	</div>
	`;
}

const generateOneRowForDetailsInfo = (answer, index) => {
	let	colorClass = answer.result === 0 ? ' class="red"' : ' class="green"';
	return `<tr>
				<td>${ index + 1 }</td>
				<td>${ answer.question }</td>
				<td>${ answer.correct }</td>
				<td${ colorClass }>${ answer.answer }</td>
				<td${ colorClass }>${ answer.result }</td>
			</tr>`;
}

const restartLearningSession = () => {
	answers.length = 0;
	_("evaluation").innerHTML = '';
	hideElement("summary-details");
	showElement("next");
	showElement("exit-game");
	printWord();
}


// Get the input field
var input = _("translation");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    //_("next").click();
	if (answers.length < answerCount) {
		nextWord();
	}
  }
});

getCategoriesForLevel();
renderCategorySelect();
setWordCategory(chosenCategory);
changeWordCategory();
_("start").addEventListener('click', startGame);
_("next").addEventListener('click', nextWord);
_("level").addEventListener('change', changeLevel);
_("exit-game").addEventListener('click', endGame);
