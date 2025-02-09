const Action = { Rock: 1, Paper: 2, Scissors: 3 };
const Victories = { [Action.Scissors]: Action.Paper, [Action.Paper]: Action.Rock, [Action.Rock]: Action.Scissors };

let playerScore = 0, botScore = 0, totalGames = 0, ties = 0;
let lastResult = "", repeatCount = 1;
let pattern = []; // Stores the sequence of human choices
const patternLength = 10; // Length of the pattern for training

// Initialize Brain.js LSTM network
const net = new brain.recurrent.LSTMTimeStep();

function prepareData() {
    if (pattern.length < patternLength) {
        for (let i = 0; i < patternLength; i++) {
            pattern.push(Math.floor(Math.random() * 3) + 1); // Fill with random choices initially
        }
    }
}

function updatePattern(playerAction) {
    if (pattern.length >= patternLength) {
        pattern.shift(); // Remove the oldest choice
    }
    pattern.push(playerAction); // Add the latest human choice
}

function trainAI() {
    net.train([pattern], { iterations: 100, log: true }); // Train the network on the current pattern
}

function getComputerAction() {
    if (pattern.length < patternLength) {
        return Object.values(Action)[Math.floor(Math.random() * 3)]; // Random choice if pattern is insufficient
    }

    // Train the network before running it
    trainAI();

    const predictedHumanChoice = net.run(pattern); // Predict the human's next move
    const roundedPrediction = Math.round(predictedHumanChoice); // Round the prediction to an integer
    // Counter the predicted human choice
    return roundedPrediction >= 1 && roundedPrediction <= 3 ? (roundedPrediction % 3) + 1 : 1;
}

function determineWinner(playerAction, botAction) {
    if (botAction === Victories[playerAction]) return playerScore++, "you won";
    if (playerAction === botAction) return ties++, "you tied";
    botScore++;
    return "you lost";
}

function updateUI(playerAction, botAction, result) {
    totalGames++;
    if (result === lastResult) repeatCount++; else repeatCount = 1;
    lastResult = result;

    document.querySelectorAll(".score")[0].textContent = playerScore;
    document.querySelectorAll(".score")[1].textContent = ties;
    document.querySelectorAll(".score")[2].textContent = botScore;

    document.querySelectorAll(".action")[0].textContent = Object.keys(Action).find(key => Action[key] === playerAction).toLowerCase();
    document.querySelectorAll(".action")[1].textContent = Object.keys(Action).find(key => Action[key] === botAction).toLowerCase();

    document.querySelector("#state").textContent = result + (repeatCount > 1 ? ` (x${repeatCount})` : "");

    document.querySelectorAll(".winrate")[0].textContent = totalGames ? ((playerScore / totalGames) * 100).toFixed(1) + "%" : "0%";
    document.querySelectorAll(".winrate")[1].textContent = totalGames ? ((ties / totalGames) * 100).toFixed(1) + "%" : "0%";
    document.querySelectorAll(".winrate")[2].textContent = totalGames ? ((botScore / totalGames) * 100).toFixed(1) + "%" : "0%";
}

function play(action) {
    const playerAction = Action[action];
    prepareData(); // Ensure the pattern is ready
    trainAI(); // Train the network before making predictions
    const botAction = getComputerAction(); // Get the AI's move
    updateUI(playerAction, botAction, determineWinner(playerAction, botAction));
    updatePattern(playerAction); // Update the pattern with the human's choice
}

document.querySelectorAll("button").forEach(btn => {
    if (btn.id !== "reset") btn.addEventListener("click", () => play(btn.id.charAt(0).toUpperCase() + btn.id.slice(1)));
});

document.getElementById("reset").addEventListener("click", () => {
    playerScore = botScore = totalGames = ties = 0;
    lastResult = ""; repeatCount = 1;
    pattern = []; // Reset the pattern

    document.querySelectorAll(".score").forEach(el => el.textContent = "0");
    document.querySelectorAll(".action").forEach(el => el.textContent = "-");
    document.querySelectorAll(".winrate").forEach(el => el.textContent = "-");
    document.querySelector("#state").textContent = "make an action";
});