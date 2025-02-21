let state = {
    latestMineData: null,
    latestSubmissionsData: null,
    challengesData: null,
    activeMinersData: null,
    difficultyHistogram: null,
    latestDifficulty: null,
    poolRewardsData: null,
    poolStakeData: null,
    clientData: null,
    stakeData: null,
    difficultyOverTimeChart: null,
    lastFetchTimestamp: 0,
    boostMultipliersData: null,
    legacyStakeData: null
};

const REFRESH_INTERVAL = 30000;

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

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

async function fetchData(url, errorMessage) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`${errorMessage}: ${error.message}`);
        return null;
    }
}

async function getLatestMine() {
    const data = await fetchData(
        'https://domainexpansion.tech/txns/latest-mine',
        'Error fetching latest mine data'
    );
    
    if (data) {
        state.latestMineData = data;
        updateLatestTransaction();
    }
}

async function getLatestSubmissions() {
    const data = await fetchData(
        'https://domainexpansion.tech/last-challenge-submissions',
        'Error fetching latest submissions data'
    );
    
    if (data) {
        state.latestSubmissionsData = data;
        updateLatestDifficulty();
        updateDifficultyHistogram();
    }
}

async function getChallenges() {
    const data = await fetchData(
        'https://domainexpansion.tech/challenges',
        'Error fetching challenges data'
    );
    
    if (data) {
        state.challengesData = data;
        updateAverageHashrate();
        updateDayEarnings();
        updateHighestDayDifficulty();
        updateDifficultyOverTime();
    }
}

async function getActiveMiners() {
    const data = await fetchData(
        'https://ec1ipse.me/active-miners',
        'Error fetching active miners data'
    );
    
    if (data) {
        state.activeMinersData = data;
        updateActiveMiners();
    }
}

async function getPoolRewards() {
    const data = await fetchData(
        'https://domainexpansion.tech/pool',
        'Error fetching pool rewards data'
    );
    
    if (data) {
        state.poolRewardsData = data;
        checkAndUpdatePoolRewards();
    }
}

async function getStakeOreLegacy() {
    const data = await fetchData(
        'https://domainexpansion.tech/pool/staked',
        'Error fetching Staked ORE (Legacy) data'
    );
    
    if (data) {
        state.poolStakeData = data;
        state.legacyStakeData = data;
        checkAndUpdatePoolRewards();
    }
}

async function getClientData() {
    const data = await fetchData(
        'https://crates.io/api/v1/crates/ore-hq-client',
        'Error fetching client data'
    );
    
    if (data) {
        state.clientData = data;
        updateNewestVersionAndTime();
    }
}

async function getPoolMultiplier() {
    const data = await fetchData(
        'https://domainexpansion.tech/stake-multiplier',
        'Error fetching pool multiplier data'
    );
    
    if (data) {
        state.stakeData = data;
        updatePoolMultiplier();
    }
}

async function getBoostMultipliers() {
    const DUNE_API_KEY = '4JHqbt0SXhvUp9b4sT0CSqbOvXYnsOGG';
    const DUNE_QUERY_ID = '4212743';
    
    try {
        const response = await fetch(`https://api.dune.com/api/v1/query/${DUNE_QUERY_ID}/results`, {
            headers: { 'X-Dune-API-Key': DUNE_API_KEY }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data?.result?.rows?.length > 0) {
            const eclipseData = data.result.rows[0];
            
            if (eclipseData) {
                state.boostMultipliersData = parseFloat(eclipseData.avg_multiplier) + 1;
                updatePoolMultiplier();
                
                updateElementText('dayEarnings', formatNumber(eclipseData.net_rewards));
                updateElementText('physicalEarnings', formatNumber(eclipseData.base_rewards));
                updateElementText('multiplierEarnings', formatNumber(eclipseData.total_boost_rewards));
            }
        }
    } catch (error) {
        console.error('Error fetching boost multipliers from Dune:', error);
    }
}

function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = text;
    }
}

