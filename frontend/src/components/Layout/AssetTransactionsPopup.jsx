import React, { useEffect, useState } from "react";

export default function AssetTransactionsPopup({
  isOpen,
  onClose,
  startDate,
  endDate,
  assetType,
  base,
  type, // transaction type: purchase, transfer-in, transfer-out, assignment
}) {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchTransactions() {
      setLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams({
          type,
          base,
          assetType,
          startDate,
          endDate,
        });

        const res = await fetch(`/api/asset-transactions?${query.toString()}`);
        const data = await res.json();

        if (data.success) {
          setTransactions(data.data);
        } else {
          setError(data.error || "Failed to fetch transactions");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [isOpen, type, base, assetType, startDate, endDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-md max-w-3xl w-full max-h-[80vh] overflow-auto p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-lg font-bold"
          aria-label="Close popup"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4">
          Transactions: {type.charAt(0).toUpperCase() + type.slice(1)}
        </h2>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && transactions.length === 0 && (
          <p>No transactions found.</p>
        )}

        {!loading && !error && transactions.length > 0 && (
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Date</th>
                <th className="border border-gray-300 p-2">Asset Type</th>
                <th className="border border-gray-300 p-2">Base</th>
                <th className="border border-gray-300 p-2">Quantity</th>
                <th className="border border-gray-300 p-2">Reference</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td className="border border-gray-300 p-2">
                    {new Date(t.timestamp).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2">{t.assetType.name}</td>
                  <td className="border border-gray-300 p-2">{t.base.name}</td>
                  <td className="border border-gray-300 p-2">{t.quantity}</td>
                  <td className="border border-gray-300 p-2">
                    {t.referenceModel} - {t.reference?._id || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
