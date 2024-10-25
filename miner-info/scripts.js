const urlParams = new URLSearchParams(window.location.search);
const pubkey = urlParams.get('pubkey');
let data = null;
let lastFetchTimestamp = 0;

document.getElementById('minerPubkey').textContent = pubkey;

const dataUrl = `https://domainexpansion.tech/miner/submissions?pubkey=${encodeURIComponent(pubkey)}`;
const apiUrl = `https://ec1ipse.me/v2/miner/boost/stake-accounts?pubkey=${encodeURIComponent(pubkey)}`;
const rewardsUrl = `https://domainexpansion.tech/miner/rewards?pubkey=${encodeURIComponent(pubkey)}`;

let difficultyChart = null;
let avgDifficultyChart = null;
let difficultyCountChart = null;

const tokenLabels = {
    "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp": "ORE",
    "DrSS5RM7zUd9qjUEdDaf31vnDUSbCrMto6mjqTrHFifN": "ORE-SOL",
    "meUwDp23AaxhiNKaQCyJ2EAF2T4oe1gSkEkGXSRVdZb": "ORE-ISC"
};

async function fetchDataAndUpdateCharts() {
    try {
        const dataResponse = await fetch(dataUrl);
        if (!dataResponse.ok) throw new Error('Network response was not ok.');
        data = await dataResponse.json();

        const count = data.length;
        const labels = Array.from({ length: count }, (_, i) => (count - i).toString());
        const difficulties = data.map(item => item.difficulty).reverse();

        document.getElementById('minerId').textContent = data.length > 0 ? data[0].miner_id : 'No data available';

        updateTimeAgo();

        const minDifficulty = Math.min(...difficulties);
        const maxDifficulty = Math.max(...difficulties);

        const ctxDifficulty = document.getElementById('difficultyChart').getContext('2d');
        const gradientDifficulty = ctxDifficulty.createLinearGradient(0, 0, 0, 400);
        gradientDifficulty.addColorStop(0, 'rgba(0, 255, 127, 0.7)');
        gradientDifficulty.addColorStop(1, 'rgba(0, 255, 127, 0)');

        if (difficultyChart) {
            difficultyChart.destroy();
        }

        difficultyChart = new Chart(ctxDifficulty, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Difficulty',
                    data: difficulties,
                    backgroundColor: gradientDifficulty,
                    borderColor: 'rgba(0, 255, 127, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Difficulty From Latest 100 Submissions (1st = Newest)',
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
                        },
                        min: minDifficulty - 1,
                        max: maxDifficulty + 1,
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
                elements: {
                    line: {
                        tension: 0.4
                    }
                }
            }
        });

        const avgDifficulties = difficulties.map((_, i, arr) => {
            const subset = arr.slice(0, i + 1);
            return subset.reduce((sum, val) => sum + val, 0) / subset.length;
        });

        const ctxAvgDifficulty = document.getElementById('avgDifficultyChart').getContext('2d');
        const gradientAvgDifficulty = ctxAvgDifficulty.createLinearGradient(0, 0, 0, 400);
        gradientAvgDifficulty.addColorStop(0, 'rgba(255, 99, 132, 0.7)');
        gradientAvgDifficulty.addColorStop(1, 'rgba(255, 99, 132, 0)');

        if (avgDifficultyChart) {
            avgDifficultyChart.destroy();
        }

        avgDifficultyChart = new Chart(ctxAvgDifficulty, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Difficulty',
                    data: avgDifficulties,
                    backgroundColor: gradientAvgDifficulty,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Average Difficulty From Latest 100 Submissions (1st = Newest)',
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
                        },
                        min: minDifficulty - 1,
                        max: maxDifficulty + 1,
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
                elements: {
                    line: {
                        tension: 0.4
                    }
                }
            }
        });

        const difficultyCount = difficulties.reduce((acc, difficulty) => {
            acc[difficulty] = (acc[difficulty] || 0) + 1;
            return acc;
        }, {});

        const countLabels = Object.keys(difficultyCount);
        const countValues = Object.values(difficultyCount);

        const ctxDifficultyCount = document.getElementById('difficultyCountChart').getContext('2d');
        const gradientDifficultyCount = ctxDifficultyCount.createLinearGradient(0, 0, 0, 400);
        gradientDifficultyCount.addColorStop(0, 'rgba(153, 102, 255, 0.7)');
        gradientDifficultyCount.addColorStop(1, 'rgba(153, 102, 255, 0)');

        if (difficultyCountChart) {
            difficultyCountChart.destroy();
        }

        difficultyCountChart = new Chart(ctxDifficultyCount, {
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
                        text: 'Difficulty Histogram From Latest 100 Submissions',
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

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('minerId').textContent = 'No data available';
    }
}