function checkAndUpdatePoolRewards() {
    if (state.poolRewardsData && state.legacyStakeData) {
        updatePoolRewards();
    }
}

function updatePoolMultiplier() {
    const element = document.getElementById('poolMultiplier');

    if (element) {
        if (state.boostMultipliersData && !isNaN(state.boostMultipliersData)) {
            const formattedMultiplier = parseFloat(state.boostMultipliersData).toFixed(2);
            element.innerHTML = formattedMultiplier;
        } else {
            element.innerHTML = "Loading... ";
        }
    }
}

function updateNewestVersionAndTime() {
    const newestVersionElement = document.getElementById('latestVersion');
    const latestUpdateElement = document.getElementById('latestVersionUpdate');

    if (newestVersionElement && latestUpdateElement && state.clientData) {
        const newestVersion = state.clientData.crate.newest_version;
        const updatedAtTimestamp = new Date(state.clientData.crate.updated_at).getTime();
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
    }
}

function updateLatestTransaction() {
    const element = document.getElementById('recent-txn');
    
    if (element && state.latestMineData) {
        const signature = state.latestMineData.signature;
        const url = `https://solscan.io/tx/${signature}`;

        element.innerHTML = `Latest Mine Transaction: <a href="${url}" target="_blank">${signature}</a> (<span id="time-ago"></span>)`;

        updateTimeAgo();
    }
}

function updateHighestDayDifficulty() {
    const element = document.getElementById('highestDayDifficulty');

    if (element && state.challengesData?.length > 0) {
        let highestDifficulty = state.challengesData[0].difficulty;

        state.challengesData.forEach(challenge => {
            if (challenge.difficulty > highestDifficulty) {
                highestDifficulty = challenge.difficulty;
            }
        });

        element.innerHTML = highestDifficulty;
    }
}

function updatePoolRewards() {
    const rewardsElement = document.getElementById('poolRewards');
    const rewardsClaimedElement = document.getElementById('claimedRewards');
    const legacyStakeElement = document.getElementById('legacyStake');
    
    if (rewardsElement && rewardsClaimedElement && state.poolRewardsData) {
        const rewards = state.poolRewardsData.total_rewards / 100000000000;
        const claimedRewards = state.poolRewardsData.claimed_rewards / 100000000000;

        if (legacyStakeElement && state.legacyStakeData != null) {
            const legacyStakeNumber = typeof state.legacyStakeData === 'number' 
                ? state.legacyStakeData 
                : parseFloat(state.legacyStakeData);
            const scaledLegacyStake = legacyStakeNumber / 100000000000;
            legacyStakeElement.innerHTML = formatNumber(scaledLegacyStake);
        }

        rewardsElement.innerHTML = formatNumber(rewards);
        rewardsClaimedElement.innerHTML = formatNumber(claimedRewards);
    }
}

function updateTimeAgo() {
    const element = document.getElementById('time-ago');
    
    if (element && state.latestMineData) {
        const createdAt = new Date(state.latestMineData.created_at + 'Z');
        const currentTimestamp = Date.now();
        
        const differenceInSeconds = Math.floor((currentTimestamp - createdAt.getTime()) / 1000);
        
        if (differenceInSeconds < 0) {
            element.textContent = "Just now";
            return;
        }
        
        const minutes = Math.floor(differenceInSeconds / 60);
        const seconds = differenceInSeconds % 60;

        element.textContent = `${minutes}m ${seconds}s ago`;

        if (differenceInSeconds > 70 && currentTimestamp - state.lastFetchTimestamp > REFRESH_INTERVAL) {
            state.lastFetchTimestamp = currentTimestamp;
            getLatestData();
        }
    }
}

function updateAverageHashrate() {
    if (!Array.isArray(state.challengesData) || state.challengesData.length === 0) {
        return;
    }

    const totalDifficulty = state.challengesData.reduce((sum, item) => sum + item.difficulty, 0);
    const averageDifficulty = totalDifficulty / state.challengesData.length;
    const averagePoolHashrate = Math.pow(2, averageDifficulty) / 60;
    const formattedHashrate = Math.round(averagePoolHashrate).toLocaleString();
    
    updateElementText('averageHashrate', `${formattedHashrate} H/s`);
}

