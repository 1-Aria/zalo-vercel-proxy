import { useEffect, useState } from 'react';

// --- Utility Functions ---

/**
 * Helper function to assign a numerical rank for custom status sorting.
 * Lower numbers mean higher priority (appear first).
 */
const getSortOrder = status => {
  const lowerStatus = String(status || '').toLowerCase();

  if (lowerStatus === 'new') {
    return 1; // Highest Priority
  } else if (lowerStatus === 'pending') {
    return 2; // Second Priority
  } else if (lowerStatus === 'closed') {
    return 3; // Third Priority
  }
  return 99; // All other statuses go to the bottom
};

export default function App() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Hardcoded endpoint for data fetching (replace if needed)
  const endpoint =
    'https://script.google.com/macros/s/AKfycbx5eUTlDBXu95ZE9pYqo4rOlYNXRBbOifJM819CXGvUmhgS4GgvpwCqvVMa1LeEdAoGYQ/exec';

  // Function to process and set data
  const processData = rawData => {
    // Filter out completely empty rows
    const cleanData = rawData.filter(row =>
      Object.values(row).some(
        val => val !== null && val !== undefined && String(val).trim() !== ''
      )
    );

    // Sort by custom status order first, then by the first column for stability
    const sortedData = cleanData.sort((a, b) => {
      const orderA = getSortOrder(a.Status);
      const orderB = getSortOrder(b.Status);

      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // Secondary sort by first column (e.g., ID or Timestamp)
      const keyA = String(Object.values(a)[0] || '');
      const keyB = String(Object.values(b)[0] || '');
      return keyA.localeCompare(keyB);
    });

    setData(sortedData);
    setFiltered(sortedData);
    setLoading(false);
  };

  useEffect(() => {
    // Fetch data directly without caching logic
    fetch(endpoint)
      .then(res => res.json())
      .then(freshData => {
        processData(freshData);
      })
      .catch(error => {
        console.error('Failed to fetch data:', error);
        setData([]);
        setFiltered([]);
        setLoading(false);
      });
  }, []);

  const handleFilter = status => {
    setStatusFilter(status);
    const lower = status.toLowerCase();

    if (lower === 'all') {
      setFiltered(data);
    } else {
      // Filter rows based on the 'Status' key
      setFiltered(
        data.filter(row => String(row.Status || '').toLowerCase() === lower)
      );
    }
  };

  const getHeaders = () => {
    if (filtered.length > 0) {
      return Object.keys(filtered[0] || {});
    }
    if (data.length > 0) {
      return Object.keys(data[0] || {});
    }
    return [];
  };

  // Renders the cell content, handling only status badges
  const renderContent = (key, val) => {
    const valueString = String(val);

    // 1. Status Badge Check
    if (key.toLowerCase() === 'status') {
      const status = valueString.toLowerCase();
      let badgeClass = 'status-badge status-default';
      if (status === 'pending') {
        badgeClass = 'status-badge status-pending';
      } else if (status === 'closed') {
        badgeClass = 'status-badge status-closed';
      } else if (status === 'new') {
        badgeClass = 'status-badge status-new'; 
      }
      return <span className={badgeClass}>{valueString}</span>;
    } 
    
    // 2. Default Content
    return <div>{valueString}</div>;
  };

  return (
    <div className='dashboard-container'>
      <style>
        {`
          /* ===================================== */
          /* BASIC MOBILE-FIRST STYLES (Cleaned up) */
          /* ===================================== */
          .dashboard-container {
            min-height: 100vh;
            background-color: #f7f9fc;
            padding: 1rem; 
            font-family: 'Inter', sans-serif;
            color: #333;
          }
          .main-card {
            max-width: 1000px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); 
            border-radius: 8px;
            padding: 1rem;
          }
          .header-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 1.5rem;
            text-align: center;
            border-bottom: 2px solid #e0e7ff;
            padding-bottom: 0.5rem;
          }

          /* Filter Bar */
          .filter-bar {
            display: flex;
            flex-direction: column; 
            align-items: stretch;
            margin-bottom: 1.5rem;
            gap: 0.75rem;
            padding: 0.5rem;
            border: 1px solid #c7d2fe;
            border-radius: 6px;
            background-color: #f8f9ff;
          }
          .filter-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .filter-info {
            color: #6b7280;
            font-size: 0.875rem;
          }
          .count-highlight {
            color: #1e3a8a;
            font-weight: 700;
          }
          .status-select {
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 6px 10px;
            font-size: 0.875rem;
            outline: none;
            background-color: white;
            min-width: 100px;
          }

          /* Card View Structure */
          .data-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 10px; 
            margin-top: 10px;
          }
          .table-head {
            display: none;
          }
          .table-body tr {
            display: block; 
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 0.75rem 1rem;
            margin-bottom: 10px;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          }
          .table-body td {
            display: flex; 
            justify-content: space-between;
            align-items: center;
            padding: 0.4rem 0;
            font-size: 0.9rem;
            border-bottom: 1px dashed #e5e7eb;
            font-weight: 500;
          }
          .table-body td:last-of-type {
            border-bottom: none; 
          }
          
          /* Field Label Styling (The "header" text in mobile view) */
          .table-body td::before {
            content: attr(data-label);
            font-weight: 600;
            color: #4b5563;
            min-width: 45%;
            flex-shrink: 0;
            padding-right: 1rem;
            text-align: left;
          }

          /* Status Badge Styles */
          .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 0.75rem;
            display: inline-block;
            text-transform: uppercase;
            line-height: 1;
            margin-left: auto; /* Push to the right */
          }
          .status-pending {
            background-color: #fef3c7; color: #b45309;
          }
          .status-closed {
            background-color: #d1fae5; color: #065f46;
          }
          .status-default {
            background-color: #e5e7eb; color: #4b5563;
          }
          .status-new { 
            background-color: #fee2e2; 
            color: #b91c1c; 
          }
          
          .loading-message, .empty-message {
            text-align: center;
            padding: 2rem 0;
            font-size: 1rem;
            color: #6b7280;
          }

          /* Desktop/Tablet View (Standard Table - Hide Card elements) */
          @media (min-width: 768px) {
            .table-head {
              display: table-header-group;
              background-color: #eef2ff;
              border-radius: 6px;
            }
            .table-head th {
              padding: 10px 15px;
              text-align: left;
              font-weight: 700;
              color: #1e3a8a;
            }
            .table-body tr {
              display: table-row; 
              border: none;
              border-bottom: 1px solid #e0e7ff;
              border-radius: 0;
              padding: 0;
              margin-bottom: 0;
              transition: background-color 0.15s;
            }
            .table-body tr:hover {
              background-color: #f0f4ff;
              box-shadow: none;
            }
            .table-body td {
              display: table-cell; 
              padding: 10px 15px;
              border-bottom: none;
              font-weight: 500;
              color: #333;
            }
            .table-body td::before {
              content: none; /* Hide mobile labels */
            }
            .data-table {
              border-spacing: 0; 
              border-radius: 6px;
              overflow: hidden;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
            }
            .filter-bar {
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
            }
            .filter-controls {
              gap: 10px;
            }
          }
        `}
      </style>

      <div className='main-card'>
        <h1 className='header-title'>HỆ THỐNG BẢO TRÌ (Basic View)</h1>

        {/* Filter bar */}
        <div className='filter-bar'>
          <p className='filter-info'>
            Showing <span className='count-highlight'>{filtered.length}</span>{' '}
            of <span className='count-highlight'>{data.length}</span> total issues.
          </p>
          <div className='filter-controls'>
            <label className='select-label'>Filter by Status:</label>
            <select
              className='status-select'
              value={statusFilter}
              onChange={e => handleFilter(e.target.value)}
            >
              <option value='all'>All</option>
              <option value='new'>New</option>
              <option value='pending'>Pending</option>
              <option value='closed'>Closed</option>
              <option value='other'>Other</option>
            </select>
          </div>
        </div>

        {/* Table/Card View */}
        {loading ? (
          <div className='loading-message'>Loading data...</div>
        ) : filtered.length === 0 ? (
          <div className='empty-message'>
            No data available for the current filter.
          </div>
        ) : (
          <div className='table-wrapper'>
            <table className='data-table'>
              <thead className='table-head'>
                <tr>
                  {getHeaders().map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className='table-body'>
                {filtered.map((row, i) => (
                  <tr key={i}>
                    {getHeaders().map((key, j) => (
                      <td key={j} data-label={key}>
                        {renderContent(key, row[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
