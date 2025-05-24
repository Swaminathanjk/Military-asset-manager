import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Purchases = () => {
  const { user } = useAuth();

  const normalizeId = (id) => (id ? id.toString() : "");

  const [formData, setFormData] = useState({
    base: "",
    assetType: "",
    quantity: 1,
  });

  const [bases, setBases] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  console.log(filteredPurchases);

  const canPurchase =
    user?.role === "admin" || user?.role === "logistics officer";

  useEffect(() => {
    if (!user) return;

    const fetchBases = async () => {
      try {
        const basesRes = await api.get("/bases");
        const baseList = Array.isArray(basesRes.data.data)
          ? basesRes.data.data
          : [];
        setBases(baseList);

        // Only auto-fill base in form if role is logistics officer or base commander
        if (
          (user.role === "base commander" ||
            user.role === "logistics officer") &&
          user.baseId
        ) {
          setFormData((prev) => ({
            ...prev,
            base: normalizeId(user.baseId._id || user.baseId),
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
    if (!formData.base) {
      setAssetTypes([]);
      setFormData((prev) => ({ ...prev, assetType: "" }));
      return;
    }

    const fetchAssetTypes = async () => {
      try {
        const res = await api.get(`/asset-types`);
        setAssetTypes(Array.isArray(res.data) ? res.data : []);
        setFormData((prev) => ({ ...prev, assetType: "" }));
      } catch (err) {
        console.error("Fetch asset types error:", err);
        toast.error("Failed to load equipment types for selected base");
        setAssetTypes([]);
        setFormData((prev) => ({ ...prev, assetType: "" }));
      }
    };

    fetchAssetTypes();
  }, [formData.base]);

  useEffect(() => {
    if (!user) return;

    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const res = await api.get("/purchases");
        const allPurchases = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];

        setPurchases(allPurchases);

        if (
          (user.role === "base commander" ||
            user.role === "logistics officer") &&
          user.baseId
        ) {
          const filtered = allPurchases.filter(
            (p) =>
              normalizeId(p.base?._id || p.base) ===
              normalizeId(user.baseId._id || user.baseId)
          );
          setFilteredPurchases(filtered);
        } else {
          setFilteredPurchases(allPurchases);
        }
      } catch (err) {
        console.error("Fetch purchases error:", err);
        toast.error("Failed to load purchases");
        setPurchases([]);
        setFilteredPurchases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "base" && user.role === "base commander") return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.base || !formData.assetType || !formData.quantity) {
      toast.error("Please fill all fields");
      return;
    }

    setPurchasing(true);
    try {
      await api.post("/purchases", {
        base: normalizeId(formData.base),
        assetType: formData.assetType,
        quantity: Number(formData.quantity),
        purchasedBy: user._id,
      });

      toast.success("Purchase recorded");

      setFormData({
        base:
          user.role === "base commander"
            ? normalizeId(user.baseId._id || user.baseId)
            : "",
        assetType: "",
        quantity: 1,
      });

      const res = await api.get("/purchases");
      const allPurchases = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];

      setPurchases(allPurchases);

      if (
        (user.role === "base commander" || user.role === "logistics officer") &&
        user.baseId
      ) {
        const filtered = allPurchases.filter(
          (p) =>
            normalizeId(p.base?._id || p.base) ===
            normalizeId(user.baseId._id || user.baseId)
        );
        setFilteredPurchases(filtered);
      } else {
        setFilteredPurchases(allPurchases);
      }
    } catch (err) {
      console.error("Create purchase error:", err);
      toast.error(err.response?.data?.message || "Purchase failed");
    } finally {
      setPurchasing(false);
    }
  };

  const baseName =
    Array.isArray(bases) &&
    bases.find((b) => normalizeId(b._id) === normalizeId(formData.base))?.name;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Purchases</h2>

      {canPurchase && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 max-w-md space-y-4 border p-4 rounded shadow"
        >
          <div>
            <label className="block font-semibold mb-1">Base</label>
            {user.role === "admin" ? (
              <select
                name="base"
                value={formData.base}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Select base</option>
                {bases.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            ) : user.role === "logistics officer" ? (
              <input
                type="text"
                value={
                  bases.find((b) => b._id === (user.baseId._id || user.baseId))
                    ?.name || "Unknown Base"
                }
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-200 cursor-not-allowed"
              />
            ) : (
              <input
                type="text"
                value="Unknown"
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-200 cursor-not-allowed"
              />
            )}
          </div>

          <div>
            <label className="block font-semibold mb-1">Equipment Type</label>
            <select
              name="assetType"
              value={formData.assetType}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
              disabled={assetTypes.length === 0 || !formData.base}
            >
              <option value="">
                {!formData.base
                  ? "Select base first"
                  : assetTypes.length === 0
                  ? "No types available"
                  : "Select equipment type"}
              </option>
              {assetTypes.map((type) => (
                <option key={type._id || type.id} value={type._id || type.id}>
                  {type.name}
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
            disabled={purchasing}
            className={`w-full py-2 rounded font-semibold text-white ${
              purchasing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {purchasing ? "Saving..." : "Add Purchase"}
          </button>
        </form>
      )}

      <h3 className="text-xl font-semibold mb-3">Purchase Records</h3>

      {loading ? (
        <p>Loading purchases...</p>
      ) : filteredPurchases.length === 0 ? (
        <p>No purchase records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-300 rounded">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-3 py-2">Base</th>
                <th className="border px-3 py-2">Equipment</th>
                <th className="border px-3 py-2">Quantity</th>
                <th className="border px-3 py-2">Purchase Date</th>
                <th className="border px-3 py-2">Purchased By</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((purchase) => {
                const isAdminPurchase = !purchase.base;

                const purchaseBase = isAdminPurchase
                  ? "Admin"
                  : bases.find(
                      (b) =>
                        normalizeId(b._id) ===
                        normalizeId(purchase.base?._id || purchase.base)
                    )?.name || "Unknown Base";

                const purchaseAssetType =
                  typeof purchase.assetType === "object"
                    ? purchase.assetType.name
                    : assetTypes.find(
                        (a) =>
                          normalizeId(a._id) === normalizeId(purchase.assetType)
                      )?.name || purchase.assetType;

                const purchasedByDisplay =
                  purchase.purchasedBy?.role === "admin"
                    ? "Admin"
                    : typeof purchase.purchasedBy === "object"
                    ? purchase.purchasedBy.name ||
                      purchase.purchasedBy._id ||
                      "Unknown"
                    : purchase.purchasedBy || "Unknown";

                return (
                  <tr
                    key={purchase._id || purchase.id}
                    className="odd:bg-white even:bg-gray-50"
                  >
                    <td className="border px-3 py-2">{purchaseBase}</td>
                    <td className="border px-3 py-2">{purchaseAssetType}</td>
                    <td className="border px-3 py-2">{purchase.quantity}</td>
                    <td className="border px-3 py-2">
                      {purchase.createdAt
                        ? new Date(purchase.createdAt).toLocaleString()
                        : "No date/time"}
                    </td>
                    <td className="border px-3 py-2">
                      {purchasedByDisplay}
                      {purchase.purchasedBy?.serviceId
                        ? ` (${purchase.purchasedBy.serviceId})`
                        : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Purchases;
