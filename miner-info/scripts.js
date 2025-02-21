// Configuration
const REFRESH_INTERVAL = 30000; // 30 seconds
const UPDATE_INTERVAL = 1000; // 1 second

// State management
const state = {
  minerData: null,
  charts: {
    difficulty: null,
    avgDifficulty: null,
    difficultyCount: null,
    avgHashrate: null,
    efficiency: null
  },
  lastFetchTimestamp: 0
};

function setupChartPlugins() {
  const verticalLinePlugin = {
    id: 'verticalLine',
    beforeDraw: (chart) => {
      if (chart.tooltip._active && chart.tooltip._active.length) {
        const activePoint = chart.tooltip._active[0];
        const ctx = chart.ctx;
        const x = activePoint.element.x;
        const topY = chart.scales.y.top;
        const bottomY = chart.scales.y.bottom;
        
        // Draw vertical line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.stroke();
        ctx.restore();
      }
    }
  };
  
  Chart.register(verticalLinePlugin);
}

document.addEventListener("DOMContentLoaded", async () => {
  setupChartPlugins();
  
  const urlParams = new URLSearchParams(window.location.search);
  const pubkey = urlParams.get('pubkey');
  
  if (!pubkey) {
    handleError('No miner public key provided');
    return;
  }
  
  updateElementText('minerPubkey', pubkey);
  
  const dataUrl = `https://domainexpansion.tech/miner/submissions?pubkey=${encodeURIComponent(pubkey)}`;
  const rewardsUrl = `https://domainexpansion.tech/miner/rewards?pubkey=${encodeURIComponent(pubkey)}`;
  
  await Promise.all([
    fetchMinerRewards(rewardsUrl),
    fetchMinerData(dataUrl)
  ]);
  
  setInterval(updateTimeAgo, UPDATE_INTERVAL);
});

function updateElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

function handleError(message, elementId = 'minerId') {
  console.error(message);
  updateElementText(elementId, 'No data available');
}

async function fetchMinerData(dataUrl) {
  try {
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error('Network response was not ok.');
    
    state.minerData = await response.json();
    
    if (state.minerData.length > 0) {
      updateElementText('minerId', state.minerData[0].miner_id);
      updateTimeAgo();
      createCharts();
    } else {
      handleError('No miner data available');
    }
  } catch (error) {
    handleError(`Failed to fetch miner data: ${error.message}`);
  }
}

async function fetchMinerRewards(rewardsUrl) {
  try {
    const response = await fetch(rewardsUrl);
    if (!response.ok) throw new Error('Failed to fetch rewards balance.');
    
    const rewardsData = await response.json();
    updateElementText('claimableRewards', rewardsData.toPrecision(11).replace(/\.?0+$/, ''));
  } catch (error) {
    handleError(`Failed to fetch rewards: ${error.message}`, 'claimableRewards');
  }
}

function updateTimeAgo() {
  if (!state.minerData || state.minerData.length === 0) return;
  
  const element = document.getElementById('lastSubmission');
  if (!element) return;
  
  const createdAt = state.minerData[0].created_at;
  const date = new Date(createdAt);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  const unixTimestamp = Math.floor(localDate.getTime() / 1000);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const differenceInSeconds = currentTimestamp - unixTimestamp;
  
  const minutes = Math.floor(differenceInSeconds / 60);
  const seconds = differenceInSeconds % 60;
  element.textContent = `${minutes}m ${seconds}s ago`;
  
  if (differenceInSeconds > 70 && currentTimestamp - state.lastFetchTimestamp > 30) {
    state.lastFetchTimestamp = currentTimestamp;
    const urlParams = new URLSearchParams(window.location.search);
    const pubkey = urlParams.get('pubkey');
    const dataUrl = `https://domainexpansion.tech/miner/submissions?pubkey=${encodeURIComponent(pubkey)}`;
    fetchMinerData(dataUrl);
  }
}

function createCharts() {
  if (!state.minerData || state.minerData.length === 0) return;
  
  const count = state.minerData.length;
  const labels = Array.from({ length: count }, (_, i) => (count - i).toString());
  const difficulties = state.minerData.map(item => item.difficulty).reverse();
  
  const minDifficulty = Math.min(...difficulties);
  const maxDifficulty = Math.max(...difficulties);
  
  createDifficultyChart(labels, difficulties, minDifficulty, maxDifficulty);
  createAvgDifficultyChart(labels, difficulties, minDifficulty, maxDifficulty);
  createDifficultyCountChart(difficulties);
  createAvgHashrateChart(labels, difficulties);
  
  const efficiencyData = calculateMiningEfficiency(difficulties);
  createEfficiencyChart(labels, efficiencyData);
}

function calculateMiningEfficiency(difficulties) {
  const avgDifficulty = difficulties.reduce((sum, diff) => sum + diff, 0) / difficulties.length;
  return difficulties.map(diff => (diff / avgDifficulty * 100));
}

