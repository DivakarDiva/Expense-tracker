    import React, { useEffect, useMemo, useState } from "react";
    import { createRoot } from "react-dom/client";
    import "./index.css";

    const categories = [
    "Food",
    "Travel",
    "Shopping",
    "Education",
    "Entertainment",
    "Bills",
    "Health",
    "Other",
    ];

    const paymentMethods = [
    "Cash",
    "UPI",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    ];

    function App() {
    const [expenses, setExpenses] = useState(() => {
        const saved = localStorage.getItem("expenses");
        return saved ? JSON.parse(saved) : [];
    });

    const [form, setForm] = useState({
        title: "",
        amount: "",
        category: "Food",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "UPI",
        description: "",
    });

    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [paymentFilter, setPaymentFilter] = useState("All");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        localStorage.setItem("expenses", JSON.stringify(expenses));
    }, [expenses]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm({
        ...form,
        [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
        alert("Please enter an expense title.");
        return;
        }

        if (!form.amount || Number(form.amount) <= 0) {
        alert("Please enter a valid amount.");
        return;
        }

        if (!form.date) {
        alert("Please select a date.");
        return;
        }

        if (editingId) {
        setExpenses(
            expenses.map((expense) =>
            expense.id === editingId
                ? {
                    ...expense,
                    ...form,
                    amount: Number(form.amount),
                }
                : expense
            )
        );

        setEditingId(null);
        } else {
        const newExpense = {
            id: Date.now(),
            ...form,
            amount: Number(form.amount),
        };

        setExpenses([newExpense, ...expenses]);
        }

        resetForm();
    };

    const resetForm = () => {
        setForm({
        title: "",
        amount: "",
        category: "Food",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "UPI",
        description: "",
        });
    };

    const editExpense = (expense) => {
        setForm({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        paymentMethod: expense.paymentMethod,
        description: expense.description,
        });

        setEditingId(expense.id);

        window.scrollTo({
        top: 0,
        behavior: "smooth",
        });
    };

    const deleteExpense = (id) => {
        const confirmed = window.confirm(
        "Are you sure you want to delete this expense?"
        );

        if (confirmed) {
        setExpenses(expenses.filter((expense) => expense.id !== id));

        if (editingId === id) {
            setEditingId(null);
            resetForm();
        }
        }
    };

    const filteredExpenses = useMemo(() => {
        let result = expenses.filter((expense) => {
        const matchesSearch = expense.title
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesCategory =
            categoryFilter === "All" ||
            expense.category === categoryFilter;

        const matchesPayment =
            paymentFilter === "All" ||
            expense.paymentMethod === paymentFilter;

        return matchesSearch && matchesCategory && matchesPayment;
        });

        result.sort((a, b) => {
        if (sortBy === "newest") {
            return new Date(b.date) - new Date(a.date);
        }

        if (sortBy === "oldest") {
            return new Date(a.date) - new Date(b.date);
        }

        if (sortBy === "highest") {
            return b.amount - a.amount;
        }

        if (sortBy === "lowest") {
            return a.amount - b.amount;
        }

        return 0;
        });

        return result;
    }, [
        expenses,
        search,
        categoryFilter,
        paymentFilter,
        sortBy,
    ]);

    const totalExpenses = expenses.reduce(
        (total, expense) => total + Number(expense.amount),
        0
    );

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyExpenses = expenses
        .filter((expense) => {
        const date = new Date(expense.date);

        return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
        );
        })
        .reduce(
        (total, expense) => total + Number(expense.amount),
        0
        );

    const highestExpense =
        expenses.length > 0
        ? Math.max(...expenses.map((expense) => Number(expense.amount)))
        : 0;

    const formatCurrency = (amount) => {
        return `₹${Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        })}`;
    };

    return (
        <div className="app">
        <header className="header">
            <div>
            <p className="eyebrow">PERSONAL FINANCE</p>

            <h1>Expense Tracker</h1>

            <p className="subtitle">
                Manage and monitor your expenses in one place.
            </p>
            </div>
        </header>

        <main className="container">
            {/* DASHBOARD */}

            <section className="dashboard">
            <div className="stat-card">
                <div className="stat-icon">₹</div>

                <div>
                <p>Total Expenses</p>
                <h2>{formatCurrency(totalExpenses)}</h2>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon">#</div>

                <div>
                <p>Total Records</p>
                <h2>{expenses.length}</h2>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon">M</div>

                <div>
                <p>This Month</p>
                <h2>{formatCurrency(monthlyExpenses)}</h2>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon">↑</div>

                <div>
                <p>Highest Expense</p>
                <h2>{formatCurrency(highestExpense)}</h2>
                </div>
            </div>
            </section>

            {/* FORM */}

            <section className="card">
            <div className="section-heading">
                <div>
                <p className="eyebrow">
                    {editingId ? "UPDATE RECORD" : "NEW RECORD"}
                </p>

                <h2>
                    {editingId ? "Edit Expense" : "Add Expense"}
                </h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="expense-form">
                <div className="form-group">
                <label>Expense Title</label>

                <input
                    type="text"
                    name="title"
                    placeholder="e.g. Lunch"
                    value={form.title}
                    onChange={handleChange}
                />
                </div>

                <div className="form-group">
                <label>Amount</label>

                <input
                    type="number"
                    name="amount"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={handleChange}
                />
                </div>

                <div className="form-group">
                <label>Category</label>

                <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                >
                    {categories.map((category) => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                    ))}
                </select>
                </div>

                <div className="form-group">
                <label>Date</label>

                <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                />
                </div>

                <div className="form-group">
                <label>Payment Method</label>

                <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                >
                    {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                        {method}
                    </option>
                    ))}
                </select>
                </div>

                <div className="form-group description-group">
                <label>Description</label>

                <input
                    type="text"
                    name="description"
                    placeholder="Optional description"
                    value={form.description}
                    onChange={handleChange}
                />
                </div>

                <div className="form-buttons">
                <button className="primary-btn" type="submit">
                    {editingId ? "Update Expense" : "Add Expense"}
                </button>

                {editingId && (
                    <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                        setEditingId(null);
                        resetForm();
                    }}
                    >
                    Cancel
                    </button>
                )}
                </div>
            </form>
            </section>

            {/* EXPENSE HISTORY */}

            <section className="card">
            <div className="history-header">
                <div>
                <p className="eyebrow">TRANSACTIONS</p>

                <h2>Expense History</h2>
                </div>

                <span className="record-count">
                {filteredExpenses.length} records
                </span>
            </div>

            {/* FILTERS */}

            <div className="filters">
                <input
                type="text"
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                />

                <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                >
                <option value="All">All Categories</option>

                {categories.map((category) => (
                    <option key={category} value={category}>
                    {category}
                    </option>
                ))}
                </select>

                <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                >
                <option value="All">All Payments</option>

                {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                    {method}
                    </option>
                ))}
                </select>

                <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
                </select>
            </div>

            {/* LIST */}

            {filteredExpenses.length === 0 ? (
                <div className="empty-state">
                <div className="empty-icon">₹</div>

                <h3>No expenses found</h3>

                <p>
                    Add your first expense to start tracking your spending.
                </p>
                </div>
            ) : (
                <div className="expense-list">
                {filteredExpenses.map((expense) => (
                    <div
                    className="expense-item"
                    key={expense.id}
                    >
                    <div className="expense-main">
                        <div className="expense-icon">
                        {expense.category.charAt(0)}
                        </div>

                        <div className="expense-info">
                        <h3>{expense.title}</h3>

                        <div className="expense-meta">
                            <span>{expense.category}</span>
                            <span>•</span>
                            <span>{expense.paymentMethod}</span>
                            <span>•</span>

                            <span>
                            {new Date(
                                expense.date
                            ).toLocaleDateString("en-IN")}
                            </span>
                        </div>

                        {expense.description && (
                            <p className="description">
                            {expense.description}
                            </p>
                        )}
                        </div>
                    </div>

                    <div className="expense-right">
                        <strong>
                        {formatCurrency(expense.amount)}
                        </strong>

                        <div className="actions">
                        <button
                            className="edit-btn"
                            onClick={() => editExpense(expense)}
                        >
                            Edit
                        </button>

                        <button
                            className="delete-btn"
                            onClick={() => deleteExpense(expense.id)}
                        >
                            Delete
                        </button>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </section>
        </main>

        <footer>
            Expense Tracker • React CRUD Project
        </footer>
        </div>
    );
    }

    createRoot(document.getElementById("root")).render(
    <App />
    );
