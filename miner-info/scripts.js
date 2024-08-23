const urlParams = new URLSearchParams(window.location.search);
const pubkey = urlParams.get('pubkey');
let data = null;

document.getElementById('minerPubkey').textContent = pubkey;

const dataUrl = `https://domainexpansion.tech/miner/submissions?pubkey=${encodeURIComponent(pubkey)}`;
const rewardsUrl = `https://domainexpansion.tech/miner/rewards?pubkey=${encodeURIComponent(pubkey)}`;

let difficultyChart;

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

        if (difficultyChart) difficultyChart.destroy();

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

        const avgDifficultyChart = new Chart(ctxAvgDifficulty, {
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

        const difficultyCountChart = new Chart(ctxDifficultyCount, {
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

    try {
        const rewardsResponse = await fetch(rewardsUrl);
        if (!rewardsResponse.ok) throw new Error('Network response was not ok.');
        const rewardsData = await rewardsResponse.json();

        const rewardElement = document.getElementById('claimableRewards');
        if (rewardElement) {
            rewardElement.textContent = rewardsData;
        } else {
            console.error('Element with ID "claimableRewards" not found in the DOM.');
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        const rewardElement = document.getElementById('claimableRewards');
        if (rewardElement) {
            rewardElement.textContent = 'No rewards available';
        } else {
            console.error('Element with ID "claimableRewards" not found in the DOM.');
        }
    }
}

function updateTimeAgo() {
    if (data.length > 0) {
        const createdAt = data[0].created_at;
        const date = new Date(createdAt);

        const offsetDate = new Date(date.getTime() - 5 * 60 * 60 * 1000);

        // Convert the offset date to a Unix timestamp
        const unixTimestamp = Math.floor(offsetDate.getTime() / 1000);

        // Calculate the "time ago" in seconds
        const now = Math.floor(Date.now() / 1000);
        const timeAgoInSeconds = now - unixTimestamp;

        // Convert "time ago" into a readable format
        const minutes = Math.floor(timeAgoInSeconds / 60);
        const seconds = timeAgoInSeconds % 60;

        const timeAgo = `${minutes}m ${seconds}s ago`;
        document.getElementById('lastSubmittion').textContent = timeAgo

        if (timeAgoInSeconds > 120) {
            return
        }

        if (timeAgoInSeconds > 80) {
            fetchDataAndUpdateCharts();
            setTimeout(console.log("Waiting for data..."), 5000)
        }
    } else {
        console.warn('No submission data available.');
    }
}

fetchDataAndUpdateCharts();
setInterval(fetchDataAndUpdateCharts, 60000);
setInterval(updateTimeAgo, 1000)
