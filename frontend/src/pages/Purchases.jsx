import React, { useEffect, useState } from "react";
import axios from "axios";

const Purchases = ({ userRole }) => {
  const [purchases, setPurchases] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [bases, setBases] = useState([]);
  const [filters, setFilters] = useState({
    base: "",
    assetType: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token"); // adjust key if different

  // Fetch asset types for dropdown
  const fetchAssetTypes = async () => {
    try {
      const res = await axios.get("/api/asset-types", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssetTypes(res.data || []);
    } catch (err) {
      console.error("Error fetching asset types:", err);
    }
  };

  // Fetch bases for dropdown (assuming you have an API for bases)
  const fetchBases = async () => {
    try {
      const res = await axios.get("/api/bases", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBases(res.data || []);
    } catch (err) {
      console.error("Error fetching bases:", err);
    }
  };

  // Fetch purchases with optional filters
  const fetchPurchases = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/api/purchases";
      let params = {};

      if (userRole === "logistics officer" && filters.base) {
        // Use base-specific route for logistics officer if base selected
        url = `/api/purchases/base/${filters.base}`;
      } else {
        // Add query params for filtering if admin or other roles
        if (filters.base) params.base = filters.base;
        if (filters.assetType) params.assetType = filters.assetType;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setPurchases(res.data.data || []);
    } catch (err) {
      console.error("Error fetching purchases:", err);
      setError("Failed to fetch purchases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetTypes();
    fetchBases();
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Purchases</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          name="base"
          value={filters.base}
          onChange={handleFilterChange}
          className="border rounded px-3 py-2"
        >
          <option value="">All Bases</option>
          {bases.map((base) => (
            <option key={base._id} value={base._id}>
              {base.name}
            </option>
          ))}
        </select>

        <select
          name="assetType"
          value={filters.assetType}
          onChange={handleFilterChange}
          className="border rounded px-3 py-2"
        >
          <option value="">All Asset Types</option>
          {assetTypes.map((type) => (
            <option key={type._id} value={type._id}>
              {type.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="border rounded px-3 py-2"
          placeholder="Start Date"
        />

        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="border rounded px-3 py-2"
          placeholder="End Date"
        />
      </div>

      {/* Loading & Error */}
      {loading && <p>Loading purchases...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Purchases Table */}
      {!loading && purchases.length === 0 && <p>No purchases found.</p>}

      {!loading && purchases.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Asset Type</th>
                <th className="border px-4 py-2 text-left">Base</th>
                <th className="border px-4 py-2 text-left">Quantity</th>
                <th className="border px-4 py-2 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">
                    {purchase.assetType?.name || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {purchase.base?.name || "N/A"}
                  </td>
                  <td className="border px-4 py-2">{purchase.quantity}</td>
                  <td className="border px-4 py-2">
                    {new Date(purchase.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Purchases;
