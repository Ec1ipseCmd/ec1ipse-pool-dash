body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #121212;
    color: #e0e0e0;
    padding: 0;
    overflow-y: scroll;
}

::-webkit-scrollbar {
    width: 12px;
}

::-webkit-scrollbar-track {
    background: #1e1e1e;
    border-radius: 8px;
}

::-webkit-scrollbar-thumb {
    background: #424242;
    border-radius: 8px;
    transition: background 0.3s;
}

::-webkit-scrollbar-thumb:hover {
    background: #616161;
}

.container {
    width: 90%;
    margin: auto;
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #00e676;
    padding-bottom: 10px;
    margin-bottom: 30px;
}

h1, h2 {
    color: #e0e0e0;
    margin: 0;
    margin-bottom: 10px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 30px;
}

.stats-grid div {
    background: linear-gradient(145deg, #1e1e1e, #121212);
    padding: 15px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.3);
}

.mining-stats, .earnings-stats {
    margin-bottom: 30px;
}

.mining-stats ul, .earnings-stats ul {
    list-style-type: none;
    padding: 0;
}

.mining-stats li, .earnings-stats li {
    background: linear-gradient(145deg, #1e1e1e, #121212);
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 12px;
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.3);
}

.charts-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: space-between;
}

.chart-container {
    flex: 1 1 calc(33% - 20px);
    background: linear-gradient(145deg, #1e1e1e, #121212);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.3);
}

canvas {
    width: 100%;
    height: 200px;
    background: #1c1c1c;
    border-radius: 12px;
    padding: 10px;
}

#recent-txn a {
    color: #00bfff;
    text-decoration: none;
    transition: color 0.3s;
}

#recent-txn a:hover {
    color: #00aaff;
}

.search-container {
    margin-bottom: 0;
    text-align: right;
}

.search-container input {
    padding: 10px;
    width: 250px;
    border-radius: 8px;
    border: 1px solid #00e676;
    background: #1e1e1e;
    color: #e0e0e0;
    margin-right: 10px;
    transition: background 0.3s, border-color 0.3s;
}

.search-container input:focus {
    background: #2e2e2e;
    border-color: #00b248;
    outline: none;
}

.search-container button {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    background-color: #00e676;
    color: #121212;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
}

.search-container button:hover {
    background-color: #00b248;
    transform: scale(1.05);
}
