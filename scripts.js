let latestMineData = null;
let latestSubmissionsData = null;
let challengesData = null;
let activeMinersData = null;
let difficultyHistogram = null;
let latestDifficulty = null;

async function getLatestMine() {
    const url = 'https://domainexpansion.tech/txns/latest-mine';
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        latestMineData = data;
        console.log(latestMineData);
        updateLatestTransaction();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function getLatestSubmissions() {
    const url = 'https://domainexpansion.tech/last-challenge-submissions';
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        latestSubmissionsData = data;
        console.log(latestSubmissionsData);
        updateLatestDifficulty();
        updateDifficultyHistogram();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function getChallenges() {
    const url = 'https://domainexpansion.tech/challenges';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        challengesData = data;
        console.log(challengesData);
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function getActiveMiners() {
    const url = 'https://ec1ipse.me/active-miners';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        activeMinersData = data;
        console.log(activeMinersData);
        updateActiveMiners();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

function updateLatestTransaction() {
    const element = document.getElementById('recent-txn');
    
    if (element && latestMineData) {
        const signature = latestMineData.signature;
        const url = `https://solscan.io/tx/${signature}`;

        element.innerHTML = `Latest Mine Transaction: <a href="${url}" target="_blank">${signature}</a> (<span id="time-ago"></span>)`;

        updateTimeAgo();
    } else {
        console.error('Element with ID "recent-txn" not found or latestMineData is not available.');
    }
}

function updateTimeAgo() {
    const element = document.getElementById('time-ago');
    
    if (element && latestMineData) {
        const createdAt = new Date(latestMineData.created_at);

        createdAt.setTime(createdAt.getTime() - (5 * 60 * 60 * 1000));

        const unixTimestamp = Math.floor(createdAt.getTime() / 1000);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        
        const differenceInSeconds = currentTimestamp - unixTimestamp;
        const minutes = Math.floor(differenceInSeconds / 60);
        const seconds = differenceInSeconds % 60;

        element.textContent = `${minutes}m ${seconds}s ago`;

        if (differenceInSeconds > 80) {
            getLatestData();
            setTimeout(console.log("Waiting for data..."), 2000);
        }
    } else {
        console.error('Element with ID "time-ago" not found or latestMineData is not available.');
    }
}

function updateLatestHashrateEstimate() {
    const element = document.getElementById('estimatedHashrate');

    let estimatedPoolHashrate = Math.pow(2, latestDifficulty) / 60;
    
    const formattedHashrate = Math.round(estimatedPoolHashrate).toLocaleString();

    element.textContent = `${formattedHashrate} H/s`;

    console.log(estimatedPoolHashrate);
}


function updateLatestDifficulty() {
    if (latestSubmissionsData.length === 0) {
        console.warn('No challenge data available to find the highest difficulty.');
        return;
    }

    latestDifficulty = latestSubmissionsData.reduce((max, miner) => {
        return miner.difficulty > max ? miner.difficulty : max;
    }, 0);

    console.log('Latest Pool Difficulty:', latestDifficulty)
    updateLatestHashrateEstimate();

    const difficultyElement = document.getElementById('latestDifficulty');
    if (difficultyElement) {
        difficultyElement.textContent = `${latestDifficulty}`;
    } else {
        console.error('Element with ID "latestDifficulty" not found.');
    }
}


function updateActiveMiners() {
    const element = document.getElementById('activeMiners');
    
    if (element) {
        element.textContent = activeMinersData;
    } else {
        console.error('Element with ID "activeMiners" not found.');
    }
}

function updateDifficultyHistogram() {
    const difficultyCounts = {};

    latestSubmissionsData.forEach(submission => {
        const difficulty = submission.difficulty;
        if (difficultyCounts[difficulty]) {
            difficultyCounts[difficulty]++;
        } else {
            difficultyCounts[difficulty] = 1;
        }
    });

    const difficulties = Object.keys(difficultyCounts);
    const counts = difficulties.map(difficulty => difficultyCounts[difficulty]);

    const ctx = document.getElementById('difficultyHistogram').getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(153, 102, 255, 0.7)');
    gradient.addColorStop(1, 'rgba(153, 102, 255, 0)');

    if (difficultyHistogram) {
        difficultyHistogram.destroy();
    }

    difficultyHistogram = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: difficulties,
            datasets: [{
                label: 'Difficulty Count',
                data: counts,
                backgroundColor: gradient,
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Difficulty Histogram From Latest Submissions',
                    color: '#fff',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                },
                tooltip: {
                    enabled: true
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                        color: '#fff',
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                        color: '#fff',
                    }
                }
            }
        }
    });
}

function getLatestData() {
    getLatestMine();
    getLatestSubmissions();
    getChallenges();
    getActiveMiners();
}

getLatestData();
setInterval(updateTimeAgo, 1000);
