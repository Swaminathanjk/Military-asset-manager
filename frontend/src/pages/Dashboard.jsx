import { useState, useEffect } from "react";
import api from "../services/api";
import Card from "../UI/Card";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import PersonnelDetails from "../components/PersonnelDetails";

import AssetTransactionsPopup from "../components/Layout/AssetTransactionsPopup";

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

  const [Transactions, setTransactions] = useState([]);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState("");

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

  useEffect(() => {
    const fetchAssetTypes = async () => {
      try {
        if (!filters.base) {
          const res = await api.get("/asset-types");
          setAssetTypes(res.data || []);
        } else {
          const res = await api.get(`/asset-types/base/${filters.base}`);
          setAssetTypes(Array.isArray(res.data) ? res.data : []);
        }
        setFilters((prev) => ({ ...prev, assetType: "" }));
      } catch (error) {
        console.error("Failed to fetch asset types", error);
        toast.error("Failed to load asset types");
        setAssetTypes([]);
      }
    };
    fetchAssetTypes();
  }, [filters.base]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      name === "base" &&
      (user?.role === "base commander" || user?.role === "logistics officer")
    )
      return;

    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!popupOpen) return;

    const fetchTransactions = async () => {
      try {
        const params = new URLSearchParams({
          type: popupType,
          base: filters.base,
          assetType: filters.assetType,
          startDate: filters.startDate,
          endDate: filters.endDate,
        });

        const res = await api.get(`/asset-transactions?${params.toString()}`);
        setTransactions(res.data.data || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [popupOpen, popupType, filters]);

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
    { label: "Opening Balance", value: 0, type: "opening-balance" },
    {
      label: "Closing Balance",
      value: dashboardData?.closingBalance ?? 0,
      type: "closing-balance",
    },
    {
      label: "Net Movement",
      value: dashboardData?.netMovement ?? 0,
      highlight: true,
      type: "net-movement",
    },
    {
      label: "Assigned",
      value:
        dashboardData?.assigned?.reduce((a, b) => a + (b.total ?? 0), 0) ?? 0,
      type: "assignment",
    },

    {
      label: "Purchased",
      value:
        dashboardData?.purchases?.reduce((a, b) => a + (b.total ?? 0), 0) ?? 0,
      type: "purchase",
    },
    {
      label: "Transferred Out",
      value:
        dashboardData?.transfersOut?.reduce((a, b) => a + (b.total ?? 0), 0) ??
        0,
      type: "transfer-out",
    },
    {
      label: "Transferred In",
      value:
        dashboardData?.transfersIn?.reduce((a, b) => a + (b.total ?? 0), 0) ??
        0,
      type: "transfer-in",
    },
  ];

  const onCardClick = (type) => {
    const allowedTypes = [
      "assignment",
      "purchase",
      "transfer-out",
      "transfer-in",
    ];
    if (allowedTypes.includes(type)) {
      setPopupType(type);
      setPopupOpen(true);
    }
  };

  return (
    <div className="min-h-screen px-6 py-8 max-w-7xl mx-auto bg-[#1f2d1f] font-[Rajdhani] text-white">
      {user?.role === "personnel" ? (
        <PersonnelDetails user={user} />
      ) : (
        <>
          <h2 className="text-4xl font-extrabold mb-8 tracking-widest uppercase border-b-4 border-green-600 pb-2">
            Dashboard
          </h2>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-10">
            <input
              type="date"
              name="startDate"
              className="border border-green-700 rounded-md p-3 bg-[#213321] text-green-300 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 transition"
              value={filters.startDate}
              onChange={handleChange}
              placeholder="Start Date"
            />

            <input
              type="date"
              name="endDate"
              className="border border-green-700 rounded-md p-3 bg-[#213321] text-green-300 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 transition"
              value={filters.endDate}
              onChange={handleChange}
              placeholder="End Date"
            />

            {user?.role === "base commander" ||
            user?.role === "logistics officer" ? (
              <input
                type="text"
                name="base"
                className="border border-green-700 rounded-md p-3 bg-[#2a3a2a] text-green-500 cursor-not-allowed"
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
                className="border border-green-700 rounded-md p-3 bg-[#213321] text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 transition"
                value={filters.base}
                onChange={handleChange}
              >
                {user?.role === "admin" && <option value="">All Bases</option>}
                {bases.map((base) => (
                  <option
                    key={base._id}
                    value={base._id}
                    className="bg-[#213321] text-green-300"
                  >
                    {base.name}
                  </option>
                ))}
              </select>
            )}

            <select
              name="assetType"
              className="border border-green-700 rounded-md p-3 bg-[#213321] text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 transition"
              value={filters.assetType}
              onChange={handleChange}
            >
              <option value="" className="bg-[#213321] text-green-300">
                All Asset Types
              </option>
              {assetTypes.map((type) => (
                <option
                  key={type._id}
                  value={type._id}
                  className="bg-[#213321] text-green-300"
                >
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Metrics */}
          {loading ? (
            <p className="text-center text-green-400 text-xl font-semibold tracking-widest">
              Loading...
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  onClick={() => onCardClick(stat.type)}
                  className="cursor-pointer hover:shadow-lg hover:border-green-600 hover:ring-2 hover:ring-green-500 rounded-md transition-shadow duration-300 bg-[#2a3a2a] border border-green-700 p-5 flex flex-col items-center justify-center"
                  title={`View details for ${stat.label}`}
                >
                  <p
                    className={`text-lg font-semibold uppercase tracking-wide ${
                      stat.highlight ? "text-green-400" : "text-green-300"
                    }`}
                  >
                    {stat.label}
                  </p>
                  <p
                    className={`text-3xl font-extrabold mt-3 ${
                      stat.highlight ? "text-green-500" : "text-green-300"
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Popup */}
          {popupOpen && (
            <AssetTransactionsPopup
              startDate={filters.startDate}
              endDate={filters.endDate}
              type={popupType}
              assetType={filters.assetType}
              base={filters.base}
              onClose={() => setPopupOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
