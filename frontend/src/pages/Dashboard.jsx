import { useState, useEffect } from "react";
import api from "../services/api";
import Card from "../UI/Card";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { user } = useAuth();
  // console.log("Dashboard component rendered, user:", user);

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

        // If user is commander or logistics officer, set base to their assigned base
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

  // Handle filter changes (prevent base change for commander/logistics)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      name === "base" &&
      (user?.role === "base commander" || user?.role === "logistics officer")
    )
      return; // base fixed for these roles
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch dashboard data when filters or user changes
  useEffect(() => {
    if (!user) return;

    fetchDashboardData();
  }, [filters, user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = {};

      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      if (user.role === "base commander" || user.role === "logistics officer") {
        // Force user's base for commanders/logistics
        params.base = user.baseId._id || user.baseId;
      } else if (filters.base) {
        params.base = filters.base;
      }

      if (filters.assetType) params.assetType = filters.assetType;

      console.log("Fetching dashboard with params:", params);

      const res = await api.get("/dashboard", { params });
      console.log("Dashboard API response:", res.data);
      setDashboardData(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Debug logs
  // console.log("User base:", user?.base);
  // console.log("Filters base:", filters.base);
  // console.log("Bases:", bases);

  // Safe base id retrieval
  const baseId = typeof user.base === "string" ? user.base : user.base?._id;

  const baseName =
    bases.find((b) => b._id === filters.base)?.name ||
    (typeof user.base === "object" ? user.base.name : "Your Base");

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

        {/* Base dropdown or fixed base */}
        {user?.role === "base commander" ||
        user?.role === "logistics officer" ? (
          <input
            type="text"
            name="base"
            className="border rounded-md p-2 bg-gray-100 cursor-not-allowed"
            value={
              // Find base name for display
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
            <option value="">Select Base</option>
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
          <option value="">Select Asset Type</option>
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
