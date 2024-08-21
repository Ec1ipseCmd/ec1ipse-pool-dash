const ctxHashrate = document.getElementById('hashrateChart').getContext('2d');
const gradientHashrate = ctxHashrate.createLinearGradient(0, 0, 0, 400);
gradientHashrate.addColorStop(0, 'rgba(0, 255, 127, 0.7)');
gradientHashrate.addColorStop(1, 'rgba(0, 255, 127, 0)');

const hashrateData = {
    labels: ['0h', '2h', '4h', '6h', '8h', '10h', '12h'],
    datasets: [{
        label: 'Hashrate (TH/s)',
        data: [1.0, 1.1, 1.2, 1.15, 1.2, 1.18, 1.2],
        backgroundColor: gradientHashrate,
        borderColor: 'rgba(0, 255, 127, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0
    }]
};

new Chart(ctxHashrate, {
    type: 'line',
    data: hashrateData,
    options: {
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
        },
        plugins: {
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#00ff7f',
                bodyColor: '#fff',
                cornerRadius: 4,
                padding: 10
            },
            legend: {
                display: false,
            }
        },
        elements: {
            line: {
                tension: 0.4
            }
        }
    }
});

const ctxEarnings = document.getElementById('earningsChart').getContext('2d');
const gradientEarnings = ctxEarnings.createLinearGradient(0, 0, 0, 400);
gradientEarnings.addColorStop(0, 'rgba(0, 255, 127, 0.7)');
gradientEarnings.addColorStop(1, 'rgba(0, 255, 127, 0)');

const earningsData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: [{
        label: 'Earnings (BTC)',
        data: [10, 15, 12, 14, 20, 25, 30],
        backgroundColor: gradientEarnings,
        borderColor: 'rgba(0, 255, 127, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0
    }]
};

new Chart(ctxEarnings, {
    type: 'line',
    data: earningsData,
    options: {
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
        },
        plugins: {
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#00ff7f',
                bodyColor: '#fff',
                cornerRadius: 4,
                padding: 10
            },
            legend: {
                display: false,
            }
        },
        elements: {
            line: {
                tension: 0.4
            }
        }
    }
});

let transactionData = [];

async function getTransactions() {
    const apiUrl = `https://api.helius.xyz/v0/addresses/mineXqpDeBeMR8bPQCyy9UneJZbjFywraS3koWZ8SSH/transactions?api-key=c504b465-785b-4564-a939-c03fa9eb968f`;

    try {
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

            // Calculate the time ago
            const now = Math.floor(Date.now() / 1000);
            const timeAgo = now - timestamp;
            const seconds = timeAgo % 60;
            const minutes = Math.floor(timeAgo / 60) % 60;

            const timeAgoString = `${minutes}m ${seconds}s ago`;

            recentTxnElement.innerHTML = `Latest Mine Transaction: <a href="https://solscan.io/tx/${signature}" target="_blank">${signature}</a> (${timeAgoString})`;

            if (timeAgo >= 80) {
                getTransactions();
            }
        } else {
            recentTxnElement.textContent = 'No recent transactions available';
        }
    }
}

let latestChallengeData = [];

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

    } catch (error) {
        console.error('Error fetching active miners data:', error);
        document.getElementById('activeMiners').textContent = 'Error loading data';
    }
}

function calculateAndDisplayPoolHashrate() {
    let totalHashrate = 0;

    latestChallengeData.forEach(miner => {
        const value = (Math.pow(2, miner.difficulty)) / 60;
        totalHashrate += value;
    });

    const roundedHashrate = Math.round(totalHashrate);

    console.log('Estimated Pool Hashrate:', roundedHashrate);

    if (totalHashrate != 0) {
        const totalHashrateElement = document.getElementById('totalHashrate');
        if (totalHashrateElement) {
            totalHashrateElement.textContent = `${roundedHashrate} H/s`;
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

function updateDashboard() {
    updateActiveMiners();
}

getTransactions();
updateDashboard();
setInterval(updateDashboard, 60000);
setInterval(updateMostRecentTransaction, 1000);
