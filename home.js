document.addEventListener("DOMContentLoaded", () => {
  const expenseForm = document.getElementById("expenseForm");
  const titleInput = document.getElementById("title");
  const amountInput = document.getElementById("amount");
  const categoryInput = document.getElementById("category");
  const dateInput = document.getElementById("date");

  const searchInput = document.getElementById("search");
  const filterCategory = document.getElementById("filterCategory");
  const fromDateInput = document.getElementById("fromDate");
  const toDateInput = document.getElementById("toDate");
  const resetFilters = document.getElementById("resetFilters");

  const totalEl = document.getElementById("total");
  const countEl = document.getElementById("count");
  const avgEl = document.getElementById("avg");
  const listEl = document.getElementById("list");
  const noDataEl = document.getElementById("noData");
  const breakdownEl = document.getElementById("breakdown");

  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  // Save to localStorage
  function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }

// Render expenses list
function renderExpenses() {
  const filters = {
    search: searchInput.value.toLowerCase(),
    category: filterCategory.value,
    fromDate: fromDateInput.value,
    toDate: toDateInput.value,
  };

  let filtered = expenses.filter(exp => {
    const matchesSearch =
      exp.title.toLowerCase().includes(filters.search) ||
      exp.amount.toString().includes(filters.search);
    const matchesCategory = filters.category ? exp.category === filters.category : true;
    const matchesFromDate = filters.fromDate ? exp.date >= filters.fromDate : true;
    const matchesToDate = filters.toDate ? exp.date <= filters.toDate : true;
    return matchesSearch && matchesCategory && matchesFromDate && matchesToDate;
  });

  // Update summary
  const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
  totalEl.textContent = `₹${total.toFixed(2)}`;
  countEl.textContent = filtered.length;
  avgEl.textContent = filtered.length ? `₹${(total / filtered.length).toFixed(2)}` : "₹0.00";

  // Category breakdown
  if (filtered.length) {
    const breakdown = {};
    filtered.forEach(exp => {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
    });
    breakdownEl.textContent = Object.entries(breakdown)
      .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(2)}`)
      .join(", ");
  } else {
    breakdownEl.textContent = "—";
  }

  // Render expense cards
  listEl.innerHTML = "";
  if (filtered.length) {
    filtered.forEach((exp, index) => {
      const div = document.createElement("div");
      div.className = "expense-item";
      div.innerHTML = `
        <div class="expense-details">
          <strong>${exp.title}</strong>
          <span>₹${exp.amount.toFixed(2)} — ${exp.category}</span>
          <small>${exp.date}</small>
        </div>
        <div class="expense-actions">
          <button data-index="${index}" class="delete-btn">Delete</button>
        </div>
      `;
      listEl.appendChild(div);
    });
    noDataEl.style.display = "none";
  } else {
    noDataEl.style.display = "block";
  }
}


  // Add expense
  expenseForm.addEventListener("submit", e => {
    e.preventDefault();
    const expense = {
      title: titleInput.value,
      amount: parseFloat(amountInput.value),
      category: categoryInput.value,
      date: dateInput.value || new Date().toISOString().split("T")[0]
    };
    expenses.push(expense);
    saveExpenses();
    renderExpenses();
    expenseForm.reset();
  });

  // Delete expense
  listEl.addEventListener("click", e => {
    if (e.target.classList.contains("delete-btn")) {
      const idx = e.target.getAttribute("data-index");
      expenses.splice(idx, 1);
      saveExpenses();
      renderExpenses();
    }
  });

  // Filters
  [searchInput, filterCategory, fromDateInput, toDateInput].forEach(el => {
    el.addEventListener("input", renderExpenses);
  });

  resetFilters.addEventListener("click", () => {
    searchInput.value = "";
    filterCategory.value = "";
    fromDateInput.value = "";
    toDateInput.value = "";
    renderExpenses();
  });

  // Initial render
  renderExpenses();
});
