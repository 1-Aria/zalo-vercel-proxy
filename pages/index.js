import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detect query params (e.g., ?status=pending)
  const query = typeof window !== "undefined" ? window.location.search : "";
  const endpoint =
    "https://script.google.com/macros/s/AKfycbxTUqUYhz9sNpp1SFTdwS4eK4z6_Rb_I49lU17vPdPiNJM1d9AHKvHYO4y8NgHntN97zA/exec" +
    query;

  useEffect(() => {
    fetch(endpoint)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [endpoint]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          📊 Request Dashboard
        </h1>

        {loading ? (
          <div className="text-center text-gray-500 text-lg py-10">
            Loading data...
          </div>
        ) : data.length === 0 ? (
          <div className="text-center text-gray-400 text-lg py-10">
            No data available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-blue-600 text-white sticky top-0">
                <tr>
                  {Object.keys(data[0] || {}).map((key) => (
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
                {data.map((row, i) => (
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
