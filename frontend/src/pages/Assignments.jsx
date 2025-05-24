import React, { useState, useEffect } from "react";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState({
    personnelName: "",
    equipmentType: "",
    quantity: 0,
    date: "",
    base: "",
    expended: false,
  });

  useEffect(() => {
    // TODO: Fetch assignments from backend
    setAssignments([]);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Send assignment data to backend API
    alert("Assignment submitted: " + JSON.stringify(formData));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎯 Assignments & Expenditures</h1>

      <form onSubmit={handleSubmit} className="mb-6 max-w-md space-y-4">
        <div>
          <label className="block font-semibold mb-1">Personnel Name</label>
          <input
            type="text"
            name="personnelName"
            value={formData.personnelName}
            onChange={handleChange}
            placeholder="Enter personnel name"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Base</label>
          <input
            type="text"
            name="base"
            value={formData.base}
            onChange={handleChange}
            placeholder="Enter base"
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
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="expended"
            checked={formData.expended}
            onChange={handleChange}
            id="expended"
          />
          <label htmlFor="expended" className="font-semibold">
            Mark as Expended
          </label>
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
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Submit Assignment
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-2">Assignment History</h2>
        {assignments.length === 0 ? (
          <p>No assignments recorded yet.</p>
        ) : (
          <ul>
            {assignments.map((assignment) => (
              <li key={assignment._id}>
                {assignment.date} - {assignment.equipmentType} - Qty:{" "}
                {assignment.quantity} - Personnel: {assignment.personnelName} -
                Base: {assignment.base} - Expended:{" "}
                {assignment.expended ? "Yes" : "No"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Assignments;
