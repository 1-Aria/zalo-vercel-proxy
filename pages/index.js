import { useEffect, useState } from "react";

// --- Caching and Truncation Configuration ---
const MAX_LENGTH = 36;
const CACHE_KEY = "requestDashboardData";
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export default function App() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  // State to track which truncated cells are expanded
  const [expandedCells, setExpandedCells] = useState({});

  // Endpoint to fetch data
  const endpoint =
    "https://script.google.com/macros/s/AKfycbxTUqUYhz9sNpp1SFTdwS4eK4z6_Rb_I49lU17vPdPiNJM1d9AHKvHYO4y8NgHntN97zA/exec";

  // Function to process and set data
  const processData = (rawData) => {
    // Filter out completely empty rows for clean data presentation
    const cleanData = rawData.filter(row =>
      Object.values(row).some(val => val !== null && val !== undefined && String(val).trim() !== "")
    );
    setData(cleanData);
    setFiltered(cleanData);
    setLoading(false);
  };

  useEffect(() => {
    let initialLoadComplete = false;
    
    // 1. Check for Cache (Instant Load)
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp, data: cachedData } = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - timestamp < CACHE_EXPIRY_MS) {
          console.log("Loading data from fresh cache.");
          processData(cachedData);
          initialLoadComplete = true;
        } else {
          console.log("Cache expired, using stale data for instant display.");
          processData(cachedData); // Use stale data for instant display (SWR)
        }
      }
    } catch (e) {
      console.error("Error reading cache:", e);
    } finally {
        if (!initialLoadComplete) setLoading(true);
    }
    
    // 2. Fetch Fresh Data (Revalidation)
    fetch(endpoint)
      .then((res) => res.json())
      .then((freshData) => {
        // Only update if fresh data is different or if we loaded stale/no data
        if (!initialLoadComplete || JSON.stringify(data) !== JSON.stringify(freshData)) {
            console.log("Fetched fresh data from network.");
            processData(freshData);
            
            // Update cache
            const cacheItem = {
              timestamp: Date.now(),
              data: freshData,
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheItem));
        } else {
            // Data was the same as cache/already loaded
            setLoading(false);
        }
      })
      .catch(error => {
        console.error("Failed to fetch fresh data:", error);
        if (!initialLoadComplete) {
            setData([]);
            setFiltered([]);
            setLoading(false);
        }
      });
  }, []); // Run only on component mount

  const handleFilter = (status) => {
    setStatusFilter(status);
    const lower = status.toLowerCase();

    if (lower === "all") {
      setFiltered(data);
    } else {
      // Filter rows based on the 'Status' key
      setFiltered(data.filter((row) => String(row.Status || "").toLowerCase() === lower));
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
  
  // Renders the cell content, handling status badges, highlighting, and truncation
  const renderContent = (key, val, i, j) => {
    const valueString = String(val);
    const cellKey = `${i}-${j}`;
    const isExpanded = expandedCells[cellKey];
    const isLong = valueString.length > MAX_LENGTH;
    const isImportantField = key === "Chờ Xác Nhận" || key === "Chờ Đóng";

    const toggleExpand = () => {
      setExpandedCells(prev => ({
        ...prev,
        [cellKey]: !prev[cellKey]
      }));
    };

    let content;

    // 1. Status Badge Check
    if (key.toLowerCase() === "status") {
      const status = valueString.toLowerCase();
      let badgeClass = "status-badge status-default";
      if (status === "pending") {
        badgeClass = "status-badge status-pending";
      } else if (status === "closed") {
        badgeClass = "status-badge status-closed";
      } else if (status === "new") {
        badgeClass = "status-badge status-new"; // New Red Status
      }
      content = <span className={badgeClass}>{valueString}</span>;
    } else {
      // 2. Truncation Logic
      const displayValue = isExpanded || !isLong
        ? valueString
        : valueString.substring(0, MAX_LENGTH);
      
      content = <div className="content-text">{displayValue}</div>;
    }

    // Apply highlighting class if the field is important
    const cellClass = isImportantField ? "important-field" : "";

    return (
      <div className={cellClass}>
        {content}
        {/* Truncation button logic */}
        {isLong && (
          <button onClick={toggleExpand} className="expand-button">
            {isExpanded ? 'View less' : '...'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <style>
        {`
          /* ===================================== */
          /* MOBILE-FIRST BASE STYLES (Performance Focus) */
          /* ===================================== */
          .dashboard-container {
            min-height: 100vh;
            background-color: #f7f9fc;
            padding: 1rem; 
            font-family: 'Inter', sans-serif;
            color: #333;
            -webkit-tap-highlight-color: transparent; 
          }
          .main-card {
            max-width: 1200px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); 
            border-radius: 12px;
            padding: 1rem;
          }
          .header-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 1rem;
            text-align: center;
            border-bottom: 2px solid #e0e7ff;
            padding-bottom: 0.5rem;
          }
          
          /* Filter Bar */
          .filter-bar {
            display: flex;
            flex-direction: column; 
            align-items: stretch;
            margin-bottom: 1rem;
            gap: 0.75rem;
          }
          .filter-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .status-select {
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 0.875rem;
            outline: none;
            background-color: white;
            min-width: 100px;
          }

          /* Card View Structure (Applies to all screens for simplicity and speed) */
          .table-wrapper {
            overflow: hidden;
          }
          .data-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 12px; 
            margin-top: 12px;
          }
          .table-head {
            display: none; /* Header is always hidden for card view */
          }
          .table-body tr {
            display: block; 
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            margin-bottom: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            transition: box-shadow 0.2s;
            background-color: white; /* Ensure consistent white background */
          }
          .table-body tr:hover {
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          }
          .table-body td {
            display: flex; 
            justify-content: space-between;
            align-items: flex-start;
            padding: 0.5rem 0;
            font-size: 0.95rem;
            border-bottom: 1px dashed #e0e7ff; /* Clear separator between fields */
            word-break: break-word; 
            white-space: normal;
          }
          .table-body td:last-of-type {
            border-bottom: none; 
          }
          
          /* Field Label Styling (The "Chờ Xác Nhận" part) */
          .table-body td::before {
            content: attr(data-label);
            font-weight: 600;
            color: #1e3a8a;
            min-width: 40%;
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
            text-align: center;
            margin-left: auto;
            line-height: 1;
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
          .status-new { /* NEW RED STATUS */
            background-color: #fee2e2; 
            color: #b91c1c; 
          }
          
          /* Highlight Important Fields (Chờ Xác Nhận / Chờ Đóng) */
          .important-field {
            font-weight: bold;
            color: #1d4ed8; /* Darker blue for values */
          }
          /* Apply bold/highlight to the label too when it's an important field */
          .table-body td[data-label="Chờ Xác Nhận"]::before,
          .table-body td[data-label="Chờ Đóng"]::before {
              font-weight: bold;
              color: #1d4ed8;
          }
          .important-field .status-badge {
             box-shadow: 0 0 5px rgba(29, 78, 216, 0.5); /* Subtle emphasis on the badge */
          }

          /* Truncation and Expansion Button */
          .expand-button {
            background: none;
            border: none;
            color: #1d4ed8;
            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 700; /* Bold for the '...' */
            margin-top: 0.25rem;
            padding: 0 4px;
            text-decoration: none;
            text-align: right;
            display: block;
            width: fit-content;
            margin-left: auto; /* Push to the right */
            line-height: 1;
          }

          .loading-message, .empty-message {
            text-align: center;
            padding: 3rem 0;
            font-size: 1.125rem;
            color: #6b7280;
          }
        `}
      </style>

      <div className="main-card">
        <h1 className="header-title">
          HỆ THỐNG BẢO TRÌ
        </h1>

        {/* Filter bar */}
        <div className="filter-bar">
          <p className="filter-info">
            Thể hiện <span className="count-highlight">{filtered.length}</span> trong <span className="count-highlight">{data.length}</span> các sự cố
          </p>
          <div className="filter-controls">
            <label className="select-label">Lọc theo Status:</label>
            <select
              className="status-select"
              value={statusFilter}
              onChange={(e) => handleFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Table/Card View */}
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
                      <td key={j} data-label={key}>
                        {renderContent(key, row[key], i, j)}
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
