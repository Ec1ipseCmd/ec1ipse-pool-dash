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
        console.log(activeMinersData);
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
        console.log(poolRewardsData);
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
        console.log('Legacy Stake Data:', poolStakeData);
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
        console.log(clientData);
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
        renderPieCharts();
    } catch (error) {
        console.error('Error fetching boost multipliers:', error);
    }
}

function renderBoostTable() {
    if (!boostMultipliersData) return;

    const boostTableBody = document.querySelector('#boostTable tbody');
    boostTableBody.innerHTML = '';

    boostMultipliersData.forEach(item => {
        let boostName = '';
        let multiplierText = '';

        switch(item.boost_mint) {
            case 'oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp':
                boostName = 'ORE';
                multiplierText = '(16x - 16% rewards)';
                break;
            case 'DrSS5RM7zUd9qjUEdDaf31vnDUSbCrMto6mjqTrHFifN':
                boostName = 'ORE-SOL LP';
                multiplierText = '(26x - 24% rewards)';
                break;
            case 'meUwDp23AaxhiNKaQCyJ2EAF2T4oe1gSkEkGXSRVdZb':
                boostName = 'ORE-ISC LP';
                multiplierText = '(20x - 20% rewards)';
                break;
            default:
                boostName = `Unknown Boost (${item.boost_mint})`;
                console.warn(`Unknown boost_mint: ${item.boost_mint}`);
        }

        const percentage = ((item.staked_balance / item.total_stake_balance) * 100).toFixed(2);

        const row = document.createElement('tr');

        const boostCell = document.createElement('td');
        boostCell.innerHTML = `${boostName} <span style="font-size: 0.85em; color: rgba(255, 255, 255, 0.35); margin-left: 4px;">${multiplierText}</span>`;

        const stakedBalanceCell = document.createElement('td');
        stakedBalanceCell.textContent = formatNumber(item.staked_balance);

        const totalStakeBalanceCell = document.createElement('td');
        totalStakeBalanceCell.textContent = formatNumber(item.total_stake_balance);

        const percentageCell = document.createElement('td');
        percentageCell.textContent = `${percentage}%`;

        row.appendChild(boostCell);
        row.appendChild(stakedBalanceCell);
        row.appendChild(totalStakeBalanceCell);
        row.appendChild(percentageCell);

        boostTableBody.appendChild(row);
    });
}


function updatePoolMultiplier() {
    const element = document.getElementById('poolMultiplier');

    if (element && stakeData) {
        let formattedMultiplier = 0;

        if (boostMultipliersData && Array.isArray(boostMultipliersData)) {
            console.log("Boost multipliers data:", boostMultipliersData);

            boostMultipliersData.forEach((boost, index) => {
                const { multiplier, staked_balance, total_stake_balance } = boost;

                console.log(`Boost #${index + 1}: multiplier=${multiplier}, staked_balance=${staked_balance}, total_stake_balance=${total_stake_balance}`);

                if (multiplier && staked_balance && total_stake_balance > 0) {
                    const contribution = (multiplier * staked_balance) / total_stake_balance;
                    console.log(`Contribution for boost #${index + 1}: ${contribution.toFixed(4)}`);
                    formattedMultiplier += contribution;
                } else {
                    console.warn(`Invalid data for boost #${index + 1}: Skipping calculation due to missing or zero values.`);
                }
            });
        } else {
            console.warn("Boost multipliers data is missing or not an array.");
        }

        if (formattedMultiplier < 2.00) {
            element.innerHTML = "Loading... ";
        } else {
            element.innerHTML = formattedMultiplier.toFixed(2);
        }
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
            legacyStakeElement.innerHTML = scaledLegacyStake;
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
    getPoolMultiplier();
}

getLatestData();

setInterval(updateTimeAgo, 1000);

function getTokenName(boostMint) {
    const mapping = {
        'oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp': 'ORE',
        'DrSS5RM7zUd9qjUEdDaf31vnDUSbCrMto6mjqTrHFifN': 'ORE-SOL LP',
        'meUwDp23AaxhiNKaQCyJ2EAF2T4oe1gSkEkGXSRVdZb': 'ORE-ISC LP',
    };
    return mapping[boostMint] || 'Unknown Token';
}

function renderPieCharts() {
    if (!boostMultipliersData) {
        console.error('Boost multipliers data is not available.');
        return;
    }
    
    boostMultipliersData.forEach(item => {
        const tokenName = getTokenName(item.boost_mint);
        if (tokenName === 'Unknown Token') {
            return;
        }

        const yourBalance = parseFloat(item.staked_balance) || 0;
        const totalBalance = parseFloat(item.total_stake_balance) || 0;
        const othersBalance = Math.max(totalBalance - yourBalance, 0);

        let containerId = '';
        switch(item.boost_mint) {
            case 'oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp':
                containerId = 'oreChart';
                break;
            case 'DrSS5RM7zUd9qjUEdDaf31vnDUSbCrMto6mjqTrHFifN':
                containerId = 'oresolLpChart';
                break;
            case 'meUwDp23AaxhiNKaQCyJ2EAF2T4oe1gSkEkGXSRVdZb':
                containerId = 'oreiscLpChart';
                break;
            default:
                console.warn(`No container defined for boost_mint: ${item.boost_mint}`);
                return;
        }

        Highcharts.chart(containerId, {
            chart: {
                type: 'pie',
                options3d: {
                    enabled: true,
                    alpha: 45,
                    beta: 0
                },
                backgroundColor: 'transparent',
                height: 400,
                animation: false
            },
            title: {
                text: tokenName,
                y: 65,
                style: {
                    color: '#e0e0e0',
                    fontSize: '20px'
                },
            },
            plotOptions: {
                pie: {
                    innerSize: 0,
                    size: '75%',
                    depth: 30,
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}: {point.percentage:.2f} %',
                        style: {
                            color: '#b0b0b0',
                            fontSize: '10px'
                        }
                    },
                    borderColor: '#FFFFFF',
                    borderWidth: 1,
                    shadow: false,
                    animation: false
                }
            },
            series: [{
                name: 'Staked',
                data: [
                    { name: 'Ec1ipse', y: yourBalance, color: '#00e676' },
                    { name: "Others'", y: othersBalance, color: '#424242' }
                ]
            }],
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                style: {
                    color: '#FFFFFF'
                },
                formatter: function() {
                    const tokenName = this.series.name;
                    const tokenTitle = getTokenName(item.boost_mint);
                    const pointName = this.point.name;
                    const pointValue = this.y;
                    const pointPercentage = this.point.percentage.toFixed(2);
                    return `<strong>${tokenName}</strong><br/>${pointName}: ${pointValue} ${tokenTitle} (${pointPercentage}%)`;
                }
            },
            
        });
    });
}
