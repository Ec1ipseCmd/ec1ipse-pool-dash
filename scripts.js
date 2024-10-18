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

// Variables to store fetched data for table rendering
let boostMultipliersData = null;
let legacyStakeData = null;

// Helper function to format numbers with 11 decimal places
function formatNumber(number) {
    return parseFloat(number).toLocaleString(undefined, { 
        minimumFractionDigits: 11, 
        maximumFractionDigits: 11 
    });
}

// Function to fetch and update the latest mine data
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
        console.error('Error fetching latest mine data:', error);
    }
}

// Function to fetch and update the latest submissions data
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
        console.error('Error fetching latest submissions data:', error);
    }
}

// Function to fetch and update challenges data
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
        updateHighestDayDifficulty();
        updateDifficultyOverTime();
        console.log(challengesData);
    } catch (error) {
        console.error('Error fetching challenges data:', error);
    }
}

// Function to fetch and update active miners data
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
        console.error('Error fetching active miners data:', error);
    }
}

// Function to fetch and update pool rewards data
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
        console.error('Error fetching pool rewards data:', error);
    }
}

// Function to fetch and update pool stake data (Legacy)
async function getStakeOreLegacy() {
    const url = 'https://domainexpansion.tech/pool/staked';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        poolStakeData = data;
        console.log('Legacy Stake Data:', poolStakeData);
        legacyStakeData = poolStakeData;
        renderBoostTable();
    } catch (error) {
        console.error('Error fetching Staked ORE (Legacy) data:', error);
    }
}

// Function to fetch and update client data
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
        console.error('Error fetching client data:', error);
    }
}

// Function to fetch and update pool multiplier data
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
        console.error('Error fetching pool multiplier data:', error);
    }
}

// Function to fetch and update Boost Multipliers
async function getBoostMultipliers() {
    const url = 'https://domainexpansion.tech/boost-multiplier';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        boostMultipliersData = data;
        console.log('Boost Multipliers Data:', boostMultipliersData);
        renderBoostTable();
    } catch (error) {
        console.error('Error fetching boost multipliers:', error);
    }
}

// Function to render the Boost Overview table
function renderBoostTable() {
    // Ensure both Boost Multipliers and Legacy Stake data are available
    if (!boostMultipliersData || !legacyStakeData) {
        return; // Wait until both datasets are fetched
    }

    // Get reference to the boost table body
    const boostTableBody = document.querySelector('#boostTable tbody');
    boostTableBody.innerHTML = ''; // Clear existing rows

    // Iterate over Boost Multipliers and add rows
    boostMultipliersData.forEach(item => {
        let boostName = '';
        switch(item.boost_mint) {
            case 'oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp':
                boostName = 'ORE Boost';
                break;
            case 'DrSS5RM7zUd9qjUEdDaf31vnDUSbCrMto6mjqTrHFifN':
                boostName = 'ORE-SOL LP Boost';
                break;
            case 'meUwDp23AaxhiNKaQCyJ2EAF2T4oe1gSkEkGXSRVdZb':
                boostName = 'ORE-ISC LP Boost';
                break;
            default:
                boostName = `Unknown Boost (${item.boost_mint})`;
                console.warn(`Unknown boost_mint: ${item.boost_mint}`);
        }

        // Calculate percentage: (staked_balance / total_stake_balance) * 100
        const percentage = ((item.staked_balance / item.total_stake_balance) * 100).toFixed(2);

        // Create table row
        const row = document.createElement('tr');

        // Create cells
        const boostCell = document.createElement('td');
        boostCell.textContent = boostName;

        const stakedBalanceCell = document.createElement('td');
        stakedBalanceCell.textContent = formatNumber(item.staked_balance);

        const totalStakeBalanceCell = document.createElement('td');
        totalStakeBalanceCell.textContent = formatNumber(item.total_stake_balance);

        const percentageCell = document.createElement('td');
        percentageCell.textContent = `${percentage}%`;

        // Append cells to row
        row.appendChild(boostCell);
        row.appendChild(stakedBalanceCell);
        row.appendChild(totalStakeBalanceCell);
        row.appendChild(percentageCell);

        // Append row to table body
        boostTableBody.appendChild(row);
    });
}

// Function to update the staking multiplier display
function updatePoolMultiplier() {
    const element = document.getElementById('poolMultiplier');

    if (element && stakeData) {
        var formattedMultiplier = stakeData;
        if (boostMultipliersData != null){
            const oreoBoost = boostMultipliersData[0].multiplier * boostMultipliersData[0].staked_balance / boostMultipliersData[0].total_stake_balance;
            const oresolBoost = boostMultipliersData[1].multiplier * boostMultipliersData[1].staked_balance / boostMultipliersData[1].total_stake_balance;
            const oreiscBoost = boostMultipliersData[2].multiplier * boostMultipliersData[2].staked_balance / boostMultipliersData[2].total_stake_balance;
            formattedMultiplier = formattedMultiplier + oreoBoost + oresolBoost + oreiscBoost;
        }
        element.innerHTML = parseFloat(formattedMultiplier).toFixed(2);
    } else {
        console.error('Element with ID "poolMultiplier" not found or stakeData is not available.');
    }
}

