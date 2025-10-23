import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const endpoint =
    "https://script.google.com/macros/s/AKfycbxTUqUYhz9sNpp1SFTdwS4eK4z6_Rb_I49lU17vPdPiNJM1d9AHKvHYO4y8NgHntN97zA/exec";

  useEffect(() => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setFiltered(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = (status) => {
    setStatusFilter(status);
    if (status === "all") {
      setFiltered(data);
    } else {
      const lower = status.toLowerCase();
      setFiltered(data.filter((row) => String(row.Status || "").toLowerCase() === lower));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          📊 Request Dashboard
        </h1>

        {/* Filter bar */}
        <div className="flex flex-wrap justify-between items-center mb-4">
          <p className="text-gray-600 text-sm">
            Showing {filtered.length} of {data.length} entries
          </p>
          <div className="flex items-center space-x-3">
            <label className="text-gray-700 font-medium">Filter by Status:</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
              value={statusFilter}
              onChange={(e) => handleFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-gray-500 text-lg py-10">Loading data...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 text-lg py-10">
            No data available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-blue-600 text-white sticky top-0">
                <tr>
                  {Object.keys(filtered[0] || {}).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-sm font-semibold border-b border-blue-700"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr
                    key={i}
                    className={`${
                      i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50 transition-colors`}
                  >
                    {Object.values(row).map((val, j) => (
                      <td
                        key={j}
                        className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200"
                      >
                        {String(val)}
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
