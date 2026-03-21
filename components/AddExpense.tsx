"use client";

export default function AddExpense() {
  return (
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
      <input
        placeholder="Expense name"
        className="border p-2 mr-2 rounded"
      />
      <input
        type="number"
        placeholder="Amount"
        className="border p-2 mr-2 rounded"
      />
      <button className="bg-indigo-600 text-white px-4 py-2 rounded">
        Add
      </button>
    </div>
  );
}
