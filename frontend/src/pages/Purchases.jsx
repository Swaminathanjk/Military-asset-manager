import React, { useState, useEffect } from "react";
// import api from "../services/api";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [formData, setFormData] = useState({
    base: "",
    equipmentType: "",
    quantity: 0,
    date: "",
  });

  useEffect(() => {
    // TODO: Fetch purchases from backend
    // For now, just placeholder empty array
    setPurchases([]);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Send purchase data to backend API
    alert("Purchase submitted: " + JSON.stringify(formData));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📦 Purchases</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4 max-w-md">
        <div>
          <label className="block font-semibold mb-1">Base</label>
          <input
            type="text"
            name="base"
            value={formData.base}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter base name"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Equipment Type</label>
          <input
            type="text"
            name="equipmentType"
            value={formData.equipmentType}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter equipment type"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Quantity</label>
          <input
            type="number"
            name="quantity"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Purchase
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-2">Purchase History</h2>
        {purchases.length === 0 ? (
          <p>No purchases recorded yet.</p>
        ) : (
          <ul>
            {purchases.map((purchase) => (
              <li key={purchase._id}>
                {purchase.date} - {purchase.equipmentType} - Qty:{" "}
                {purchase.quantity} - Base: {purchase.base}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Purchases;