function updateLatestDifficulty() {
    if (!state.latestSubmissionsData || state.latestSubmissionsData.length === 0) {
        return;
    }

    state.latestDifficulty = state.latestSubmissionsData.reduce((max, miner) => {
        return miner.difficulty > max ? miner.difficulty : max;
    }, 0);

    updateElementText('latestDifficulty', `${state.latestDifficulty}`);
}

function updateActiveMiners() {
    if (state.activeMinersData) {
        updateElementText('activeMiners', formatNumber(state.activeMinersData));
    }
}

function updateMultiplierEarnings() {
    const element = document.getElementById('multiplierEarnings');

    if (!element) {
        return;
    }
    
    if (state.boostMultipliersData) {
        return;
    }
    
    if (!Array.isArray(state.challengesData) || state.challengesData.length === 0) {
        return;
    }

    const totalRewards = state.challengesData.reduce((sum, item) => sum + item.rewards_earned, 0);
    const baseResult = totalRewards / 100000000000;
    const virtualYield = state.boostMultipliersData ? baseResult * (state.boostMultipliersData - 1) : 0;
    element.textContent = formatNumber(virtualYield);
}

function updateDayEarnings() {
    const element = document.getElementById('dayEarnings');

    if (!element) {
        return;
    }
    
    if (state.boostMultipliersData) {
        return;
    }
    
    if (!Array.isArray(state.challengesData) || state.challengesData.length === 0) {
        return;
    }

    const totalRewards = state.challengesData.reduce((sum, item) => sum + item.rewards_earned, 0);
    const result = totalRewards / 100000000000;
    element.textContent = formatNumber(result);
    updateMultiplierEarnings();
}

function updateDifficultyHistogram() {
    if (!state.latestSubmissionsData || state.latestSubmissionsData.length === 0) {
        return;
    }
    
    const difficultyCounts = {};

    state.latestSubmissionsData.forEach(submission => {
        const difficulty = submission.difficulty;
        difficultyCounts[difficulty] = (difficultyCounts[difficulty] || 0) + 1;
    });

    const difficulties = Object.keys(difficultyCounts);
    const counts = difficulties.map(difficulty => difficultyCounts[difficulty]);

    const ctx = document.getElementById('difficultyHistogram')?.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(153, 102, 255, 0.7)');
    gradient.addColorStop(1, 'rgba(153, 102, 255, 0)');

    if (state.difficultyHistogram) {
        state.difficultyHistogram.destroy();
    }

    state.difficultyHistogram = new Chart(ctx, {
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
    if (!Array.isArray(state.challengesData) || state.challengesData.length === 0) {
        return;
    }

    const difficultyCounts = {};
    state.challengesData.forEach(item => {
        const difficulty = item.difficulty;
        difficultyCounts[difficulty] = (difficultyCounts[difficulty] || 0) + 1;
    });

    const difficulties = Object.keys(difficultyCounts);
    const counts = difficulties.map(difficulty => difficultyCounts[difficulty]);

    const ctx = document.getElementById('difficultyOverTime')?.getContext('2d');
    if (!ctx) return;

    if (state.difficultyOverTimeChart) {
        state.difficultyOverTimeChart.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(153, 102, 255, 0.7)');
    gradient.addColorStop(1, 'rgba(153, 102, 255, 0)');

    state.difficultyOverTimeChart = new Chart(ctx, {
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

async function getLatestData() {
    try {
        await Promise.all([
            getBoostMultipliers(),
            getLatestMine(),
            getLatestSubmissions(),
            getChallenges(),
            getActiveMiners(),
            getPoolRewards(),
            getStakeOreLegacy(),
            getClientData(),
            getPoolMultiplier()
        ]);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    getLatestData();
    const debouncedUpdateTimeAgo = debounce(updateTimeAgo, 250);
    setInterval(debouncedUpdateTimeAgo, 1000);
});