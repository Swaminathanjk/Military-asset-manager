// src/components/UserProfile.jsx
const UserProfile = ({ user }) => {
  return (
    <div className="text-white p-6 bg-[#2a3a2a] rounded-md shadow-lg border border-green-700">
      <h2 className="text-2xl font-bold text-green-400 mb-4">Personnel Details</h2>
      <p><strong>Name:</strong> {user?.name}</p>
      <p><strong>Service ID:</strong> {user?.serviceId}</p>
      <p><strong>Base:</strong> {user?.baseId?.name || "N/A"}</p>
      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>Role:</strong> {user?.role}</p>
    </div>
  );
};

export default UserProfile;
