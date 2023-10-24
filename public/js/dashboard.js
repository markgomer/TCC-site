/***************************************
 * Charts functions
 ***************************************/


function filterByPlayerName(jsonList, playerName) {
    return jsonList.filter(item => item.playerName === playerName);
}

  
function extractUniquePlayerNames(jsonList) {
    const namesSet = new Set();
    jsonList.forEach(item => {
        if (item.hasOwnProperty('playerName')) {
            namesSet.add(item.playerName.toUpperCase());
        }
    });
    return Array.from(namesSet);
}


function extractUniqueObjectNames(jsonList) {
    const objectNamesSet = new Set();
    
    jsonList.forEach(item => {
      if (item.hasOwnProperty('objectsData')) {
        item.objectsData.forEach(objData => {
          if (objData.hasOwnProperty('objectName')) {
            objectNamesSet.add(objData.objectName);
          }
        });
      }
    });
  
    return Array.from(objectNamesSet);
}


function getTotalRightHits(jsonFilesArray) {
    let totalRightHits = 0;
    jsonFilesArray.forEach(sessionJson => {
        sessionJson.objectsData.forEach(a_json => {
            if(a_json.status == 1) {
                totalRightHits ++;
            }
        })
    })
    return totalRightHits;
}


function getTotalInteractions(jsonFilesArray) {
    let totalInteractions = 0;
    jsonFilesArray.forEach(sessionJson => {
        totalInteractions += sessionJson.objectsData.length;
    });
    return totalInteractions;
}


function calculateAverageTimePerPlayer(jsonList) {
    let totalTime = 0;
    const namesSet = new Set();

    jsonList.forEach(item => {
        if (item.hasOwnProperty('playerName') && item.hasOwnProperty('totalTime')) {
            totalTime += item.totalTime;
            namesSet.add(item.playerName.toLowerCase());  // Making it case insensitive
        }
    });

    // Calculate the average time
    const numberOfUniquePlayers = namesSet.size;
    if (numberOfUniquePlayers === 0) return 0; // Prevent division by zero

    const averageTime = totalTime / numberOfUniquePlayers;

    return averageTime;
}


function calculateSuccessRate(jsonList, playerName) {
    //const uniqueObjectNames = new Set();
    let successCount = 0;
    const lowerCasePlayerName = playerName.toLowerCase(); // Make it case insensitive

    jsonList.forEach(item => {
        if (item.hasOwnProperty('playerName') && item.playerName.toLowerCase() === lowerCasePlayerName) {
            if (item.hasOwnProperty('objectsData')) {
                item.objectsData.forEach(objData => {
                    if (objData.hasOwnProperty('objectName') && objData.hasOwnProperty('status')) {
                        const objectName = objData.objectName;
                        const status = objData.status.toString();  // Make sure it's a string

                        // Count unique objectName values
                        //uniqueObjectNames.add(objectName);

                        // Check if it's a success
                        if (objectName[0] === status[0]) {
                            successCount++;
                        }
                    }
                });
            }
        }
    });

    // Calculate the success rate
    const totalUniqueObjects = 15; // uniqueObjectNames.size;
    //if (totalUniqueObjects === 0) return 0; // Prevent division by zero

    const successRate = (successCount / totalUniqueObjects) * 100;

    return successRate;
}


function plotSuccessRateBarChart(data) {
    const playersSet = new Set();
    data.forEach(item => playersSet.add(item.playerName.toLowerCase()));

    const uniquePlayers = Array.from(playersSet);
    const playerSuccessRates = [];

    uniquePlayers.forEach(player => {
        const successRate = calculateSuccessRate(data, player);
        playerSuccessRates.push({ playerName: player, successRate });
    });

    // Sort players by success rate in descending order and take the top 10
    const topPlayers = playerSuccessRates.sort((a, b) => b.successRate - a.successRate).slice(0, 10);

    const topPlayerNames = topPlayers.map(player => player.playerName);
    const topSuccessRates = topPlayers.map(player => player.successRate);

    const ctx = document.getElementById('successRateBarPlot').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topPlayerNames,
            datasets: [{
                label: 'Taxa de acertos (%)',
                data: topSuccessRates,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}


function getMeanTimeByActivity (jsonFilesArray) {
    const sumObj = {};
    const countObj = {};
    const meanObj = {};
    // loop through all sessions
    jsonFilesArray.forEach(sessionJson => {
        // get the interacted objects in a session
        sessionJson.objectsData.forEach(activityObj => { 
            let key = activityObj.objectName;
            if (!sumObj[key]) {
                sumObj[key] = 0;
                countObj[key] = 0;
            }
            sumObj[key] += activityObj.timeObserved;
            countObj[key]++;
        })
        for (const key in sumObj) {
            if (Object.hasOwnProperty.call(sumObj, key)) {
                meanObj[key] = sumObj[key] / countObj[key];
            }
        }
    })
    console.log(meanObj);
    return meanObj;
}


function successPieChart(successData) {
    const ctx = document.getElementById('successPieChart').getContext('2d');

    const data = {
        labels: ["Erros", "Acertos"],
        // labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'], FOR TESTING
        datasets: [{
            data: Object.values(successData),
            // data: [12, 19, 3, 5, 2], FOR TESTING
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
        }]
    };

    const config = {
        type: 'pie',
        data: data
    };

    new Chart(ctx, config);
}
  

function timeSpentBarChart(timeSpentData) {
    const ctx = document.getElementById('timeSpentBarChart').getContext('2d');
  
    const data = {
      //labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
      labels: Object.keys(timeSpentData),
      datasets: [{
        //label: 'Sample Data',
        //data: [12, 19, 3, 5, 2],
        label: "Tempo médio gasto",
        data: Object.values(timeSpentData),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    };
  
    const config = {
      type: 'bar',
      data: data,
      options: {
        tooltips: {
            callbacks: {
                label: function (tooltipItem) { 
                    return `Time Spent: ${tooltipItem.yLabel}`;
                },
            },
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
  
    new Chart(ctx, config);
}


function createPlayerActivityDistribution(jsonList) {
    // Create a dictionary to store the sum of totalTime for each unique player
    const playerTimeDict = {};

    // Populate the dictionary
    jsonList.forEach(item => {
        if (item.hasOwnProperty('playerName') && item.hasOwnProperty('totalTime')) {
            const playerName = item.playerName.toLowerCase(); // Making it case insensitive
            if (playerTimeDict[playerName]) {
                playerTimeDict[playerName] += item.totalTime;
            } else {
                playerTimeDict[playerName] = item.totalTime;
            }
        }
    });

    // Prepare data for the chart
    const labels = Object.keys(playerTimeDict);
    const data = Object.values(playerTimeDict);

    // Create the chart
    const ctx = document.getElementById('playerActivityChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tempo total gasto por jogador',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Player Activity Distribution'
                }
            }
        }
    });
}


function plotScatterChart(dataArray) {
    // Prepare data for scatter plot
    const scatterData = [];

    // Loop through each game session's data
    dataArray.forEach((gameSession) => {
        gameSession.objectsData.forEach((objectData) => {
            scatterData.push({
                x: objectData.timeObserved,
                y: objectData.timeSelected,
            });
        });
    });

    // Create scatter plot using Chart.js
    const ctx = document.getElementById('scatterPlot').getContext('2d');
    const scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Time Observed vs Time Selected',
                data: scatterData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Time Observed'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Time Selected'
                    }
                }
            }
        }
    });
}

