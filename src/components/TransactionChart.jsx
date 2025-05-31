import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { BarChart3 } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TransactionChart = ({ transactions }) => {
  if (!transactions || !transactions.items || transactions.items.length === 0) {
    return (
      <div className="transaction-chart">
        <h3 className="section-title">
          <BarChart3 size={20} />
          Transaction Activity
        </h3>
        <div className="no-data">No transaction data to display</div>
      </div>
    );
  }

  // Process transaction data for charts
  const processTransactionData = () => {
    const dailyVolume = {};
    const dailyCount = {};

    transactions.items.forEach((tx) => {
      const date = new Date(tx.timestamp).toLocaleDateString();
      const value = parseFloat(tx.value) / Math.pow(10, 18); // Convert wei to ETH

      if (!dailyVolume[date]) {
        dailyVolume[date] = 0;
        dailyCount[date] = 0;
      }

      dailyVolume[date] += value;
      dailyCount[date] += 1;
    });

    const dates = Object.keys(dailyVolume).sort();
    const volumes = dates.map((date) => dailyVolume[date].toFixed(4));
    const counts = dates.map((date) => dailyCount[date]);

    return { dates, volumes, counts };
  };

  const { dates, volumes, counts } = processTransactionData();

  const volumeChartData = {
    labels: dates,
    datasets: [
      {
        label: "Daily Volume (ETH)",
        data: volumes,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.1,
      },
    ],
  };

  const countChartData = {
    labels: dates,
    datasets: [
      {
        label: "Daily Transaction Count",
        data: counts,
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="transaction-chart">
      <h3 className="section-title">
        <BarChart3 size={20} />
        Transaction Activity
      </h3>

      <div className="charts-container">
        <div className="chart-item">
          <h4>Daily Volume</h4>
          <Line data={volumeChartData} options={chartOptions} />
        </div>

        <div className="chart-item">
          <h4>Daily Transaction Count</h4>
          <Bar data={countChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default TransactionChart;
