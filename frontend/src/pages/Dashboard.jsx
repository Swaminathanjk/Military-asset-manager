import { useState, useEffect } from "react";
import api from "../services/api";
import Card from "../UI/Card";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    base: "",
    assetType: "",
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [bases, setBases] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);

  // Fetch bases and asset types on mount
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const basesResponse = await api.get("/bases");
        setBases(basesResponse.data.data || []);

        const assetTypesResponse = await api.get("/asset-types");
        setAssetTypes(assetTypesResponse.data || []);

        if (
          (user?.role === "base commander" ||
            user?.role === "logistics officer") &&
          user?.baseId
        ) {
          setFilters((prev) => ({
            ...prev,
            base: user.baseId._id || user.baseId,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch filter data", error);
        toast.error("Failed to load filter options");
      }
    };
    fetchFiltersData();
  }, [user]);

  // Fetch asset types when base changes
  useEffect(() => {
    const fetchAssetTypes = async () => {
      try {
        if (!filters.base) {
          // If "All Bases" selected
          const res = await api.get("/asset-types");
          setAssetTypes(res.data || []);
        } else {
          // If specific base is selected
          const res = await api.get(`/asset-types/base/${filters.base}`);
          setAssetTypes(Array.isArray(res.data) ? res.data : []);
        }

        // Reset asset type on base change
        setFilters((prev) => ({ ...prev, assetType: "" }));
      } catch (error) {
        console.error("Failed to fetch asset types", error);
        toast.error("Failed to load asset types");
        setAssetTypes([]);
      }
    };

    fetchAssetTypes();
  }, [filters.base]);

  // Handle filter changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      name === "base" &&
      (user?.role === "base commander" || user?.role === "logistics officer")
    )
      return;

    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [filters, user]);

  const fetchDashboardData = async () => {
    if (!user || !filters.startDate || !filters.endDate) return;
    setLoading(true);
    try {
      const params = {};

      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      if (user.role === "base commander" || user.role === "logistics officer") {
        params.base = user.baseId._id || user.baseId;
      } else if (filters.base) {
        params.base = filters.base;
      }

      if (filters.assetType) params.assetType = filters.assetType;

      const res = await api.get("/dashboard", { params });
      setDashboardData(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Opening Balance", value: 0 },
    { label: "Closing Balance", value: dashboardData?.closingBalance ?? 0 },
    {
      label: "Net Movement",
      value: dashboardData?.netMovement ?? 0,
      highlight: true,
    },
    { label: "Assigned", value: dashboardData?.assigned?.length ?? 0 },
    { label: "Expended", value: dashboardData?.expended?.length ?? 0 },
    {
      label: "Purchased",
      value:
        dashboardData?.purchases?.reduce((a, b) => a + (b.total ?? 0), 0) ?? 0,
    },
    {
      label: "Transferred Out",
      value:
        dashboardData?.transfersOut?.reduce((a, b) => a + (b.total ?? 0), 0) ??
        0,
    },
    {
      label: "Transferred In",
      value:
        dashboardData?.transfersIn?.reduce((a, b) => a + (b.total ?? 0), 0) ??
        0,
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="date"
          name="startDate"
          className="border rounded-md p-2"
          value={filters.startDate}
          onChange={handleChange}
        />

        <input
          type="date"
          name="endDate"
          className="border rounded-md p-2"
          value={filters.endDate}
          onChange={handleChange}
        />

        {user?.role === "base commander" ||
        user?.role === "logistics officer" ? (
          <input
            type="text"
            name="base"
            className="border rounded-md p-2 bg-gray-100 cursor-not-allowed"
            value={
              bases.find((b) => b._id === filters.base)?.name ||
              user.baseId?.name ||
              "Your Base"
            }
            disabled
            readOnly
          />
        ) : (
          <select
            name="base"
            className="border rounded-md p-2"
            value={filters.base}
            onChange={handleChange}
          >
            {user?.role === "admin" && <option value="">All Bases</option>}
            {bases.map((base) => (
              <option key={base._id} value={base._id}>
                {base.name}
              </option>
            ))}
          </select>
        )}

        <select
          name="assetType"
          className="border rounded-md p-2"
          value={filters.assetType}
          onChange={handleChange}
        >
          <option value="">All Asset Types</option>
          {assetTypes.map((type) => (
            <option key={type._id} value={type._id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Metrics */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <Card
              key={idx}
              label={stat.label}
              value={stat.value}
              highlight={stat.highlight}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
