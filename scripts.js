let transactionData = [];
let latestChallengeData = [];
let difficultyCounts = {};
let difficultyChart;

async function getTransactions() {
    const encodedUrl = "aHR0cHM6Ly9hcGkuaGVsaXVzLnh5ei92MC9hZGRyZXNzZXMvbWluZVhxcERlQmVNUjhiUFFDeXk5VW5lSlpiakZ5d3JhUzNrb1daOFNTSC90cmFuc2FjdGlvbnM/YXBpLWtleT1jNTA0YjQ2NS03ODViLTQ1NjQtYTkzOS1jMDNmYTllYjk2OGY=";

    try {
        const apiUrl = atob(encodedUrl);
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        transactionData = data.filter(tx =>
            tx.tokenTransfers.length === 0 && tx.description === ""
        );

        updateActiveMiners();

        console.log('Transaction data fetched and stored');
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

function updateMostRecentTransaction() {
    const recentTxnElement = document.getElementById('recent-txn');
    if (recentTxnElement) {
        if (transactionData.length > 0) {
            const signature = transactionData[0].signature;
            const timestamp = transactionData[0].timestamp;
            const now = Math.floor(Date.now() / 1000);
            const timeAgo = now - timestamp;
            const seconds = timeAgo % 60;
            const minutes = Math.floor(timeAgo / 60) % 60;

            const timeAgoString = `${minutes}m ${seconds}s ago`;

            recentTxnElement.innerHTML = `Latest Mine Transaction: <a href="https://solscan.io/tx/${signature}" target="_blank">${signature}</a> (${timeAgoString})`;

            if (timeAgo >= 80) {
                getTransactions();
                setTimeout(console.log("Waiting for data..."), 5000)
            }
        } else {
            recentTxnElement.textContent = 'No recent transactions available';
        }
    }
}

async function updateActiveMiners() {
    const url = 'https://domainexpansion.tech/last-challenge-submissions';
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        latestChallengeData = await response.json();
        const activeMinersCount = latestChallengeData.length;
        console.log('Active Miners Count:', activeMinersCount);
        
        const activeMinersElement = document.getElementById('activeMiners');
        activeMinersElement.textContent = `${activeMinersCount}`;

        calculateAndDisplayPoolHashrate();
        findAndDisplayHighestDifficulty();
        countDifficulties();

    } catch (error) {
        console.error('Error fetching active miners data:', error);
        document.getElementById('activeMiners').textContent = 'Error loading data';
    }
}

function calculateAndDisplayPoolHashrate() {
    let totalDifficulty = 0;

    latestChallengeData.forEach(miner => {
        totalDifficulty += miner.difficulty;
    });

    const avgDifficulty = totalDifficulty / latestChallengeData.length;
    const avgHashrate = (Math.pow(2, avgDifficulty)) / 60;
    const totalHashrate = avgHashrate * latestChallengeData.length;

    const roundedHashrate = Math.round(totalHashrate);

    console.log('Estimated Pool Hashrate:', roundedHashrate);

    if (totalHashrate !== 0) {
        const totalHashrateElement = document.getElementById('totalHashrate');
        if (totalHashrateElement) {
            totalHashrateElement.textContent = `${roundedHashrate.toLocaleString()} H/s`;
        } else {
            console.error('Element with ID "totalHashrate" not found.');
        }
    }
}

function findAndDisplayHighestDifficulty() {
    if (latestChallengeData.length === 0) {
        console.warn('No challenge data available to find the highest difficulty.');
        return;
    }

    const latestDifficulty = latestChallengeData.reduce((max, miner) => {
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

let difficultyHistogramChart;

function countDifficulties() {
    console.log("Called")
    if (latestChallengeData.length === 0) {
        console.warn('No challenge data available.');
        return;
    }

    difficultyCounts = {};

    latestChallengeData.forEach(miner => {
        const difficulty = miner.difficulty;
        if (difficulty in difficultyCounts) {
            difficultyCounts[difficulty]++;
        } else {
            difficultyCounts[difficulty] = 1;
        }
    });

    console.log('Difficulty counts:', difficultyCounts);

    const countLabels = Object.keys(difficultyCounts);
    const countValues = Object.values(difficultyCounts);

    const ctxDifficultyCount = document.getElementById('difficultyHistogram').getContext('2d');

    const gradientDifficultyCount = ctxDifficultyCount.createLinearGradient(0, 0, 0, 400);
    gradientDifficultyCount.addColorStop(0, 'rgba(153, 102, 255, 0.7)');
    gradientDifficultyCount.addColorStop(1, 'rgba(153, 102, 255, 0)');

    if (difficultyHistogramChart) {
        difficultyHistogramChart.destroy();
    }

    difficultyHistogramChart = new Chart(ctxDifficultyCount, {
        type: 'bar',
        data: {
            labels: countLabels,
            datasets: [{
                label: 'Difficulty Count',
                data: countValues,
                backgroundColor: gradientDifficultyCount,
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Difficulty Histogram From Latest Mine Submissions',
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

getTransactions();
setInterval(updateMostRecentTransaction, 1000);