// Function to find most observed objects
function findMostObservedObjects(jsonList) {
    const objectCounts = {};

    jsonList.forEach(item => {
        if (item.hasOwnProperty('objectsData')) {
            item.objectsData.forEach(objData => {
                const objectName = objData.objectName;
                objectCounts[objectName] = (objectCounts[objectName] || 0) + 1;
            });
        }
    });

    // Sort by count, then return the sorted array
    return Object.keys(objectCounts).sort((a, b) => objectCounts[b] - objectCounts[a]);
}


function showMostObservedObjects(data) {
    // Populate the list
    const mostObservedObjects = findMostObservedObjects(data);
    const listGroup = document.getElementById('mostObservedObjectsList');
    
    mostObservedObjects.forEach(objectName => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = objectName;
        listGroup.appendChild(li);
    });
}
  

function showTime(averageTime) {
    document.getElementById('averageTime').innerText = averageTime.toFixed(1) + ' secs';
}

function isPlayerChoiceCorrect(objectName, status) {
    const firstChar = parseInt(objectName.charAt(0), 10);
    return firstChar === status;
  }
  
function calculateRateOfCorrectGuesses(jsonList, playerName) {
    let correctGuesses = 0;
    let totalTime = 0;

    for (const session of jsonList) {
        if (session.playerName !== playerName) {
            continue;
        }
        totalTime += session.totalTime;

        for (const objectData of session.objectsData) {
            if (isPlayerChoiceCorrect(objectData.objectName, objectData.status)) {
                correctGuesses++;
            }
        }
    }

    // Avoid division by zero or NaN
    if (totalTime === 0) {
        return null;
    }
    return correctGuesses / totalTime;
}

function plotRateOverTimeBarGraph(jsonList) {
    const ctx = document.getElementById('rateOverTimeBarGraph').getContext('2d');

    const uniquePlayers = [...new Set(jsonList.map(session => session.playerName))];
    const rates = uniquePlayers.map(playerName => calculateRateOfCorrectGuesses(jsonList, playerName)).filter(rate => rate !== null);

    const chartData = {
        labels: uniquePlayers,
        datasets: [{
            label: 'Taxa de acertos/Tempo total',
            data: rates,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    const config = {
        type: 'bar',
        data: chartData,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    const myBarChart = new Chart(ctx, config);
}


/**
* Fetch and Prepare Data
* Assuming you have a route /dashboard in your Express app that serves 
* the JSON files, you can fetch and prepare this data.
*/
async function fetchAndPrepareData() {
    const response = await fetch('/dashboard');
    const jsonList = await response.json();
  
    //sessionStorage.setItem('jsonList', jsonList);
    sessionStorage.setItem('jsonList', JSON.stringify(jsonList));

    const successData = [];
    successData.push(getTotalRightHits(jsonList)); // Holds success counts by employee
    successData.push(getTotalInteractions(jsonList));

    const timeSpentData = getMeanTimeByActivity(jsonList); // Holds time spent by activity
    
    const averageTime = calculateAverageTimePerPlayer(jsonList);
    
    //const employeesList = extractUniquePlayerNames(jsonList);
    //const filteredData = filterByPlayerName(jsonList, "Anderson");
    //const uniqueObjectNames = extractUniqueObjectNames(jsonList);

    return { jsonList, successData, timeSpentData, averageTime };
}


/**
* Populate Charts
* Use the fetched and prepared data to populate the pie and 
* bar charts
*/
async function populateCharts() {
    const { jsonList, successData, timeSpentData, averageTime } = await fetchAndPrepareData();

    // Create Pie Chart for Success Data
    successPieChart(successData);
    plotSuccessRateBarChart(jsonList);

    // Create Bar Chart for Time Spent Data
    timeSpentBarChart(timeSpentData);

    createPlayerActivityDistribution(jsonList);

    showTime(averageTime);
    
    plotScatterChart(jsonList);

    plotRateOverTimeBarGraph(jsonList);
    
}

populateCharts();
