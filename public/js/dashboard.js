

/***************************************
 * Charts functions
 */



/**
* Fetch and Prepare Data
* Assuming you have a route /dashboard in your Express app that serves 
* the JSON files, you can fetch and prepare this data.
*/
async function fetchAndPrepareData() {
    const response = await fetch('/dashboard');
    const jsonFilesArray = await response.json();
  
    const successData = {}; // Holds success counts by employee
    const timeSpentData = {}; // Holds time spent by activity
    
    console.log(jsonFilesArray);

    // Iterates through each JSON object in the jsonFilesArray array.
    jsonFilesArray.forEach(a_json => {
        console.log(a_json);

        if (a_json.objectsData.status == 1) {
            successData[a_json.playerName] = (successData[a_json.playerName] || 0) + 1;
        }
    
        // Assuming your JSON files have 'timeSpent' and 'activity' fields
        timeSpentData[a_json.objectsData.objectName] = (timeSpentData[a_json.objectName] || 0) + a_json.timeObserved;
    });
  
    return { successData, timeSpentData };
}


function getTotalRightHits(jsonFilesArray) {
    let totalRightHits = 0;
    jsonFilesArray.objectsData.forEach(a_json => {
        if(a_json.status == 1) {
            totalRightHits ++;
        }
    })
    return totalRightHits;
}

function getTotalInteractions(jsonFilesArray) {
    let totalInteractions = 0;
    jsonFilesArray.objectsData.keys().length
    // ...
    return ;
}


function getTotalMeanTime() {

}


function getEmployeesList() {

}


function getActivityList() {

}




/**
* Populate Charts
* Finally, use the fetched and prepared data to populate the pie and 
* bar charts
*/
async function populateCharts() {
    const { successData, timeSpentData } = await fetchAndPrepareData();

    // Create Pie Chart for Success Data
    const ctxPie = document.getElementById('successPieChart').getContext('2d');
    new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: Object.keys(successData),
            datasets: [{
                data: Object.values(successData),
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'], // Add more colors if needed
            }],
        },
    });

    // Create Bar Chart for Time Spent Data
    const ctxBar = document.getElementById('timeSpentBarChart').getContext('2d');
    new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: Object.keys(timeSpentData),
            datasets: [{
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

populateCharts();