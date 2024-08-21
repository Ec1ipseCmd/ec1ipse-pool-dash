document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const pubkey = urlParams.get('pubkey');

    document.getElementById('minerPubkey').textContent = pubkey;

    const dataUrl = `https://domainexpansion.tech/miner/submissions?pubkey=${encodeURIComponent(pubkey)}`;
    const rewardsUrl = `https://domainexpansion.tech/miner/rewards?pubkey=${encodeURIComponent(pubkey)}`;

    fetch(dataUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            const count = data.length;
            const labels = Array.from({ length: count }, (_, i) => (count - i).toString());
            const difficulties = data.map(item => item.difficulty).reverse();

            function printHashrates() {
                const calculatedValues = [];
                difficulties.forEach(difficulty => {
                    const calculatedValue = (Math.pow(2, difficulty) / 60);
                    calculatedValues.push(calculatedValue);
                });
                return calculatedValues;
            }

            const hashrates = printHashrates();

            if (data.length > 0) {
                document.getElementById('minerId').textContent = data[0].miner_id;
            } else {
                document.getElementById('minerId').textContent = 'No data available';
            }

            const minDifficulty = Math.min(...difficulties);
            const maxDifficulty = Math.max(...difficulties);

            const ctxDifficulty = document.getElementById('difficultyChart').getContext('2d');
            const ctxAvgDifficulty = document.getElementById('avgDifficultyChart').getContext('2d');
            const ctxDifficultyCount = document.getElementById('difficultyCountChart').getContext('2d');
            // const ctxAvgHashrate = document.getElementById('avgHashrateChart').getContext('2d');

            const gradientDifficulty = ctxDifficulty.createLinearGradient(0, 0, 0, 400);
            gradientDifficulty.addColorStop(0, 'rgba(0, 255, 127, 0.7)');
            gradientDifficulty.addColorStop(1, 'rgba(0, 255, 127, 0)');

            new Chart(ctxDifficulty, {
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

            const gradientAvgDifficulty = ctxAvgDifficulty.createLinearGradient(0, 0, 0, 400);
            gradientAvgDifficulty.addColorStop(0, 'rgba(255, 99, 132, 0.7)');
            gradientAvgDifficulty.addColorStop(1, 'rgba(255, 99, 132, 0)');

            new Chart(ctxAvgDifficulty, {
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

            // Count the number of occurrences of each difficulty
            const difficultyCount = difficulties.reduce((acc, difficulty) => {
                acc[difficulty] = (acc[difficulty] || 0) + 1;
                return acc;
            }, {});

            // Prepare data for the difficulty count chart
            const countLabels = Object.keys(difficultyCount);
            const countValues = Object.values(difficultyCount);

            const gradientDifficultyCount = ctxDifficultyCount.createLinearGradient(0, 0, 0, 400);
            gradientDifficultyCount.addColorStop(0, 'rgba(153, 102, 255, 0.7)');
            gradientDifficultyCount.addColorStop(1, 'rgba(153, 102, 255, 0)');

            new Chart(ctxDifficultyCount, {
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

            // // Calculate the average hashrates
            // const avgHashrates = hashrates.map((_, i, arr) => {
            //     const subset = arr.slice(0, i + 1);
            //     return subset.reduce((sum, val) => sum + val, 0) / subset.length;
            // });

            // const gradientAvgHashrate = ctxAvgHashrate.createLinearGradient(0, 0, 0, 400);
            // gradientAvgHashrate.addColorStop(0, 'rgba(54, 162, 235, 0.7)');
            // gradientAvgHashrate.addColorStop(1, 'rgba(54, 162, 235, 0)');

            // new Chart(ctxAvgHashrate, {
            //     type: 'line',
            //     data: {
            //         labels: labels,
            //         datasets: [{
            //             label: 'Average Hashrate (Per second)',
            //             data: avgHashrates,
            //             backgroundColor: gradientAvgHashrate,
            //             borderColor: 'rgba(54, 162, 235, 1)',
            //             borderWidth: 2,
            //             tension: 0.4,
            //             pointRadius: 0
            //         }]
            //     },
            //     options: {
            //         plugins: {
            //             title: {
            //                 display: true,
            //                 text: 'Average Hashrate From Latest 100 Submissions (1st = Newest)',
            //                 color: '#fff',
            //                 font: {
            //                     size: 16,
            //                     weight: 'bold'
            //                 },
            //                 padding: {
            //                     top: 10,
            //                     bottom: 30
            //                 }
            //             },
            //             tooltip: {
            //                 enabled: true
            //             },
            //             legend: {
            //                 display: false,
            //             }
            //         },
            //         scales: {
            //             y: {
            //                 beginAtZero: true,
            //                 grid: {
            //                     color: 'rgba(255, 255, 255, 0.1)',
            //                 },
            //                 ticks: {
            //                     color: '#fff',
            //                 },
            //             },
            //             x: {
            //                 grid: {
            //                     color: 'rgba(255, 255, 255, 0.1)',
            //                 },
            //                 ticks: {
            //                     color: '#fff',
            //                 }
            //             }
            //         },
            //         elements: {
            //             line: {
            //                 tension: 0.4
            //             }
            //         }
            //     }
            // });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            document.getElementById('minerId').textContent = 'No data available';
        });

        fetch(rewardsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(rewardsData => {
            const rewardElement = document.getElementById('claimableRewards');
    
            if (rewardElement) {
                rewardElement.textContent = rewardsData;
            } else {
                console.error('Element with ID "claimableRewards" not found in the DOM.');
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            const rewardElement = document.getElementById('claimableRewards');
    
            if (rewardElement) {
                rewardElement.textContent = 'No rewards available';
            } else {
                console.error('Element with ID "claimableRewards" not found in the DOM.');
            }
        });    
});