function getChartOptions(title, minY, maxY) {
  const options = {
    plugins: {
      title: {
        display: true,
        text: title,
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
        enabled: true,
        mode: 'index',
        intersect: false,
        position: 'nearest',
        callbacks: {
          title: function(tooltipItems) {
            return 'Submission #: ' + tooltipItems[0].label;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        cornerRadius: 4,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        displayColors: false
      },
      legend: {
        display: false,
      },
      verticalLine: true
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
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 0,
        hoverRadius: 6,
        hoverBorderWidth: 2
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    hover: {
      mode: 'index',
      intersect: false
    }
  };
  
  if (minY !== null) {
    options.scales.y.min = minY;
  }
  
  if (maxY !== null) {
    options.scales.y.max = maxY;
  }
  
  return options;
}

function createDifficultyChart(labels, difficulties, minDifficulty, maxDifficulty) {
  const ctx = document.getElementById('difficultyChart')?.getContext('2d');
  if (!ctx) return;
  
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(0, 255, 127, 0.7)');
  gradient.addColorStop(1, 'rgba(0, 255, 127, 0)');
  
  if (state.charts.difficulty) {
    state.charts.difficulty.destroy();
  }
  
  state.charts.difficulty = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Difficulty',
        data: difficulties,
        backgroundColor: gradient,
        borderColor: 'rgba(0, 255, 127, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgba(0, 255, 127, 1)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        fill: true
      }]
    },
    options: getChartOptions(
      'Difficulty From Latest 100 Submissions (1st = Newest)',
      minDifficulty - 1,
      maxDifficulty + 1
    )
  });
}

function createAvgDifficultyChart(labels, difficulties, minDifficulty, maxDifficulty) {
  const ctx = document.getElementById('avgDifficultyChart')?.getContext('2d');
  if (!ctx) return;
  
  const avgDifficulties = difficulties.map((_, i, arr) => {
    const subset = arr.slice(0, i + 1);
    return subset.reduce((sum, val) => sum + val, 0) / subset.length;
  });
  
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(255, 99, 132, 0.7)');
  gradient.addColorStop(1, 'rgba(255, 99, 132, 0)');
  
  if (state.charts.avgDifficulty) {
    state.charts.avgDifficulty.destroy();
  }
  
  state.charts.avgDifficulty = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Average Difficulty',
        data: avgDifficulties,
        backgroundColor: gradient,
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        fill: true
      }]
    },
    options: getChartOptions(
      'Average Difficulty From Latest 100 Submissions (1st = Newest)',
      minDifficulty - 1,
      maxDifficulty + 1
    )
  });
}

function createDifficultyCountChart(difficulties) {
  const ctx = document.getElementById('difficultyCountChart')?.getContext('2d');
  if (!ctx) return;
  
  const difficultyCount = difficulties.reduce((acc, difficulty) => {
    acc[difficulty] = (acc[difficulty] || 0) + 1;
    return acc;
  }, {});
  
  const countLabels = Object.keys(difficultyCount);
  const countValues = Object.values(difficultyCount);
  
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(153, 102, 255, 0.7)');
  gradient.addColorStop(1, 'rgba(153, 102, 255, 0)');
  
  if (state.charts.difficultyCount) {
    state.charts.difficultyCount.destroy();
  }
  
  const barOptions = getChartOptions('Difficulty Histogram From Latest 100 Submissions', null, null);
  // Modify tooltip for bar chart
  barOptions.plugins.tooltip.callbacks.title = function(tooltipItems) {
    return 'Difficulty: ' + tooltipItems[0].label;
  };
  
  state.charts.difficultyCount = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: countLabels,
      datasets: [{
        label: 'Count',
        data: countValues,
        backgroundColor: gradient,
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        hoverBackgroundColor: 'rgba(153, 102, 255, 0.9)',
        hoverBorderColor: '#fff',
        hoverBorderWidth: 2,
      }]
    },
    options: barOptions
  });
}

function createAvgHashrateChart(labels, difficulties) {
  const ctx = document.getElementById('avgHashrateChart')?.getContext('2d');
  if (!ctx) return;
  
  // Calculate hashrates from difficulties (2^difficulty / 60)
  const hashrates = difficulties.map(diff => Math.pow(2, diff) / 60);
  
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(54, 162, 235, 0.7)');
  gradient.addColorStop(1, 'rgba(54, 162, 235, 0)');
  
  if (state.charts.avgHashrate) {
    state.charts.avgHashrate.destroy();
  }
  
  state.charts.avgHashrate = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Hashrate (H/s)',
        data: hashrates,
        backgroundColor: gradient,
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        fill: true
      }]
    },
    options: getChartOptions(
      'Estimated Hashrate Based on Difficulty (H/s)',
      null,
      null
    )
  });
}

function createEfficiencyChart(labels, efficiencyData) {
  const ctx = document.getElementById('efficiencyChart')?.getContext('2d');
  if (!ctx) return;
  
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(255, 193, 7, 0.7)');
  gradient.addColorStop(1, 'rgba(255, 193, 7, 0)');
  
  if (state.charts.efficiency) {
    state.charts.efficiency.destroy();
  }
  
  state.charts.efficiency = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Efficiency %',
        data: efficiencyData,
        backgroundColor: gradient,
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgba(255, 193, 7, 1)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        fill: true
      }]
    },
    options: getChartOptions(
      'Mining Efficiency (% of Average Difficulty)',
      0,
      Math.max(...efficiencyData) * 1.1
    )
  });
}