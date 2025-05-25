import { useEffect, useState } from "react";
import api from "../../services/api"; // Adjust path if needed
import { toast } from "react-toastify";

const AssetTransactionsPopup = ({
  startDate,
  endDate,
  type,
  assetType,
  base,
  onClose,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!type) return; // Don't fetch if no type

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (type) params.append("type", type);
        if (base) params.append("base", base);
        if (assetType) params.append("assetType", assetType);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const res = await api.get(`/asset-transactions?${params.toString()}`);
        setTransactions(res.data.data || []);
      } catch (error) {
        console.error("Error fetching detailed transactions:", error);
        toast.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [startDate, endDate, type, assetType, base]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[80vh] overflow-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold"
          aria-label="Close popup"
        >
          ×
        </button>
        <h3 className="text-xl font-semibold mb-4 capitalize">
          {type.replace("-", " ")} Transactions
        </h3>

        {loading ? (
          <p>Loading...</p>
        ) : transactions.length === 0 ? (
          <p>No transactions found for selected filters.</p>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="border-b px-4 py-2">Date</th>
                <th className="border-b px-4 py-2">Asset Type</th>
                <th className="border-b px-4 py-2">Base</th>
                <th className="border-b px-4 py-2">Quantity</th>

                {type === "assignment" && (
                  <>
                    <th className="border-b px-4 py-2">Assigned To</th>
                    <th className="border-b px-4 py-2">Assigned By</th>
                  </>
                )}

                {(type === "transfer-in" || type === "transfer-out") && (
                  <>
                    <th className="border-b px-4 py-2">From Base</th>
                    <th className="border-b px-4 py-2">To Base</th>
                    <th className="border-b px-4 py-2">Initiated By</th>
                  </>
                )}

                {type === "purchase" && (
                  <th className="border-b px-4 py-2">Purchased By</th>
                )}
              </tr>
            </thead>

            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} className="odd:bg-gray-50">
                  <td className="border-b px-4 py-2">
                    {new Date(tx.date || tx.timestamp).toLocaleString()}
                  </td>
                  <td className="border-b px-4 py-2">{tx.assetType?.name}</td>
                  <td className="border-b px-4 py-2">{tx.base?.name}</td>
                  <td className="border-b px-4 py-2">{tx.quantity ?? "-"}</td>

                  {type === "assignment" && (
                    <>
                      <td className="border-b px-4 py-2">
                        {tx.reference?.assignedTo?.name || "-"}
                      </td>
                      <td className="border-b px-4 py-2">
                        {tx.reference?.assignedBy?.name || "-"}
                      </td>
                    </>
                  )}

                  {(type === "transfer-in" || type === "transfer-out") && (
                    <>
                      <td className="border-b px-4 py-2">
                        {tx.reference?.fromBase?.name || "-"}
                      </td>
                      <td className="border-b px-4 py-2">
                        {tx.reference?.toBase?.name || "-"}
                      </td>
                      <td className="border-b px-4 py-2">
                        {tx.reference?.initiatedBy?.name || "-"}
                      </td>
                    </>
                  )}

                  {type === "purchase" && (
                    <td className="border-b px-4 py-2">
                      {tx.purchasedBy?.name || "-"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssetTransactionsPopup;
