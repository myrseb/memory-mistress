chosenLevel = "medium";
categories = [];
chosenCategory = "Człowiek";
chosenWords = words;
answers=[];
answerCount = 10;

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

const renderCategorySelectOptions = () => {
    return 
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
	let randomNumber = Math.floor(Math.random() * wordsForChosenCategory.length);
	let randomWord = wordsForChosenCategory[randomNumber];
	wordsForChosenCategory.splice(randomNumber, 1);
	return randomWord;
}

const getRandomEvaluation = (wynik) => {
	let bazaOcen;
	if(wynik===1) {
		bazaOcen = ["Super", "Doskonale", "Znakomicie"];
	}
	else if (wynik===2){
		bazaOcen = ["Całkiem dobrze", "Nieźle", "OK"];
	}
	else {bazaOcen = ["Spróbuj jeszcze raz", "Ups. Nie jest najlepiej", "Musisz jeszcze poćwiczyć"];}
	let randomNumber = Math.floor(Math.random() * bazaOcen.length);
	let grade = bazaOcen[randomNumber];
	return grade;
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
	hideElement("preview");
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
	_("question").innerHTML = question.pl;
	_("answer").innerHTML = question.en;
	_("title").innerHTML = "Słowo " + (answers.length + 1) + "/" + answerCount;
	_("translation").value = "";
	_("translation").focus();
}

const nextWord = () => {
	
	let grade = checkIfAnswerIsCorrect() ? 1 : 0;

	let answer = {"question" : _("question").innerHTML, "odpowiedź" : _("translation").value, "prawidłowa" : _("answer").innerHTML, "wynik" : grade}
	answers.push(answer);

	if (answers.length < answerCount) {
		printWord();
	}
	else {
		showSummary();
		hideElement("next");
		hideElement("exit-game");
	}
}

const checkIfAnswerIsCorrect = () => {
	return _("answer").innerHTML.toLowerCase() === _("translation").value.toLowerCase();
}

function showSummary(){
	let summary;
	let points = 0;
	let grade;
	answers.forEach(function(item, index, array) {
		points += item.wynik;
	})
	let color;
	if (Math.floor(points*100)>=Math.floor(answerCount * 0.7*100)){
		color = "green";
		grade = getRandomEvaluation(1);
	}
	else if ((Math.floor(points*100)<Math.floor(answerCount * 0.7*100)) && (Math.floor(points*100)>=Math.floor(answerCount * 0.45*100))){
		color = "orange";
		grade = getRandomEvaluation(2);
	}
	else {
		color = "red";
		grade = getRandomEvaluation(3);
	}
	summary="<p class='" + color + "'>" + grade + ". Twój wynik to " + points + "/" +answers.length+" ("+ Math.floor(points/answers.length * 100) + "%)</p>";
	summary+='<button id="details" class="my-20 print-hide">POKAŻ WYNIKI SZCZEGÓŁOWE</button>';
	
	_("grade").innerHTML = summary
    _("details").addEventListener('click', summaryDetails)
}

function summaryDetails(){
	let colorClass;
	let points = 0;
	let level = _("level").value;
	let summaryInfo = '';
	answers.forEach(function(item, index, array) {
		points+=item.wynik;
		if (item.wynik===0) {colorClass=' class="red"'}
		else {colorClass=' class="green"'}
		summaryInfo+=`<tr><td>${(index+1)}</td><td>${item.question}</td><td>${item.prawidłowa}</td><td${colorClass}>${item.odpowiedź}</td><td>${item.wynik}</td></tr>`;
	})
	let summary = `
	<div class="summary-header">
		<h2 id='summary-title' class='center mb-20'>Podsumowanie wyników</h2>
	</div>
	<div class="summary-content">
		<table><tr><th>Lp</th><th>Słowo</th><th>Tłumaczenie</th><th>Twoja odpowiedź</th><th>Punkty</th></tr>
	${summaryInfo}
		</tr></table>
		<button id="restart" class="my-40 mr-20 print-hide">ZAGRAJ JESZCZE RAZ</button>
		<button id="end-game" class="my-40 mr-20 print-hide">ZAGRAJ W INNEJ KATEGORII</button>
		<button id="finish-game" class="my-40 secondary print-hide">ZAKOŃCZ GRĘ</button>
	</div>
	`;
	
	//let color = points > Math.floor(answerCount * 0.65) ? "green" : "red";
	_("preview").innerHTML = summary;
	showElement("preview");
	_("summary-title").innerHTML = 'Podsumowanie wyników '+ points + "/" + answerCount +" ("+ Math.floor(points/answers.length * 100) + "%)";
	hideElement("details");
    _("restart").addEventListener('click', restartLearningSession);
	_("end-game").addEventListener('click', endGame);
	_("finish-game").addEventListener('click', finishGameAndLogToHistory);
}

const restartLearningSession = () => {
	answers.length = 0;
	_("preview").innerHTML = '';
	_("grade").innerHTML = '';
	hideElement("preview");
	showElement("next");
	showElement("exit-game");
	_("translation").value = '';
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
_("level").addEventListener('click', changeLevel);
_("exit-game").addEventListener('click', endGame);
