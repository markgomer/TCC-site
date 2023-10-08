

/***************************************
 * Charts functions
 ***************************************/

/**
 *  This will change in the future versions!!
 */
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


function getTotalMeanTime(jsonFilesArray) {
    let totalMeanTime = 0;
    let totalTime = 0.0;
    let totalInteractions = 0;
    jsonFilesArray.forEach(sessionJson => {
        totalInteractions += sessionJson.objectsData.length;
        totalTime += sessionJson.objectsData.timeObserved;
    });
    totalMeanTime = totalTime / totalInteractions;
    return totalMeanTime;
}


function getEmployeesList(jsonFilesArray) {
    let employeesList = [];
    jsonFilesArray.forEach(sessionJson => {
        employeesList.push(sessionJson.playerName);
    });
    return employeesList;
}


function getActivityList(jsonFilesArray) {
    let activityList = [];
    jsonFilesArray.forEach(sessionJson => {
        sessionJson.objectsData.forEach(obj => {
            activityList.push(obj.objectName);
        })
    });
    return activityList;
}


function getMeanTimeByActivity (jsonFilesArray, activityName) {
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

/**
* Fetch and Prepare Data
* Assuming you have a route /dashboard in your Express app that serves 
* the JSON files, you can fetch and prepare this data.
*/
async function fetchAndPrepareData() {
    const response = await fetch('/dashboard');
    const jsonFilesArray = await response.json();
  
    const successData = []; // Holds success counts by employee
    let timeSpentData = 0; // Holds time spent by activity
    
    successData.push(getTotalRightHits(jsonFilesArray));
    successData.push(getTotalInteractions(jsonFilesArray));
    // {"activity": meanTime, ...}
    timeSpentData = getMeanTimeByActivity(jsonFilesArray);
    console.log(successData);
    console.log(timeSpentData);
    return { successData, timeSpentData };
}


function successPieChart(successData) {
    const ctxPie = document.getElementById('successPieChart').getContext('2d');
    new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ["Erros", "Acertos"], 
            datasets: [{
                data: Object.values(successData),
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'], // Add more colors if needed
            }],
        },
    });
}


function timeSpentBarChart(timeSpentData) {
    const ctxBar = document.getElementById('timeSpentBarChart').getContext('2d');
    new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: Object.keys(timeSpentData),
            datasets: [{
                label: "Mean time spent",
                data: Object.values(timeSpentData),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }],
        },
        options: {
            tooltips: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `Time Spent: ${tooltipItem.yLabel}`;
                    },
                },
            },
        },
    });
}


/**
* Populate Charts
* Use the fetched and prepared data to populate the pie and 
* bar charts
*/
async function populateCharts() {
    const { successData, timeSpentData } = await fetchAndPrepareData();

    // Create Pie Chart for Success Data
    successPieChart(successData);

    // Create Bar Chart for Time Spent Data
    timeSpentBarChart(timeSpentData);
}

populateCharts();