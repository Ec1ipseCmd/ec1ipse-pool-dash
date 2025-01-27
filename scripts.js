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

let boostMultipliersData = null;
let legacyStakeData = null;

function formatNumber(number) {
    if (Number.isInteger(number)) {
        return number.toLocaleString();
    } else {
        return parseFloat(number).toLocaleString(undefined, { 
            minimumFractionDigits: 3, 
            maximumFractionDigits: 4 
        });
    }
}

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

async function getChallenges() {
    const url = 'https://domainexpansion.tech/challenges';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        challengesData = data;
        updateAverageHashrate();
        updateDayEarnings();
        updateHighestDayDifficulty();
        updateDifficultyOverTime();
        
        console.log(challengesData);
    } catch (error) {
        console.error('Error fetching challenges data:', error);
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
        // console.log(activeMinersData);
        updateActiveMiners();
    } catch (error) {
        console.error('Error fetching active miners data:', error);
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
        // console.log(poolRewardsData);
        updatePoolRewards();
    } catch (error) {
        console.error('Error fetching pool rewards data:', error);
    }
}

async function getStakeOreLegacy() {
    const url = 'https://domainexpansion.tech/pool/staked';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        poolStakeData = data;
        // console.log('Legacy Stake Data:', poolStakeData);
        legacyStakeData = poolStakeData;
        updatePoolRewards();
    } catch (error) {
        console.error('Error fetching Staked ORE (Legacy) data:', error);
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
        // console.log(clientData);
        updateNewestVersionAndTime();
    } catch (error) {
        console.error('Error fetching client data:', error);
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
        console.error('Error fetching pool multiplier data:', error);
    }
}

async function getBoostMultipliers() {
    const DUNE_API_KEY = 'bT8tNS1pJyWWnBWL04Hme1EkMkySyqfG';
    const DUNE_QUERY_ID = '4626984';
    const url = `https://api.dune.com/api/v1/query/${DUNE_QUERY_ID}/results`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'X-Dune-API-Key': DUNE_API_KEY
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Raw Dune data:', data);
        
        // Find the entry for Ec1ipse (HQ)
        if (data.result && data.result.rows) {
            const eclipseData = data.result.rows.find(row => row.signer === 'Ec1ipse (HQ)');
            if (eclipseData) {
                // Store the boost multiplier
                boostMultipliersData = eclipseData.avg_multiplier + 1;
                
                // Log all the detailed information
                console.log('Ec1ipse (HQ) Mining Statistics:');
                console.log('--------------------------------');
                console.log('Total Yield:', eclipseData.yield.toFixed(4));
                console.log('Physical Yield:', eclipseData.physical_yield.toFixed(4));
                console.log('Virtual Yield:', eclipseData.virtual_yield.toFixed(4));
                console.log('Boost Multiplier:', (eclipseData.avg_multiplier + 1).toFixed(4));
                console.log('Average Reward:', eclipseData.avg_reward.toFixed(4));
                console.log('Maximum Reward:', eclipseData.max_reward.toFixed(4));
                console.log('Maximum Difficulty:', eclipseData.max_difficulty);
                console.log('Total Events:', eclipseData.events);
                console.log('--------------------------------');
                
                // Update pool multiplier display
                updatePoolMultiplier();

                // Update all earnings displays
                const dayEarningsElement = document.getElementById('dayEarnings');
                const physicalEarningsElement = document.getElementById('physicalEarnings');
                const multiplierEarningsElement = document.getElementById('multiplierEarnings');

                if (dayEarningsElement) {
                    dayEarningsElement.innerHTML = formatNumber(eclipseData.yield);
                }
                if (physicalEarningsElement) {
                    physicalEarningsElement.innerHTML = formatNumber(eclipseData.physical_yield);
                }
                if (multiplierEarningsElement) {
                    multiplierEarningsElement.innerHTML = formatNumber(eclipseData.virtual_yield);
                }
            } else {
                console.error('No data found for Ec1ipse (HQ)');
            }
        } else {
            console.error('No data received from Dune query');
        }
    } catch (error) {
        console.error('Error fetching boost multipliers from Dune:', error);
    }
}

function updatePoolMultiplier() {
    const element = document.getElementById('poolMultiplier');

    if (element && boostMultipliersData) {
        // Format the multiplier to 2 decimal places
        const formattedMultiplier = parseFloat(boostMultipliersData).toFixed(2);
        
        if (formattedMultiplier < 0.00) {
            element.innerHTML = "Loading... ";
        } else {
            element.innerHTML = formattedMultiplier;
        }
    } else {
        console.error('Element with ID "poolMultiplier" not found or multiplier data is not available.');
    }
}

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

