const Card = ({ label, value, highlight }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${highlight ? 'border-blue-500' : 'border-gray-200'}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
  );
};

export default Card;
