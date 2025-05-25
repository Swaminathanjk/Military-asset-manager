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
        toast.error("Failed to load transactions", {
          position: "top-right",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [startDate, endDate, type, assetType, base]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 font-[Rajdhani]"
      onClick={onClose}
    >
      <div
        className="bg-[#2f3a2f] rounded-lg shadow-2xl max-w-6xl w-full max-h-[80vh] overflow-auto p-8 relative border-4 border-green-700"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-green-400 hover:text-green-600 font-extrabold text-3xl cursor-pointer select-none"
          aria-label="Close popup"
        >
          ×
        </button>

        <h3 className="text-2xl font-extrabold mb-6 uppercase tracking-widest text-green-400 border-b border-green-600 pb-2">
          {type.replace(/-/g, " ")} Transactions
        </h3>

        {loading ? (
          <p className="text-green-300 font-semibold text-center">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-green-300 font-semibold text-center">
            No transactions found for selected filters.
          </p>
        ) : (
          <table className="w-full border-collapse text-left text-green-100">
            <thead>
              <tr className="bg-green-800 text-green-300 uppercase text-sm tracking-wider">
                <th className="border-b border-green-600 px-4 py-3">Date</th>
                <th className="border-b border-green-600 px-4 py-3">
                  Asset Type
                </th>
                <th className="border-b border-green-600 px-4 py-3">Base</th>
                <th className="border-b border-green-600 px-4 py-3">
                  Quantity
                </th>

                {type === "assignment" && (
                  <>
                    <th className="border-b border-green-600 px-4 py-3">
                      Assigned To
                    </th>
                    <th className="border-b border-green-600 px-4 py-3">
                      Assigned By
                    </th>
                  </>
                )}

                {(type === "transfer-in" || type === "transfer-out") && (
                  <>
                    <th className="border-b border-green-600 px-4 py-3">
                      From Base
                    </th>
                    <th className="border-b border-green-600 px-4 py-3">
                      To Base
                    </th>
                    <th className="border-b border-green-600 px-4 py-3">
                      Initiated By
                    </th>
                  </>
                )}

                {type === "purchase" && (
                  <th className="border-b border-green-600 px-4 py-3">
                    Purchased By
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx._id}
                  className="odd:bg-[#344334] even:bg-[#2d3b2d] hover:bg-green-700 transition-colors"
                >
                  <td className="border-b border-green-700 px-4 py-2 font-mono text-sm">
                    {new Date(tx.date || tx.timestamp).toLocaleString()}
                  </td>
                  <td className="border-b border-green-700 px-4 py-2">
                    {tx.assetType?.name}
                  </td>
                  <td className="border-b border-green-700 px-4 py-2">
                    {tx.base?.name}
                  </td>
                  <td className="border-b border-green-700 px-4 py-2">
                    {tx.quantity ?? "-"}
                  </td>

                  {type === "assignment" && (
                    <>
                      <td className="border-b border-green-700 px-4 py-2">
                        {tx.reference?.assignedTo?.name || "-"}
                      </td>
                      <td className="border-b border-green-700 px-4 py-2">
                        {tx.reference?.assignedBy?.name || "-"}
                      </td>
                    </>
                  )}

                  {(type === "transfer-in" || type === "transfer-out") && (
                    <>
                      <td className="border-b border-green-700 px-4 py-2">
                        {tx.reference?.fromBase?.name || "-"}
                      </td>
                      <td className="border-b border-green-700 px-4 py-2">
                        {tx.reference?.toBase?.name || "-"}
                      </td>
                      <td className="border-b border-green-700 px-4 py-2">
                        {tx.reference?.initiatedBy?.name || "-"}
                      </td>
                    </>
                  )}

                  {type === "purchase" && (
                    <td className="border-b border-green-700 px-4 py-2">
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
