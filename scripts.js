let latestMineData = null;
let latestSubmissionsData = null;
let challengesData = null;
let activeMinersData = null;
let difficultyHistogram = null;
let latestDifficulty = null;
let poolRewardsData = null;
let poolStakeData = null;
let clientData = null;
let stakeData = null;
let difficultyOverTimeChart = null;
let lastFetchTimestamp = 0;

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
        updateDifficultyOverTime();
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
        updateDayEarnings();
        updatedHighestDayDifficulty();
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

async function getPoolRewards() {
    const url = 'https://domainexpansion.tech/pool';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        poolRewardsData = data;
        console.log(poolRewardsData);
        updatePoolRewards();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function getPoolStake() {
    const url = 'https://domainexpansion.tech/pool/staked';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        poolStakeData = data;
        console.log(poolStakeData);
        updatePoolStake();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function getClientData() {
    const url = 'https://crates.io/api/v1/crates/ore-hq-client';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        clientData = data;
        console.log(clientData);
        updateNewestVersionAndTime();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function getPoolMultiplier() {
    const url = 'https://domainexpansion.tech/stake-multiplier';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        stakeData = data;
        console.log(stakeData);
        updatePoolMultiplier();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

function updatePoolMultiplier() {
    const element = document.getElementById('poolMultiplier');

    if (element && stakeData) {
        const formattedMultiplier = parseFloat(stakeData).toFixed(2);
        element.innerHTML = formattedMultiplier;
    } else {
        console.error('Element with ID "poolMultiplier" not found or stakeData is not available.');
    }
}


function updateNewestVersionAndTime() {
    const newestVersionElement = document.getElementById('latestVersion');
    const latestUpdateElement = document.getElementById('latestVersionUpdate');

    if (newestVersionElement && latestUpdateElement && clientData) {
        const newestVersion = clientData.crate.newest_version;
        const updatedAtTimestamp = new Date(clientData.crate.updated_at).getTime();
        console.log(updatedAtTimestamp);
        const nowTimestamp = Date.now();
        console.log(nowTimestamp);
        const timeDifference = nowTimestamp - updatedAtTimestamp;

        let timeAgo;

        const minutes = Math.floor(timeDifference / (1000 * 60));
        const hours = Math.floor(timeDifference / (1000 * 60 * 60));
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        if (minutes < 60) {
            timeAgo = `${minutes} minutes ago`;
        } else if (hours < 24) {
            timeAgo = `${hours} hours ago`;
        } else {
            timeAgo = `${days} days ago`;
        }

        console.log(timeAgo);

        newestVersionElement.innerHTML = newestVersion;
        latestUpdateElement.innerHTML = timeAgo;
    } else {
        console.error('Element with ID "latestVersion" or "latestVersionUpdate" not found or clientData is not available.');
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

function updatedHighestDayDifficulty() {
    const element = document.getElementById('highestDayDifficulty');

    if (element && challengesData) {
        let highestDifficulty = challengesData[0].difficulty;

        challengesData.forEach(challenge => {
            if (challenge.difficulty > highestDifficulty) {
                highestDifficulty = challenge.difficulty;
            }
        });;

        element.innerHTML = highestDifficulty;

    } else {
        console.error('Element with ID "highestDayDifficulty" not found or challengesData is not available.');
    }
}

function updatePoolStake() {
    const element = document.getElementById('stake');
    
    if (element && poolStakeData) {
        const stake = poolStakeData / 100000000000;

        element.innerHTML = stake;

    } else {
        console.error('Element with ID "stake" not found or poolStakeData is not available.');
    }
}

function updatePoolRewards() {
    const rewardsElement = document.getElementById('poolRewards');
    const rewardsClaimedElement = document.getElementById('claimedRewards');
    
    if (rewardsElement && rewardsClaimedElement && poolRewardsData) {
        const rewards = poolRewardsData.total_rewards/ 100000000000;
        const claimedRewards = poolRewardsData.claimed_rewards / 100000000000;

        rewardsElement.innerHTML = rewards;
        rewardsClaimedElement.innerHTML = claimedRewards;

    } else {
        console.error('Element with ID "poolRewards" or "" not found or poolRewardsData is not available.');
    }
}

function updateTimeAgo() {
    const element = document.getElementById('time-ago');
    
    if (element && latestMineData) {
        const createdAt = new Date(latestMineData.created_at);
        const date = new Date(createdAt);

        const offsetInMinutes = new Date().getTimezoneOffset();
        const offsetInHours = offsetInMinutes / 60;

        const offsetDate = new Date(date.getTime() - offsetInHours * 60 * 60 * 1000);

        const unixTimestamp = Math.floor(offsetDate.getTime() / 1000);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        
        const differenceInSeconds = currentTimestamp - unixTimestamp;
        const minutes = Math.floor(differenceInSeconds / 60);
        const seconds = differenceInSeconds % 60;

        element.textContent = `${minutes}m ${seconds}s ago`;

        if (differenceInSeconds > 80 && currentTimestamp - lastFetchTimestamp > 30) {
            lastFetchTimestamp = currentTimestamp;
            getLatestData();
            console.log("Fetching new data...");
        }
    } else {
        console.error('Element with ID "time-ago" not found or latestMineData is not available.');
    }
}

function updateAverageHashrate() {
    if (!Array.isArray(challengesData) || challengesData.length === 0) {
        console.warn('No challenge data available.');
        return;
    }

    const totalDifficulty = challengesData.reduce((sum, item) => sum + item.difficulty, 0);

    const averageDifficulty = totalDifficulty / challengesData.length;

    const averagePoolHashrate = Math.pow(2, averageDifficulty) / 60;

    const formattedHashrate = Math.round(averagePoolHashrate).toLocaleString();

    const element = document.getElementById('averageHashrate');

    element.textContent = `${formattedHashrate} H/s`;
    console.log(`Average Pool Hashrate: ${formattedHashrate} H/s`);
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
    updateAverageHashrate();

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

function updateDayEarnings() {
    const element = document.getElementById('dayEarnings')

    if (!Array.isArray(challengesData) || challengesData.length === 0) {
        console.warn('No challenge data available.');
        return;
    }

    const totalRewards = challengesData.reduce((sum, item) => sum + item.rewards_earned, 0);

    const result = totalRewards / 100000000000;

    if (element) {
        element.textContent = result;
    } else {
        console.error('Element with ID "dayEarnings" not found.');
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

function updateDifficultyOverTime() {
    if (!Array.isArray(challengesData) || challengesData.length === 0) {
        console.warn('No challenge data available.');
        return;
    }

    const difficulties = challengesData.map(item => item.difficulty);
    const labels = challengesData.map((_, index) => index + 1);

    const interval = 3;
    const filteredLabels = [];
    const filteredDifficulties = [];

    for (let i = 0; i < labels.length; i += interval) {
        filteredLabels.unshift(labels[i]);
        filteredDifficulties.unshift(difficulties[i]);
    }

    // Find min and max difficulty for y-axis
    const minDifficulty = Math.min(...difficulties);
    const maxDifficulty = Math.max(...difficulties);

    const ctx = document.getElementById('difficultyOverTime').getContext('2d');

    if (difficultyOverTimeChart) {
        difficultyOverTimeChart.destroy();
    }

    difficultyOverTimeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: filteredLabels,
            datasets: [{
                label: 'Difficulty',
                data: filteredDifficulties,
                backgroundColor: 'rgba(153, 102, 255, 0.2)', 
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Difficulty Over Time (24hr)',
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
                    display: false,
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#fff',
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#fff',
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    },
                    min: minDifficulty - 1,
                    max: maxDifficulty + 1
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
    getPoolRewards();
    getPoolStake();
    getClientData();
    getPoolMultiplier();
}

getLatestData();
setInterval(updateTimeAgo, 1000);
