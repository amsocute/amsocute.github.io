import { useState } from "react";

export default function App() {
  const [date, setDate] = useState("");
  ...
}

export default function App() {
  const INITIAL_BRANCHES = 10;
  const [date, setDate] = useState("");

  const [branches, setBranches] = useState(
    Array.from({ length: INITIAL_BRANCHES }, (_, i) => ({
      name: `สาขา ${i + 1}`,
      income: 0,
      percent: 30,
      location: "",
    }))
  );

  const [expenses, setExpenses] = useState({
    daily: 0,
    fuel: 0,
    food: 0,
    other: 0,
  });

  const monthsTH = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];

  // แปลง YYYY-MM-DD -> วัน เดือน พ.ศ.
  const formatThaiDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    return `${day} ${monthsTH[month - 1]} ${year + 543}`;
  };

  const handleBranchChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newBranches = [...branches];
    if (field === "name") newBranches[index].name = value as string;
    else if (field === "income") newBranches[index].income = Number(value) || 0;
    else if (field === "percent") {
      const val = Math.min(Math.max(Number(value) || 30, 30), 50);
      newBranches[index].percent = val;
    } else if (field === "location") newBranches[index].location = value as string;
    setBranches(newBranches);
  };

  const handleExpenseChange = (field: string, value: number) => {
    setExpenses((prev) => ({ ...prev, [field]: value }));
  };

  const addBranch = () => {
    setBranches([
      ...branches,
      { name: `สาขา ${branches.length + 1}`, income: 0, percent: 30, location: "" },
    ]);
  };

  const removeBranch = (index: number) => {
    setBranches(branches.filter((_, i) => i !== index));
  };

  const branchesWithCalc = branches.map((b) => {
    const cost = (b.income * b.percent) / 100;
    const profit = b.income - cost;
    return { ...b, cost, profit };
  });

  const totalIncome = branchesWithCalc.reduce((acc, b) => acc + b.income, 0);
  const totalBranchCost = branchesWithCalc.reduce((acc, b) => acc + b.cost, 0);
  const totalBranchProfit = branchesWithCalc.reduce((acc, b) => acc + b.profit, 0);
  const totalExpenses =
    expenses.daily + expenses.fuel + expenses.food + expenses.other;
  const finalProfit = totalBranchProfit - totalExpenses;
  const avgBranchPercent =
    branchesWithCalc.reduce((acc, b) => acc + b.percent, 0) / branches.length;

  const handleReset = () => {
    setDate("");
    setBranches(
      Array.from({ length: INITIAL_BRANCHES }, (_, i) => ({
        name: `สาขา ${i + 1}`,
        income: 0,
        percent: 30,
        location: "",
      }))
    );
    setExpenses({ daily: 0, fuel: 0, food: 0, other: 0 });
  };

  const exportCSV = () => {
    const header = [
      "วันที่",
      "สาขา",
      "รายได้ (บาท)",
      "% เก็บ",
      "ค่าใช้จ่าย (บาท)",
      "กำไร (บาท)",
      "โลเคชั่น",
    ];
  
    // เพิ่ม row แรกเป็นวันที่เพียง row เดียว
    const dateRow = [formatThaiDate(date), "", "", "", "", "", ""];
  
    const rows = branchesWithCalc.map((b) => [
      "", // เว้นค่าวันที่ เพราะแสดงแค่ row แรก
      b.name,
      b.income,
      b.percent,
      b.cost,
      b.profit,
      b.location,
    ]);
  
    const summary = [
      ["", "รวมรายได้", totalIncome],
      ["", "ค่าใช้จ่ายสาขา", totalBranchCost],
      ["", "กำไรสาขา", totalBranchProfit],
      ["", "ค่าใช้จ่ายเพิ่มเติม", totalExpenses],
      ["", "กำไรสุทธิ", finalProfit],
    ];
  
    const csvContent =
      "\uFEFF" +
      [header, dateRow, ...rows, [], ...summary]
        .map((row) => row.join(","))
        .join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const filename = `รายงาน_${date || "ไม่ระบุวันที่"}.csv`;
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <h1 className="text-3xl font-bold text-[#ff6b2c] mb-6 text-center">
        📊 ระบบรายได้ตู้
      </h1>

      {/* วันที่ */}
      <div className="mb-6 max-w-sm">
        <label className="block mb-2 font-semibold text-gray-700">
          📅 วันที่ (วัน เดือน พ.ศ.)
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border-2 border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:border-[#ff6b2c] text-lg"
        />
        {date && (
          <p className="text-gray-600 mt-1">
            วันที่ที่เลือก: {formatThaiDate(date)}
          </p>
        )}
      </div>

      {/* ปุ่ม */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={addBranch}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-lg shadow"
        >
          ➕ เพิ่มสาขา
        </button>
        <button
          onClick={handleReset}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-lg shadow"
        >
          🔄 รีเซ็ตค่าเริ่มต้น
        </button>
        <button
          onClick={exportCSV}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow"
        >
          📝 ออกรายงาน CSV
        </button>
      </div>

      {/* ตาราง */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full border text-sm bg-white rounded-xl shadow">
          <thead>
            <tr className="border-b bg-[#ff6b2c]/20">
              <th className="py-2 px-2 text-left">🏢 สาขา</th>
              <th className="py-2 px-2 text-left">💵 รายได้ (THB)</th>
              <th className="py-2 px-2 text-left">📊 % เก็บ</th>
              <th className="py-2 px-2 text-left text-red-500">💸 ค่าใช้จ่าย</th>
              <th className="py-2 px-2 text-left text-green-600">📈 กำไร</th>
              <th className="py-2 px-2 text-left">📍 โลเคชั่น</th>
              <th className="py-2 px-2 text-left">🗑️ ลบ</th>
            </tr>
          </thead>
          <tbody>
            {branchesWithCalc.map((b, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-1 px-2">
                  <input
                    type="text"
                    value={b.name}
                    placeholder="🏢 ชื่อสาขา"
                    onChange={(e) => handleBranchChange(i, "name", e.target.value)}
                    className="w-full border rounded p-2 text-sm focus:border-[#ff6b2c] focus:outline-none"
                  />
                </td>
                <td className="py-1 px-2">
                  <input
                    type="number"
                    value={b.income}
                    placeholder="💵 กรอกจำนวน"
                    onChange={(e) =>
                      handleBranchChange(i, "income", parseFloat(e.target.value) || 0)
                    }
                    className="w-full border rounded p-2 text-sm text-right focus:border-[#ff6b2c] focus:outline-none"
                  />
                </td>
                <td className="py-1 px-2">
                  <input
                    type="number"
                    value={b.percent}
                    placeholder="📊 %"
                    onChange={(e) =>
                      handleBranchChange(i, "percent", parseFloat(e.target.value) || 30)
                    }
                    className="w-full border rounded p-2 text-sm text-center focus:border-[#ff6b2c] focus:outline-none"
                    min={30}
                    max={50}
                  />
                </td>
                <td className="py-1 px-2 text-red-500 font-bold text-right">
                  {b.cost.toLocaleString()}
                </td>
                <td className="py-1 px-2 text-green-600 font-bold text-right">
                  {b.profit.toLocaleString()}
                </td>
                <td className="py-1 px-2">
                  <input
                    type="text"
                    value={b.location}
                    placeholder="📍 ตำแหน่ง"
                    onChange={(e) => handleBranchChange(i, "location", e.target.value)}
                    className="w-full border rounded p-2 text-sm focus:border-[#ff6b2c] focus:outline-none"
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <button
                    onClick={() => removeBranch(i)}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-xs"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ค่าใช้จ่ายเพิ่มเติม */}
      <div className="max-w-sm mb-8 bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">
          🛒 ค่าใช้จ่ายเพิ่มเติม
        </h2>
        <div className="space-y-3">
          {[
            { key: "daily", label: "🗓️ ค่าใช้จ่ายรายวัน", placeholder: "เช่น 500" },
            { key: "fuel", label: "⛽ ค่าน้ำมัน", placeholder: "เช่น 1000" },
            { key: "food", label: "🍜 ค่าอาหาร", placeholder: "เช่น 800" },
            { key: "other", label: "📦 อื่น ๆ", placeholder: "เช่น 300" },
          ].map((exp) => (
            <div key={exp.key}>
              <label className="block font-medium text-gray-600">{exp.label}</label>
              <input
                type="number"
                value={expenses[exp.key as keyof typeof expenses]}
                placeholder={exp.placeholder}
                onChange={(e) =>
                  handleExpenseChange(exp.key, parseFloat(e.target.value) || 0)
                }
                className="border rounded p-2 w-full focus:border-[#ff6b2c] focus:outline-none text-right"
              />
            </div>
          ))}
        </div>
      </div>

      {/* สรุป */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#ff6b2c]/10 p-5 rounded-xl shadow space-y-3 text-center">
          <p className="text-xl font-semibold text-gray-700">
            💵 รวมรายได้: {totalIncome.toLocaleString()} บาท
          </p>
          <p className="text-xl font-semibold text-red-500">
            💸 ค่าใช้จ่ายสาขา ({avgBranchPercent.toFixed(0)}%): {totalBranchCost.toLocaleString()} บาท
          </p>
          <p className="text-xl font-semibold text-green-600">
            📈 กำไรสาขา: {totalBranchProfit.toLocaleString()} บาท
          </p>
        </div>
        <div className="bg-[#ff6b2c]/10 p-5 rounded-xl shadow space-y-3 text-center">
          <p className="text-xl font-semibold text-red-500">
            🛒 ค่าใช้จ่ายเพิ่มเติม: {totalExpenses.toLocaleString()} บาท
          </p>
          <p className="text-2xl font-bold text-green-600">
            ✅ กำไรสุทธิ: {finalProfit.toLocaleString()} บาท
          </p>
        </div>
      </div>
    </div>
  );
}
