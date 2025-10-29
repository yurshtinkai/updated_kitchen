import React, { useState, useEffect } from 'react';
import './AdminReports.css';

const SalesReports = () => {
  const [period, setPeriod] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSalesData();
  }, [period, page]);

  const fetchSalesData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `http://localhost:3001/api/admin/reports/sales?period=${period}&page=${page}&limit=30`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/signin';
          return;
        }
        throw new Error('Failed to fetch sales data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!data) return null;
    
    return {
      labels: data.dailySales.map((d) => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      values: data.dailySales.map((d) => parseFloat(d.total)),
    };
  };

  const getPieData = () => {
    if (!data) return [];
    
    const sorted = [...data.productSales].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 5);
    return sorted;
  };

  const chartData = getChartData();
  const pieData = getPieData();

  return (
    <div className="admin-reports">
      <div className="reports-header">
        <h1>Sales Reports</h1>
        <div className="period-selector">
          <button
            className={period === 'weekly' ? 'active' : ''}
            onClick={() => setPeriod('weekly')}
          >
            Weekly
          </button>
          <button
            className={period === 'monthly' ? 'active' : ''}
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            className={period === 'yearly' ? 'active' : ''}
            onClick={() => setPeriod('yearly')}
          >
            Yearly
          </button>
          <button
            className={period === 'all' ? 'active' : ''}
            onClick={() => setPeriod('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="stats-grid-modern">
            <div className="stat-card-modern stat-card-purple">
              <div className="stat-icon-modern">💰</div>
              <div className="stat-content-modern">
                <h3 className="stat-label-modern">Total Sales</h3>
                <p className="stat-value-modern">${data.totalSales.toFixed(2)}</p>
                <div className="stat-change positive">↑ 12% vs last period</div>
              </div>
            </div>
            
            <div className="stat-card-modern stat-card-blue">
              <div className="stat-icon-modern">📦</div>
              <div className="stat-content-modern">
                <h3 className="stat-label-modern">Total Orders</h3>
                <p className="stat-value-modern">{data.totalOrders}</p>
                <div className="stat-change positive">↑ 8% growth</div>
              </div>
            </div>
            
            <div className="stat-card-modern stat-card-green">
              <div className="stat-icon-modern">📊</div>
              <div className="stat-content-modern">
                <h3 className="stat-label-modern">Avg Order Value</h3>
                <p className="stat-value-modern">
                  ${data.totalOrders > 0 ? (data.totalSales / data.totalOrders).toFixed(2) : '0.00'}
                </p>
                <div className="stat-change positive">↑ 4% increase</div>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card chart-card-enhanced">
              <div className="chart-header-modern">
                <h3>Sales Over Time</h3>
                <span className="chart-subtitle">Daily revenue trend</span>
              </div>
              {chartData && chartData.values.length > 0 ? (
                <div className="line-chart-container">
                  <svg viewBox="0 0 600 300" className="chart-svg-enhanced">
                    {/* Gradient definitions */}
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="50%" stopColor="#764ba2" />
                        <stop offset="100%" stopColor="#f093fb" />
                      </linearGradient>
                      <linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(102, 126, 234, 0.3)" />
                        <stop offset="100%" stopColor="rgba(16, 185, 129, 0.1)" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="40"
                        y1={50 + i * 50}
                        x2="580"
                        y2={50 + i * 50}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                      />
                    ))}
                    
                    {/* Y-axis labels */}
                    <text x="30" y="245" fontSize="12" fill="#6b7280" textAnchor="middle">
                      $0
                    </text>
                    {Math.max(...chartData.values) > 0 && (
                      <>
                        <text x="30" y="195" fontSize="12" fill="#6b7280" textAnchor="middle">
                          ${(Math.max(...chartData.values) * 0.25).toFixed(0)}
                        </text>
                        <text x="30" y="145" fontSize="12" fill="#6b7280" textAnchor="middle">
                          ${(Math.max(...chartData.values) * 0.5).toFixed(0)}
                        </text>
                        <text x="30" y="95" fontSize="12" fill="#6b7280" textAnchor="middle">
                          ${(Math.max(...chartData.values) * 0.75).toFixed(0)}
                        </text>
                        <text x="30" y="55" fontSize="12" fill="#6b7280" textAnchor="middle">
                          ${Math.max(...chartData.values).toFixed(0)}
                        </text>
                      </>
                    )}
                    
                    {/* Area under the curve */}
                    <path
                      d={`M 40,250 ${chartData.values
                        .map((val, i) => {
                          const x = 40 + (i / (chartData.values.length - 1)) * 540;
                          const y = 250 - (val / Math.max(...chartData.values)) * 200;
                          return `L ${x},${y}`;
                        })
                        .join(' ')} L ${40 + (540 * (chartData.values.length - 1)) / chartData.values.length},250 Z`}
                      fill="url(#fillGradient)"
                    />
                    
                    {/* Main line */}
                    <polyline
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartData.values
                        .map((val, i) => {
                          const x = 40 + (i / (chartData.values.length - 1)) * 540;
                          const y = 250 - (val / Math.max(...chartData.values)) * 200;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                    
                    {/* Data points */}
                    {chartData.values.map((val, i) => {
                      const x = 40 + (i / (chartData.values.length - 1)) * 540;
                      const y = 250 - (val / Math.max(...chartData.values)) * 200;
                      return (
                        <g key={i}>
                          <circle
                            cx={x}
                            cy={y}
                            r="8"
                            fill="#667eea"
                            stroke="white"
                            strokeWidth="3"
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#764ba2"
                          />
                        </g>
                      );
                    })}
                    
                    {/* X-axis labels */}
                    {chartData.labels.map((label, i) => {
                      const x = 40 + (i / (chartData.values.length - 1)) * 540;
                      return (
                        <text
                          key={i}
                          x={x}
                          y="280"
                          fontSize="11"
                          fill="#6b7280"
                          textAnchor="middle"
                        >
                          {label}
                        </text>
                      );
                    })}
                  </svg>
                </div>
              ) : (
                <div className="no-data-container">
                  <div className="no-data-icon">📈</div>
                  <p className="no-data">No sales data available yet</p>
                  <p className="no-data-hint">Complete some orders to see your sales trend</p>
                </div>
              )}
            </div>

            <div className="chart-card chart-card-enhanced">
              <div className="chart-header-modern">
                <h3>Top Selling Products</h3>
                <span className="chart-subtitle">Best performers</span>
              </div>
              {pieData.length > 0 ? (
                <div className="pie-chart">
                  {pieData.map((item, i) => (
                    <div key={i} className="pie-item">
                      <div
                        className="pie-bar"
                        style={{ width: `${(item.totalQuantity / pieData[0].totalQuantity) * 100}%` }}
                      />
                      <span className="pie-label">
                        {item.productName} - {item.totalQuantity} sold
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No data available</p>
              )}
            </div>
          </div>

          <div className="table-section-modern">
            <div className="table-header-modern">
              <h3>Recent Sales</h3>
              <span className="table-subtitle">Latest completed orders</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>#{sale.id}</td>
                    <td>{sale.customerName}</td>
                    <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                    <td>${parseFloat(sale.totalAmount).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${sale.status}`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>
                Page {page} of {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.pagination.totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesReports;