// Function to update the latest client version and update time
function updateNewestVersionAndTime() {
    const newestVersionElement = document.getElementById('latestVersion');
    const latestUpdateElement = document.getElementById('latestVersionUpdate');

    if (newestVersionElement && latestUpdateElement && clientData) {
        const newestVersion = clientData.crate.newest_version;
        const updatedAtTimestamp = new Date(clientData.crate.updated_at).getTime();
        const nowTimestamp = Date.now();
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

        newestVersionElement.innerHTML = newestVersion;
        latestUpdateElement.innerHTML = timeAgo;
    } else {
        console.error('Element with ID "latestVersion" or "latestVersionUpdate" not found or clientData is not available.');
    }
}

// Function to update the latest transaction display
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

// Function to update the highest day difficulty
function updateHighestDayDifficulty() {
    const element = document.getElementById('highestDayDifficulty');

    if (element && challengesData) {
        let highestDifficulty = challengesData[0].difficulty;

        challengesData.forEach(challenge => {
            if (challenge.difficulty > highestDifficulty) {
                highestDifficulty = challenge.difficulty;
            }
        });

        element.innerHTML = highestDifficulty;
    } else {
        console.error('Element with ID "highestDayDifficulty" not found or challengesData is not available.');
    }
}

// Function to update the pool rewards display
function updatePoolRewards() {
    const rewardsElement = document.getElementById('poolRewards');
    const rewardsClaimedElement = document.getElementById('claimedRewards');
    const legacyStakeElement = document.getElementById('legacyStake');
    
    if (rewardsElement && rewardsClaimedElement && poolRewardsData) {
        const rewards = poolRewardsData.total_rewards / 100000000000;
        const claimedRewards = poolRewardsData.claimed_rewards / 100000000000;

        const legacyStakeNumber = typeof legacyStakeData === 'number' ? legacyStakeData : parseFloat(legacyStakeData);
        // **Scale the value by dividing by 100000000000**
        const scaledLegacyStake = legacyStakeNumber / 100000000000;
        legacyStakeElement.innerHTML = formatNumber(scaledLegacyStake);

        rewardsElement.innerHTML = formatNumber(rewards);
        rewardsClaimedElement.innerHTML = formatNumber(claimedRewards);
    } else {
        console.error('Element with ID "poolRewards" or "claimedRewards" not found or poolRewardsData is not available.');
    }
}

// Function to update the "time ago" display for the latest transaction
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

        if (differenceInSeconds > 70 && currentTimestamp - lastFetchTimestamp > 30) {
            lastFetchTimestamp = currentTimestamp;
            getLatestData();
            console.log("Fetching new data...");
        }
    } else {
        console.error('Element with ID "time-ago" not found or latestMineData is not available.');
    }
}

// Function to update the average pool hashrate
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

// Function to update the latest difficulty
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

// Function to update the active miners count
function updateActiveMiners() {
    const element = document.getElementById('activeMiners');
    
    if (element) {
        element.textContent = activeMinersData;
    } else {
        console.error('Element with ID "activeMiners" not found.');
    }
}

// Function to update the day's earnings
function updateDayEarnings() {
    const element = document.getElementById('dayEarnings')

    if (!Array.isArray(challengesData) || challengesData.length === 0) {
        console.warn('No challenge data available.');
        return;
    }

    const totalRewards = challengesData.reduce((sum, item) => sum + item.rewards_earned, 0);

    const result = totalRewards / 100000000000;

    if (element) {
        element.textContent = formatNumber(result);
    } else {
        console.error('Element with ID "dayEarnings" not found.');
    }
}

// Function to update the difficulty histogram chart
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

// Function to update the difficulty over time chart
function updateDifficultyOverTime() {
    if (!Array.isArray(challengesData) || challengesData.length === 0) {
        console.warn('No challenge data available.');
        return;
    }

    // Count the occurrences of each difficulty
    const difficultyCounts = {};
    challengesData.forEach(item => {
        const difficulty = item.difficulty;
        if (difficultyCounts[difficulty]) {
            difficultyCounts[difficulty]++;
        } else {
            difficultyCounts[difficulty] = 1;
        }
    });

    // Get difficulties and their counts
    const difficulties = Object.keys(difficultyCounts);
    const counts = difficulties.map(difficulty => difficultyCounts[difficulty]);

    const ctx = document.getElementById('difficultyOverTime').getContext('2d');

    // Destroy the previous chart if it exists
    if (difficultyOverTimeChart) {
        difficultyOverTimeChart.destroy();
    }

    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(153, 102, 255, 0.7)');
    gradient.addColorStop(1, 'rgba(153, 102, 255, 0)');

    // Create a new histogram chart
    difficultyOverTimeChart = new Chart(ctx, {
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
                    text: 'Pool Submission Difficulty Histogram (24hr)',
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

// Function to fetch all necessary data
function getLatestData() {
    getLatestMine();
    getLatestSubmissions();
    getChallenges();
    getActiveMiners();
    getPoolRewards();
    getStakeOreLegacy();
    getBoostMultipliers();
    getClientData();
    getPoolMultiplier();
}

// Initial data fetch
getLatestData();

// Update the "time ago" every second
setInterval(updateTimeAgo, 1000);
