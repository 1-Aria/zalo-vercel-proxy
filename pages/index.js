import { useEffect, useState } from "react";

// The main application component, renamed from Home to App
export default function App() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Endpoint to fetch data
  const endpoint =
    "https://script.google.com/macros/s/AKfycbxTUqUYhz9sNpp1SFTdwS4eK4z6_Rb_I49lU17vPdPiNJM1d9AHKvHYO4y8NgHntN97zA/exec";

  useEffect(() => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        // --- FIX FOR EMPTY ROWS ---
        // Filter out any rows that are completely empty (all values are null, undefined, or empty strings)
        const cleanData = data.filter(row =>
          Object.values(row).some(val => val !== null && val !== undefined && String(val).trim() !== "")
        );
        // --- END FIX ---

        setData(cleanData);
        setFiltered(cleanData);
      })
      .catch(error => {
        console.error("Failed to fetch data:", error);
        // Set data to empty array on failure
        setData([]);
        setFiltered([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = (status) => {
    setStatusFilter(status);
    if (status === "all") {
      setFiltered(data);
    } else {
      const lower = status.toLowerCase();
      // Ensure we check for the 'Status' key consistently
      setFiltered(data.filter((row) => String(row.Status || "").toLowerCase() === lower));
    }
  };

  // Helper function to render a value as a styled badge if it is the Status field
  const renderCellContent = (key, val) => {
    const valueString = String(val);
    if (key.toLowerCase() === "status") {
      const status = valueString.toLowerCase();
      let className = "status-badge status-default"; // Added status-badge base class
      if (status === "pending") {
        className = "status-badge status-pending";
      } else if (status === "closed") {
        className = "status-badge status-closed";
      }
      return <span className={className}>{valueString}</span>;
    }
    return valueString;
  };

  const getHeaders = () => {
    if (filtered.length > 0) {
      return Object.keys(filtered[0] || {});
    }
    // Fallback if data is present but filtered is empty (shouldn't happen with the current logic, but safe)
    if (data.length > 0) {
      return Object.keys(data[0] || {});
    }
    return [];
  };

  return (
    <div className="dashboard-container">
      <style>
        {`
          /* Base styles for a modern, clean look */
          .dashboard-container {
            min-height: 100vh;
            background-color: #f7f9fc; /* Light blue-gray background */
            padding: 2rem;
            font-family: 'Inter', sans-serif;
            color: #333;
          }
          .main-card {
            max-width: 1200px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            border-radius: 16px;
            padding: 2rem;
          }
          .header-title {
            font-size: 2.25rem; /* 3xl */
            font-weight: 700;
            color: #1e3a8a; /* Deep blue */
            margin-bottom: 1.5rem;
            text-align: center;
            border-bottom: 2px solid #e0e7ff;
            padding-bottom: 0.5rem;
          }
          .filter-bar {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding: 0.5rem 0;
            gap: 1rem;
          }
          .filter-info {
            color: #6b7280;
            font-size: 0.875rem;
          }
          .filter-controls {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          .select-label {
            color: #374151;
            font-weight: 500;
          }
          .status-select {
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 0.875rem;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
            background-color: white;
          }
          .status-select:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          }
          .table-wrapper {
            overflow-x: auto;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          }
          .data-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
          }
          .table-head {
            background-color: #1e3a8a; /* Blue header */
            color: white;
          }
          .table-head th {
            padding: 12px 16px;
            text-align: left;
            font-size: 0.875rem;
            font-weight: 600;
            border-bottom: 2px solid #2563eb;
            white-space: nowrap;
          }
          .table-body tr {
            transition: background-color 0.2s;
          }
          .table-body tr:nth-child(even) {
            background-color: #f9fafb; /* Lighter stripe */
          }
          .table-body tr:hover {
            background-color: #e0f2fe; /* Lightest blue on hover */
          }
          .table-body td {
            padding: 12px 16px;
            font-size: 0.875rem;
            color: #4b5563;
            border-bottom: 1px solid #e5e7eb;
          }
          .data-table .table-body tr:last-child td {
            border-bottom: none;
          }

          /* Status Badge Styles for readability */
          .status-badge {
            padding: 4px 8px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.75rem;
            display: inline-block;
            text-transform: capitalize;
            min-width: 60px;
            text-align: center;
          }
          .status-pending {
            background-color: #fef3c7; /* Light Yellow */
            color: #b45309; /* Dark Orange */
          }
          .status-closed {
            background-color: #d1fae5; /* Light Green */
            color: #065f46; /* Dark Green */
          }
          .status-default {
              background-color: #e5e7eb; /* Light Gray */
              color: #4b5563; /* Dark Gray */
          }

          .loading-message, .empty-message {
            text-align: center;
            padding: 3rem 0;
            font-size: 1.125rem;
            color: #6b7280;
          }
          
          /* ===================================== */
          /* MOBILE (CARD VIEW) TRANSFORMATION CSS */
          /* ===================================== */
          @media (max-width: 640px) {
            .main-card {
                padding: 1rem;
                border-radius: 8px;
            }
            .header-title {
                font-size: 1.5rem;
                margin-bottom: 1rem;
            }
            .filter-bar {
                flex-direction: column;
                align-items: stretch;
            }
            .filter-info {
                margin-bottom: 0.5rem;
            }
            .filter-controls {
                justify-content: space-between;
                width: 100%;
            }

            /* Card View Styles */
            .table-wrapper {
                overflow-x: hidden; /* Prevent horizontal scroll on mobile */
                border: none;
                box-shadow: none;
            }
            .data-table {
                /* Add space between rows (cards) */
                border-spacing: 0 10px;
                border-collapse: separate;
            }
            .table-head {
                display: none; /* Hide the table header */
            }
            .table-body tr {
                display: block; /* Make row act like a block (card) */
                margin-bottom: 1rem;
                border: 1px solid #d1d5db; /* Better border for card separation */
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* Lighter shadow */
                background-color: white !important; /* Ensure consistent background */
                padding: 1rem;
                animation: fadeIn 0.3s ease-out;
            }
            .table-body tr:nth-child(even), .table-body tr:hover {
                /* Override striped and hover background on mobile */
                background-color: white !important;
            }
            .table-body td {
                display: flex; /* Make cell content flex for label/value alignment */
                justify-content: space-between;
                align-items: flex-start; /* FIX: Align to top for multi-line content */
                border-bottom: 1px solid #f3f4f6; /* FIX: Add internal separator for columns/fields */
                padding: 0.6rem 0;
                font-size: 1rem; /* Slightly larger text for readability */
                position: relative;
                word-break: break-word; /* FIX: Ensure long text wraps */
                white-space: normal; /* FIX: Ensure normal wrapping behavior */
            }
            /* FIX: Remove separator from the last field in the card */
            .table-body td:last-of-type {
                border-bottom: none;
            }
            
            .table-body td::before {
                /* Use the data-label attribute to display the column name */
                content: attr(data-label);
                font-weight: 600;
                color: #1e3a8a; /* Header blue color */
                min-width: 45%;
                flex-shrink: 0; /* Prevent label from shrinking */
                text-align: left;
                padding-right: 1rem;
            }
            .status-badge {
                /* Ensure badges look good in the flex layout */
                margin-left: auto;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
          }
        `}
      </style>

      <div className="main-card">
        <h1 className="header-title">
          📊 Data Request Dashboard
        </h1>

        {/* Filter bar */}
        <div className="filter-bar">
          <p className="filter-info">
            Showing **{filtered.length}** of **{data.length}** total entries
          </p>
          <div className="filter-controls">
            <label className="select-label">Filter by Status:</label>
            <select
              className="status-select"
              value={statusFilter}
              onChange={(e) => handleFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-message">Loading data...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-message">
            No data available for the current filter.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead className="table-head">
                <tr>
                  {getHeaders().map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="table-body">
                {filtered.map((row, i) => (
                  <tr key={i}>
                    {getHeaders().map((key, j) => (
                      // === MODIFICATION: Added data-label attribute for mobile view ===
                      <td key={j} data-label={key}>
                        {renderCellContent(key, row[key])}
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