async function updateRewardsAndStakes() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to load staked balances.");

        const data = await response.json();
        console.log("Data received from API:", data);

        const stakedBalancesList = document.getElementById("stakedBalancesList");
        stakedBalancesList.innerHTML = "";

        let totalStakeRewards = 0; // Initialize total stake rewards

        if (Array.isArray(data) && data.length > 0) {
            const groupedBalances = data.reduce((acc, item) => {
                const tokenLabel = tokenLabels[item.mint_pubkey] || "Unknown Token";

                // Convert to float and trim to a max of 11 decimal places, removing trailing zeroes
                const stakedBalance = (parseFloat(item.staked_balance || 0) / 1e11).toPrecision(11).replace(/\.?0+$/, '');
                const rewardsBalance = (parseFloat(item.rewards_balance || 0) / 1e11).toPrecision(11).replace(/\.?0+$/, '');
                
                totalStakeRewards += parseFloat(rewardsBalance); // Add rewards to total stake rewards
                
                if (!acc[tokenLabel]) {
                    acc[tokenLabel] = { stakedBalance: stakedBalance, rewardsBalances: [] };
                }
                acc[tokenLabel].rewardsBalances.push(rewardsBalance);
                return acc;
            }, {});

            for (const [token, balances] of Object.entries(groupedBalances)) {
                const tokenItem = document.createElement("li");
                tokenItem.innerHTML = `<strong>${balances.stakedBalance}</strong> ${token}`;
                stakedBalancesList.appendChild(tokenItem);

                const rewardList = document.createElement("ul");
                balances.rewardsBalances.forEach(reward => {
                    const rewardItem = document.createElement("li");
                    rewardItem.textContent = `Stake Rewards: ${reward} ORE`;
                    rewardList.appendChild(rewardItem);
                });
                stakedBalancesList.appendChild(rewardList);
            }
        } else {
            stakedBalancesList.textContent = "No staked balances found.";
        }

        // Display the total stake rewards
        const totalStakeRewardsElement = document.getElementById("stakeRewards");
        if (totalStakeRewardsElement) {
            totalStakeRewardsElement.textContent = totalStakeRewards.toPrecision(11).replace(/\.?0+$/, '');
        } else {
            console.error('Element with ID "stakeRewards" not found in the DOM.');
        }
    } catch (error) {
        console.error("Error fetching staked balances:", error);
        document.getElementById("stakedBalancesList").textContent = "Error loading staked balances.";
    }

    // The rest of your existing code for fetching rewards
    try {
        const rewardsResponse = await fetch(rewardsUrl);
        if (!rewardsResponse.ok) throw new Error('Failed to fetch rewards balance.');

        const rewardsData = await rewardsResponse.json();
        const rewardElement = document.getElementById("claimableRewards");
        if (rewardElement) {
            rewardElement.textContent = rewardsData.toPrecision(11).replace(/\.?0+$/, '');
        } else {
            console.error('Element with ID "claimableRewards" not found in the DOM.');
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        const rewardElement = document.getElementById("claimableRewards");
        if (rewardElement) {
            rewardElement.textContent = 'No rewards available';
        } else {
            console.error('Element with ID "claimableRewards" not found in the DOM.');
        }
    }
}


function updateTimeAgo() {
    const element = document.getElementById('lastSubmission');
    if (element && data) {
        const createdAt = data[0].created_at;
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
            fetchDataAndUpdateCharts();
            console.log("Fetching new data...");
        }
    } else {
        console.warn('Element with ID "lastSubmission" not found or latestMineData is not available.');
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("minerPubkey").textContent = pubkey;
    await updateRewardsAndStakes();
});

fetchDataAndUpdateCharts();
setInterval(fetchDataAndUpdateCharts, 60000);
setInterval(updateTimeAgo, 1000);