function updatePoolRewards() {
    const rewardsElement = document.getElementById('poolRewards');
    const rewardsClaimedElement = document.getElementById('claimedRewards');
    const legacyStakeElement = document.getElementById('legacyStake');
    
    if (rewardsElement && rewardsClaimedElement && poolRewardsData) {
        const rewards = poolRewardsData.total_rewards / 100000000000;
        const claimedRewards = poolRewardsData.claimed_rewards / 100000000000;

        if (legacyStakeData != null){
            const legacyStakeNumber = typeof legacyStakeData === 'number' ? legacyStakeData : parseFloat(legacyStakeData);
            const scaledLegacyStake = legacyStakeNumber / 100000000000;
            legacyStakeElement.innerHTML = formatNumber(scaledLegacyStake);

        }

        rewardsElement.innerHTML = formatNumber(rewards);
        rewardsClaimedElement.innerHTML = formatNumber(claimedRewards);
    } else {
        console.error('Element with ID "poolRewards" or "claimedRewards" not found or poolRewardsData is not available.');
    }
}

function updateTimeAgo() {
    const element = document.getElementById('time-ago');
    
    if (element && latestMineData) {
        const createdAt = new Date(latestMineData.created_at + 'Z');
        const currentTimestamp = Date.now();
        
        const differenceInSeconds = Math.floor((currentTimestamp - createdAt.getTime()) / 1000);
        
        if (differenceInSeconds < 0) {
            element.textContent = "Just now";
            return;
        }
        
        const minutes = Math.floor(differenceInSeconds / 60);
        const seconds = differenceInSeconds % 60;

        element.textContent = `${minutes}m ${seconds}s ago`;

        if (differenceInSeconds > 70 && currentTimestamp - lastFetchTimestamp > 30000) {
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
    // console.log(`Average Pool Hashrate: ${formattedHashrate} H/s`);
}

function updateLatestDifficulty() {
    if (latestSubmissionsData.length === 0) {
        console.warn('No challenge data available to find the highest difficulty.');
        return;
    }

    latestDifficulty = latestSubmissionsData.reduce((max, miner) => {
        return miner.difficulty > max ? miner.difficulty : max;
    }, 0);
    // console.log('Latest Pool Difficulty:', latestDifficulty)
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
        element.textContent = formatNumber(activeMinersData);
    } else {
        console.error('Element with ID "activeMiners" not found.');
    }
}

function updateMultiplierEarnings() {
    const element = document.getElementById('multiplierEarnings');

    if (!Array.isArray(challengesData) || challengesData.length === 0) {
        console.warn('No challenge data available.');
        return;
    }

    const totalRewards = challengesData.reduce((sum, item) => sum + item.rewards_earned, 0);
    const baseResult = totalRewards / 100000000000;
    
    // Calculate virtual yield using the boost multiplier
    const virtualYield = boostMultipliersData ? baseResult * (boostMultipliersData - 1) : 0;

    if (element) {
        element.textContent = formatNumber(virtualYield);
    } else {
        console.error('Element with ID "multiplierEarnings" not found.');
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
        element.textContent = formatNumber(result);
        // Update multiplier earnings when day earnings are updated
        updateMultiplierEarnings();
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

    const difficultyCounts = {};
    challengesData.forEach(item => {
        const difficulty = item.difficulty;
        if (difficultyCounts[difficulty]) {
            difficultyCounts[difficulty]++;
        } else {
            difficultyCounts[difficulty] = 1;
        }
    });

    const difficulties = Object.keys(difficultyCounts);
    const counts = difficulties.map(difficulty => difficultyCounts[difficulty]);

    const ctx = document.getElementById('difficultyOverTime').getContext('2d');

    if (difficultyOverTimeChart) {
        difficultyOverTimeChart.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(153, 102, 255, 0.7)');
    gradient.addColorStop(1, 'rgba(153, 102, 255, 0)');

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

function getLatestData() {
    getLatestMine();
    getLatestSubmissions();
    getChallenges();
    getActiveMiners();
    getPoolRewards();
    getStakeOreLegacy();
    getBoostMultipliers();
    getClientData();
}

getLatestData();

setInterval(updateTimeAgo, 1000);