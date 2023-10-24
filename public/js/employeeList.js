let jsonList;


function totalPlayTime(playerName) {
  let totalTime = 0;

  // Loop through each game session's data
  for (let i = 0; i < jsonList.length; i++) {
    const gameSession = jsonList[i];

    // Check if the playerName matches
    if (gameSession.playerName === playerName) {
      // Add this session's totalTime to the aggregate totalTime
      totalTime += gameSession.totalTime;
    }
  }
  return totalTime;
}

function countGamesPlayed(playerName) {
  let gameCount = 0;

  // Loop through each game session's data
  for (let i = 0; i < jsonList.length; i++) {
    const gameSession = jsonList[i];

    // Check if the playerName matches
    if (gameSession.playerName === playerName) {
      // Increment the game count
      gameCount++;
    }
  }

  return gameCount;
}

function isPlayerChoiceCorrect(objectName, status) {
  // Get the first character of objectName as a number
  const firstChar = parseInt(objectName.charAt(0), 10);
  
  // Check if the first character is equal to the status
  return firstChar === status;
}

function countCorrectChoices(jsonList, playerName) {
  let correctChoices = 0;

  // Loop through each game session's data
  for (let i = 0; i < jsonList.length; i++) {
    const gameSession = jsonList[i];

    // Check if the playerName matches
    if (gameSession.playerName === playerName) {
      // Loop through objectsData
      for (let j = 0; j < gameSession.objectsData.length; j++) {
        const objectData = gameSession.objectsData[j];
        if (isPlayerChoiceCorrect(objectData.objectName, objectData.status)) {
          correctChoices++;
        }
      }
    }
  }

  return correctChoices;
}

function plotCorrectChoicesPieChart(playerName) {
  const ctx = document.getElementById('correctChoicesPieChart').getContext('2d');
  const numberOfSessions = jsonList.filter(session => session.playerName === playerName).length;
  const totalGuesses = 15 * numberOfSessions;
  const correctGuesses = countCorrectChoices(jsonList, playerName);
  const incorrectGuesses = totalGuesses - correctGuesses;

  const data = {
    labels: ['Correct Guesses', 'Incorrect Guesses'],
    datasets: [{
      data: [correctGuesses, incorrectGuesses],
      backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)'],
      borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
      borderWidth: 1
    }]
  };

  const config = {
    type: 'pie',
    data: data
  };

  const myPieChart = new Chart(ctx, config);
}

function callgraphs(name) {
  const totalTime = totalPlayTime(name);
  const countGames = countGamesPlayed(name)
  const correctChoices = countCorrectChoices(jsonList, name);
  const html = `
  <div> 
      <p>Tempo total jogado: ${totalTime}</p>
      <p>Número de sessões jogadas: ${countGames}</p>
      <p>Número de acertos: ${correctChoices}</p>
  </div>
  `;
  document.getElementById("fillGraphs").innerHTML = html;
}

// Function to generate a list of unique player names
async function generatePlayerList() {
  const response = await fetch('/dashboard');
  jsonList = await response.json();
  //sessionStorage.setItem('jsonList', jsonList);
  const uniquePlayerNames = new Set();

  // Loop through each game session to collect player names
  jsonList.forEach((gameSession) => {
  uniquePlayerNames.add(gameSession.playerName);
  });

  // Generate HTML list items for each unique player name
  const listHtml = Array.from(uniquePlayerNames)
  .map(name => `
  <li id="player" data-bs-toggle="modal" data-bs-target="#exampleModal" onclick="callgraphs('${name}')" )">
    ${name}
  </li></p>
  <!-- Modal -->
  <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">${name}</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body" id="fillGraphs">
          Graphs go here
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
  `).join('');

  // Add list items to the UL element
  document.getElementById('playerList').innerHTML = listHtml;
}

// Generate the list on page load
generatePlayerList();