import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Transfers = () => {
  const { user } = useAuth();
  const LogisticsCard = ({ user, baseName }) => {
    if (!user || user.role !== "logistics officer") return null;

    return (
      <div className="mb-6 bg-green-50 border-green-400 border p-4 rounded shadow text-green-700">
        <h3 className="text-xl font-semibold mb-2">Base Logistics Officer Details</h3>
        <p>
          <strong>Name:</strong> {user.name || "N/A"}
        </p>

        <p>
          <strong>Service ID:</strong> {user.serviceId || "N/A"}
        </p>
        <p>
          <strong>Base:</strong> {baseName || "N/A"}
        </p>
      </div>
    );
  };

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
      <tr className="odd:bg-[#273927] even:bg-[#1f2d1f] text-white border-b border-green-700">
        <td className="border-x border-green-700 px-3 py-2">
          {getBaseName(transfer.fromBase?._id || transfer.fromBase)}
        </td>
        <td className="border-x border-green-700 px-3 py-2">
          {getBaseName(transfer.toBase?._id || transfer.toBase)}
        </td>
        <td className="border-x border-green-700 px-3 py-2">
          {transferAssetType}
        </td>
        <td className="border-x border-green-700 px-3 py-2">
          {transfer.quantity}
        </td>
        <td className="border-x border-green-700 px-3 py-2">
          {transfer.date
            ? new Date(transfer.date).toLocaleString()
            : "No date/time"}
        </td>
        <td className="border-x border-green-700 px-3 py-2">
          {initiatedByDisplay}
        </td>
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

  const canTransfer =
    user?.role === "admin" || user?.role === "logistics officer";

  const getBaseName = (baseId) => {
    if (!baseId) return "Unknown";
    const foundBase = bases.find(
      (b) => normalizeId(b._id) === normalizeId(baseId)
    );
    return foundBase ? foundBase.name : "Unknown";
  };

  useEffect(() => {
    if (!user) return;

    const fetchBases = async () => {
      try {
        const basesRes = await api.get("/bases");
        setBases(Array.isArray(basesRes.data.data) ? basesRes.data.data : []);

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

  useEffect(() => {
    if (!user) return;

    const fetchTransfers = async () => {
      setLoading(true);
      try {
        if (user.role === "admin" && !user.baseId) {
          const allTransfersRes = await api.get("/transfers/all");
          const allTransfers = Array.isArray(allTransfersRes.data.data)
            ? allTransfersRes.data.data
            : [];

          setOutgoingTransfers(allTransfers);
          setIncomingTransfers(allTransfers);
        } else {
          const baseId = normalizeId(user?.baseId?._id || user?.baseId);
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
        }
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
  }, [user, transferring]);

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
  }, [formData.fromBase, formData.toBase]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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

      const baseId = normalizeId(user?.baseId?._id || user?.baseId);

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
    <div className="min-h-screen bg-[#1f2d1f] text-white font-[Rajdhani] px-4 py-6">
      <h2 className="text-3xl font-extrabold tracking-widest uppercase text-center mb-8 border-b border-green-600 pb-3">
        Transfers
      </h2>

      {canTransfer && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 max-w-lg mx-auto space-y-6 bg-[#2e3d2e] p-6 rounded-xl border border-green-700 shadow-lg"
        >
          <div>
            <LogisticsCard user={user} baseName={user.baseId?.name} />
            <label className="block font-semibold mb-1 uppercase tracking-wide">
              From Base
            </label>
            {user.role === "admin" ? (
              <select
                name="fromBase"
                value={formData.fromBase}
                onChange={handleChange}
                className="w-full bg-[#1b2a1b] border border-green-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full bg-gray-700 border border-green-700 rounded-md px-3 py-2 text-white cursor-not-allowed"
              />
            ) : null}
          </div>

          <div>
            <label className="block font-semibold mb-1 uppercase tracking-wide">
              To Base
            </label>
            <select
              name="toBase"
              value={formData.toBase}
              onChange={handleChange}
              className="w-full bg-[#1b2a1b] border border-green-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
            <label className="block font-semibold mb-1 uppercase tracking-wide">
              Equipment Type
            </label>
            <select
              name="assetType"
              value={formData.assetType}
              onChange={handleChange}
              className="w-full bg-[#1b2a1b] border border-green-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={assetTypes.length === 0}
            >
              <option value="">Select equipment</option>
              {assetTypes.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} - {a.netQuantity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 uppercase tracking-wide">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              min={1}
              value={formData.quantity}
              onChange={handleChange}
              className="w-full bg-[#1b2a1b] border border-green-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={transferring}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed uppercase font-bold tracking-wider py-3 rounded-md transition"
          >
            {transferring ? "Transferring..." : "Transfer"}
          </button>
        </form>
      )}

      <div className="max-w-7xl mx-auto">
        <h3 className="text-2xl font-bold uppercase border-b border-green-600 pb-2 mb-4">
          Outgoing Transfers
        </h3>
        {loading ? (
          <p className="text-center text-green-400">Loading...</p>
        ) : outgoingTransfers.length === 0 ? (
          <p className="text-center text-green-400">
            No outgoing transfers found.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-green-700 shadow-lg">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-[#334433] uppercase text-green-300 font-semibold tracking-wide">
                <tr>
                  <th className="border-x border-green-700 px-4 py-2">
                    From Base
                  </th>
                  <th className="border-x border-green-700 px-4 py-2">
                    To Base
                  </th>
                  <th className="border-x border-green-700 px-4 py-2">
                    Equipment
                  </th>
                  <th className="border-x border-green-700 px-4 py-2">
                    Quantity
                  </th>
                  <th className="border-x border-green-700 px-4 py-2">
                    Date/Time
                  </th>
                  <th className="border-x border-green-700 px-4 py-2">
                    Initiated By
                  </th>
                </tr>
              </thead>
              <tbody>
                {outgoingTransfers.map((t) => (
                  <TransferRow
                    key={t._id}
                    transfer={t}
                    getBaseName={getBaseName}
                    assetTypes={assetTypes}
                    normalizeId={normalizeId}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h3 className="mt-12 text-2xl font-bold uppercase border-b border-green-600 pb-2 mb-4">
          Incoming Transfers
        </h3>
        {loading ? (
          <p className="text-center text-green-400">Loading...</p>
        ) : incomingTransfers.length === 0 ? (
          <p className="text-center text-green-400">
            No incoming transfers found.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-green-700 shadow-lg">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-[#334433] uppercase text-green-300 font-semibold tracking-wide">
                <tr>
                  <th className="border-x border-green-700 px-4 py-2">
                    From Base
                  </th>
                  <th className="border-x border-green-700 px-4 py-2">
                    To Base
                  </th>
                  <th className="border-x border-green-700 px-4 py-2">
                    Equipment
                  </th>
                  <th className="border-x border-green-700 px-4 py-2">
                    Quantity
                  </th>
                  <th className="border-x border-green-700 px-4 py-2">
                    Date/Time
                  </th>
                  <th className="border-x border-green-700 px-4 py-2">
                    Initiated By
                  </th>
                </tr>
              </thead>
              <tbody>
                {incomingTransfers.map((t) => (
                  <TransferRow
                    key={t._id}
                    transfer={t}
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
    </div>
  );
};

export default Transfers;
