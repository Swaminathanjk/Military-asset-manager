import React, { useState, useEffect } from "react";
// import api from "../services/api";

const Transfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [formData, setFormData] = useState({
    fromBase: "",
    toBase: "",
    equipmentType: "",
    quantity: 0,
    date: "",
  });

  useEffect(() => {
    // TODO: Fetch transfers from backend
    setTransfers([]);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Send transfer data to backend API
    alert("Transfer submitted: " + JSON.stringify(formData));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🔁 Transfers</h1>

      <form onSubmit={handleSubmit} className="mb-6 max-w-md space-y-4">
        <div>
          <label className="block font-semibold mb-1">From Base</label>
          <input
            type="text"
            name="fromBase"
            value={formData.fromBase}
            onChange={handleChange}
            placeholder="Enter source base"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">To Base</label>
          <input
            type="text"
            name="toBase"
            value={formData.toBase}
            onChange={handleChange}
            placeholder="Enter destination base"
            className="w-full border px-3 py-2 rounded"
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
            placeholder="Enter equipment type"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            min="1"
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
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Submit Transfer
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-2">Transfer History</h2>
        {transfers.length === 0 ? (
          <p>No transfers recorded yet.</p>
        ) : (
          <ul>
            {transfers.map((transfer) => (
              <li key={transfer._id}>
                {transfer.date} - {transfer.equipmentType} - Qty:{" "}
                {transfer.quantity} - From: {transfer.fromBase} To:{" "}
                {transfer.toBase}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Transfers;
