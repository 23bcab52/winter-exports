import React, { useEffect, useState } from "react";
import { getBankEntries, addBankEntry, deleteBankEntry } from "./api";

const BANK_OPTIONS = ["HDFC", "ICICI", "SBI", "Axis"];
const TRANSACTION_MODES = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
];

function App() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    date: "",
    description: "",
    amount: "",
    bank: BANK_OPTIONS[0],
    from_account: "",
    to_account: "",
    transaction_mode: TRANSACTION_MODES[0].value
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    getBankEntries().then(setEntries).catch(console.error);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.date ||
      !form.description ||
      !form.amount ||
      !form.bank ||
      !form.from_account ||
      !form.to_account ||
      !form.transaction_mode
    ) {
      alert("Please fill all fields.");
      return;
    }
    let lastBalance =
      entries.length > 0 ? Number(entries[entries.length - 1].balance) : 0;
    const newAmount = Number(form.amount);
    const newBalance = lastBalance + newAmount;

    try {
      await addBankEntry({
        ...form,
        amount: newAmount,
        balance: newBalance,
      });
      setForm({
        date: "",
        description: "",
        amount: "",
        bank: BANK_OPTIONS[0],
        from_account: "",
        to_account: "",
        transaction_mode: TRANSACTION_MODES[0].value
      });
      loadEntries();
    } catch (err) {
      alert("Error adding entry.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteBankEntry(id);
        loadEntries();
      } catch (err) {
        alert("Error deleting entry.");
      }
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "2rem auto", fontFamily: "Arial" }}>
      <h1>Bank Dashboard</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem", display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <input
          name="description"
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <input
          name="amount"
          type="number"
          placeholder="Amount (+ for credit, - for debit)"
          value={form.amount}
          onChange={handleChange}
          step="0.01"
          required
        />
        <select
          name="bank"
          value={form.bank}
          onChange={handleChange}
          required
        >
          {BANK_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <input
          name="from_account"
          type="text"
          placeholder="From Account"
          value={form.from_account}
          onChange={handleChange}
          required
        />
        <input
          name="to_account"
          type="text"
          placeholder="To Account"
          value={form.to_account}
          onChange={handleChange}
          required
        />
        <select
          name="transaction_mode"
          value={form.transaction_mode}
          onChange={handleChange}
          required
        >
          {TRANSACTION_MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
        <button type="submit">Add Entry</button>
      </form>
      <table border="1" cellPadding="8" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Bank</th>
            <th>From</th>
            <th>To</th>
            <th>Mode</th>
            <th>Credited</th>
            <th>Debited</th>
            <th>Balance</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ textAlign: "center" }}>
                No entries found.
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.date}</td>
                <td>{entry.description}</td>
                <td>{entry.bank}</td>
                <td>{entry.from_account}</td>
                <td>{entry.to_account}</td>
                <td>
                  {TRANSACTION_MODES.find(m => m.value === entry.transaction_mode)?.label || entry.transaction_mode}
                </td>
                <td style={{ color: "green" }}>
                  {Number(entry.amount) > 0 ? entry.amount : ""}
                </td>
                <td style={{ color: "red" }}>
                  {Number(entry.amount) < 0 ? Math.abs(entry.amount) : ""}
                </td>
                <td>{entry.balance}</td>
                <td>
                  <button
                    style={{ color: "red" }}
                    onClick={() => handleDelete(entry.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;