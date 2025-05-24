import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Transfers = () => {
  const { user } = useAuth();

  const normalizeId = (id) => (id ? id.toString() : "");
  const TransferRow = ({ transfer, getBaseName, assetTypes, normalizeId }) => {
    const transferAssetType =
      typeof transfer.assetType === "object"
        ? transfer.assetType.name
        : assetTypes.find(
            (a) => normalizeId(a._id) === normalizeId(transfer.assetType)
          )?.name || transfer.assetType;

    const initiatedByDisplay =
      transfer.initiatedBy?.name || transfer.initiatedBy || "Unknown";

    return (
      <tr className="odd:bg-white even:bg-gray-50">
        <td className="border px-3 py-2">
          {getBaseName(transfer.fromBase?._id || transfer.fromBase)}
        </td>
        <td className="border px-3 py-2">
          {getBaseName(transfer.toBase?._id || transfer.toBase)}
        </td>
        <td className="border px-3 py-2">{transferAssetType}</td>
        <td className="border px-3 py-2">{transfer.quantity}</td>
        <td className="border px-3 py-2">
          {transfer.date
            ? new Date(transfer.date).toLocaleString()
            : "No date/time"}
        </td>
        <td className="border px-3 py-2">{initiatedByDisplay}</td>
      </tr>
    );
  };

  const [formData, setFormData] = useState({
    fromBase: "",
    toBase: "",
    assetType: "",
    quantity: 1,
  });
  const [bases, setBases] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [outgoingTransfers, setOutgoingTransfers] = useState([]);
  const [incomingTransfers, setIncomingTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);

  
  
  // Role check: who can do transfers
  const canTransfer =
    user?.role === "admin" || user?.role === "logistics officer";

  // Helper to get base name by ID
  const getBaseName = (baseId) => {
    if (!baseId) return "Unknown";
    const foundBase = bases.find(
      (b) => normalizeId(b._id) === normalizeId(baseId)
    );
    return foundBase ? foundBase.name : "Unknown";
  };

  // Fetch bases on mount if user can transfer
  useEffect(() => {
    if (!user) return;

    const fetchBases = async () => {
      try {
        const basesRes = await api.get("/bases");
        setBases(Array.isArray(basesRes.data.data) ? basesRes.data.data : []);

        // For logistics officer, fix fromBase to user's base
        if (user.role === "logistics officer" && user.baseId) {
          setFormData((prev) => ({
            ...prev,
            fromBase: normalizeId(user.baseId._id || user.baseId),
          }));
        }
      } catch (err) {
        console.error("Fetch bases error:", err);
        toast.error("Failed to load bases");
      }
    };

    fetchBases();
  }, [user]);

  // Fetch outgoing and incoming transfers when user or bases change
  useEffect(() => {
    if (!user || !user.baseId) return;

    const fetchTransfers = async () => {
      setLoading(true);
      try {
        const [outgoingRes, incomingRes] = await Promise.all([
          api.get(
            `/transfers?fromBase=${normalizeId(user.baseId._id || user.baseId)}`
          ),
          api.get(
            `/transfers?toBase=${normalizeId(user.baseId._id || user.baseId)}`
          ),
        ]);

        setOutgoingTransfers(
          Array.isArray(outgoingRes.data.data) ? outgoingRes.data.data : []
        );
        setIncomingTransfers(
          Array.isArray(incomingRes.data.data) ? incomingRes.data.data : []
        );
      } catch (err) {
        console.error("Transfer fetch error:", err);
        toast.error("Failed to load transfers");
        setOutgoingTransfers([]);
        setIncomingTransfers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
  }, [user]);

  // Fetch asset types when fromBase changes (optional, if needed)
  useEffect(() => {
    if (!formData.fromBase) {
      setAssetTypes([]);
      setFormData((prev) => ({ ...prev, assetType: "" }));
      return;
    }

    const fetchAssetTypesForBase = async () => {
      try {
        const res = await api.get(`/asset-types/base/${formData.fromBase}`);
        const data = Array.isArray(res.data) ? res.data : [];
        setAssetTypes(data);
        setFormData((prev) => ({ ...prev, assetType: "" }));
      } catch (err) {
        console.error("Failed to fetch asset types for base:", err);
        toast.error("Failed to load equipment types for selected base");
        setAssetTypes([]);
        setFormData((prev) => ({ ...prev, assetType: "" }));
      }
    };

    fetchAssetTypesForBase();
  }, [formData.fromBase,formData.toBase]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Logistics officer cannot change fromBase (fixed to their base)
    if (name === "fromBase" && user.role === "logistics officer") return;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fromBase ||
      !formData.toBase ||
      !formData.assetType ||
      !formData.quantity
    ) {
      toast.error("Please fill all fields");
      return;
    }

    if (formData.fromBase === formData.toBase) {
      toast.error("From Base and To Base cannot be the same");
      return;
    }

    setTransferring(true);
    try {
      await api.post("/transfers", {
        fromBase: normalizeId(formData.fromBase),
        toBase: normalizeId(formData.toBase),
        assetType: formData.assetType,
        quantity: Number(formData.quantity),
        initiatedBy: user._id,
      });

      toast.success("Transfer recorded");

      setFormData({
        fromBase:
          user.role === "logistics officer"
            ? normalizeId(user.baseId._id || user.baseId)
            : "",
        toBase: "",
        assetType: "",
        quantity: 1,
      });

      // Refresh transfers after submit
      const baseId = normalizeId(user.baseId._id || user.baseId);

      const [outgoingRes, incomingRes] = await Promise.all([
        api.get(`/transfers?fromBase=${baseId}`),
        api.get(`/transfers?toBase=${baseId}`),
      ]);

      setOutgoingTransfers(
        Array.isArray(outgoingRes.data.data) ? outgoingRes.data.data : []
      );
      setIncomingTransfers(
        Array.isArray(incomingRes.data.data) ? incomingRes.data.data : []
      );
    } catch (err) {
      console.error("Create transfer error:", err);
      toast.error(err.response?.data?.message || "Transfer failed");
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Transfers</h2>

      {canTransfer && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 max-w-md space-y-4 border p-4 rounded shadow"
        >
          <div>
            <label className="block font-semibold mb-1">From Base</label>
            {user.role === "admin" ? (
              <select
                name="fromBase"
                value={formData.fromBase}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Select from base</option>
                {bases.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            ) : user.role === "logistics officer" ? (
              <input
                type="text"
                value={getBaseName(user.baseId._id || user.baseId)}
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-200 cursor-not-allowed"
              />
            ) : null}
          </div>

          <div>
            <label className="block font-semibold mb-1">To Base</label>
            <select
              name="toBase"
              value={formData.toBase}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">Select to base</option>
              {bases
                .filter(
                  (b) => normalizeId(b._id) !== normalizeId(formData.fromBase)
                )
                .map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Equipment Type</label>
            <select
              name="assetType"
              value={formData.assetType}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
              disabled={assetTypes.length === 0 || !formData.fromBase}
            >
              <option value="">
                {!formData.fromBase
                  ? "Select from base first"
                  : assetTypes.length === 0
                  ? "No types available"
                  : "Select equipment type"}
              </option>
              {assetTypes.map((type) => (
                <option key={type._id || type.id} value={type._id || type.id}>
                  {type.name} - {type.netQuantity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={transferring}
            className={`w-full py-2 rounded font-semibold text-white ${
              transferring
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {transferring ? "Saving..." : "Add Transfer"}
          </button>
        </form>
      )}

      <h3 className="text-xl font-semibold mb-3">Transfer Records</h3>

      {/* Transfers Tables */}
      <h3 className="text-xl font-semibold mb-3">Outgoing Transfers</h3>
      {loading ? (
        <p>Loading transfers...</p>
      ) : outgoingTransfers.length === 0 ? (
        <p>No outgoing transfers found.</p>
      ) : (
        <div className="overflow-x-auto mb-8">
          <table className="table-auto w-full border border-gray-300 rounded">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-3 py-2">From Base</th>
                <th className="border px-3 py-2">To Base</th>
                <th className="border px-3 py-2">Equipment</th>
                <th className="border px-3 py-2">Quantity</th>
                <th className="border px-3 py-2">Transfer Date</th>
                <th className="border px-3 py-2">Initiated By</th>
              </tr>
            </thead>
            <tbody>
              {outgoingTransfers.map((transfer) => (
                <TransferRow
                  key={transfer._id}
                  transfer={transfer}
                  getBaseName={getBaseName}
                  assetTypes={assetTypes}
                  normalizeId={normalizeId}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-3">Incoming Transfers</h3>
      {loading ? (
        <p>Loading transfers...</p>
      ) : incomingTransfers.length === 0 ? (
        <p>No incoming transfers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-300 rounded">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-3 py-2">From Base</th>
                <th className="border px-3 py-2">To Base</th>
                <th className="border px-3 py-2">Equipment</th>
                <th className="border px-3 py-2">Quantity</th>
                <th className="border px-3 py-2">Transfer Date</th>
                <th className="border px-3 py-2">Initiated By</th>
              </tr>
            </thead>
            <tbody>
              {incomingTransfers.map((transfer) => (
                <TransferRow
                  key={transfer._id}
                  transfer={transfer}
                  getBaseName={getBaseName}
                  assetTypes={assetTypes}
                  normalizeId={normalizeId}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transfers;
