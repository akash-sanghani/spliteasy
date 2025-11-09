import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Group() {
  const { id } = useParams();
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    fetch(`https://your-lambda-url/get_expenses?group_id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setExpenses(data.expenses || []))
      .catch(console.error);
  }, [id]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Group #{id} Expenses</h2>
      <ul>
        {expenses.slice(0, 5).map((exp) => (
          <li key={exp.id} className="p-3 border rounded mb-2">
            {exp.description} — ${exp.cost}
          </li>
        ))}
      </ul>
    </div>
  );
}
