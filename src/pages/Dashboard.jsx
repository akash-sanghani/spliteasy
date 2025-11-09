import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return navigate("/");

    fetch("https://your-lambda-url/get_groups", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setGroups(data.groups || []))
      .catch(console.error);
  }, [navigate]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Your Groups</h2>
      <ul>
        {groups.map((g) => (
          <li
            key={g.id}
            onClick={() => navigate(`/group/${g.id}`)}
            className="cursor-pointer p-3 border rounded mb-2 hover:bg-gray-100"
          >
            {g.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
