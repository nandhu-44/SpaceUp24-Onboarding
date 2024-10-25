const UserField = ({ label, value }) => (
  <div className="mb-4 flex flex-col">
    <label className="text-sm font-bold uppercase tracking-wide text-gray-800">
      {label}
    </label>
    <span className="mt-1 text-base font-medium text-blue-800">
      {value || "N/A"}
    </span>
  </div>
);

export default UserField;
