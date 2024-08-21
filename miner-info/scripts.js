document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const pubkey = urlParams.get('pubkey');

    document.getElementById('minerPubkey').textContent = pubkey;

    const dataUrl = `https://domainexpansion.tech/miner/submissions?pubkey=${encodeURIComponent(pubkey)}`;

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

            if (data.length > 0) {
                document.getElementById('minerId').textContent = data[0].miner_id;
            } else {
                document.getElementById('minerId').textContent = 'No data available';
            }

            const ctx = document.getElementById('difficultyChart').getContext('2d');

            const gradientDifficulty = ctx.createLinearGradient(0, 0, 0, 400);
            gradientDifficulty.addColorStop(0, 'rgba(0, 255, 127, 0.7)');
            gradientDifficulty.addColorStop(1, 'rgba(0, 255, 127, 0)');

            new Chart(ctx, {
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
                            text: 'Latest 100 Submissions (1st = Newest)',
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
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                            },
                            ticks: {
                                color: '#fff',
                            },
                            min: Math.min(...difficulties) - 1,
                            max: Math.max(...difficulties) + 1,
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
        })
        .catch(error => {
            console.error('Error fetching miner data:', error);
        });
});
