/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 */

const STORAGE_KEY = 'expenseTrackerTransactions';

let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editingTransactionId = null;
let searchKeyword = '';

const incomeList = document.getElementById('incomeList');
const expenseList = document.getElementById('expenseList');
const transactionForm = document.getElementById('transactionForm');
const titleInput = document.getElementById('transactionFormTitleInput');
const amountInput = document.getElementById('transactionFormAmountInput');
const dateInput = document.getElementById('transactionFormDateInput');
const typeSelect = document.getElementById('transactionFormTypeSelect');
const submitButton = document.querySelector('[data-testid="transactionFormSubmitButton"]');
const searchInput = document.getElementById('searchTransactionFormTitleInput');
const searchForm = document.getElementById('searchTransactionForm');
const greeting = document.querySelector('.tracker-header__greeting');

const balanceAmount = document.querySelector('.tracker-summary__balance-amount');
const incomeAmount = document.querySelector('.tracker-summary__stat-amount--income');
const expenseAmount = document.querySelector('.tracker-summary__stat-amount--expense');

if (greeting) {
  greeting.innerHTML = 'Halo, <strong>Najla Haura Mumtazah (najla_haura_mumtazah)</strong>';
}

function generateId() {
  return +new Date();
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function notifyTransactionUpdated() {
  document.dispatchEvent(new Event('transaction:updated'));
}

function formatCurrency(amount) {
  return `Rp ${Number(amount).toLocaleString('id-ID')}`;
}

function createTransactionCard(transaction) {
  const card = document.createElement('div');
  card.setAttribute('data-testid', 'transactionItem');

  const title = document.createElement('h3');
  title.setAttribute('data-testid', 'transactionItemTitle');
  title.textContent = transaction.title;

  const amount = document.createElement('p');
  amount.setAttribute('data-testid', 'transactionItemAmount');
  amount.textContent = `Nominal: ${formatCurrency(transaction.amount)}`;

  const date = document.createElement('p');
  date.setAttribute('data-testid', 'transactionItemDate');
  date.textContent = `Tanggal: ${transaction.date}`;

  const type = document.createElement('p');
  type.setAttribute('data-testid', 'transactionItemType');
  type.textContent = `Tipe: ${transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`;

  const actions = document.createElement('div');

  const editTypeButton = document.createElement('button');
  editTypeButton.type = 'button';
  editTypeButton.setAttribute('data-testid', 'transactionItemEditTypeButton');
  editTypeButton.textContent = 'Ubah Tipe';
  editTypeButton.addEventListener('click', () => {
    transaction.type = transaction.type === 'income' ? 'expense' : 'income';
    saveTransactions();
    notifyTransactionUpdated();
  });

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.setAttribute('data-testid', 'transactionItemEditButton');
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => {
    editingTransactionId = transaction.id;
    titleInput.value = transaction.title;
    amountInput.value = transaction.amount;
    dateInput.value = transaction.date;
    typeSelect.value = transaction.type;
    submitButton.textContent = 'Simpan Perubahan';
    titleInput.focus();
  });

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.setAttribute('data-testid', 'transactionItemDeleteButton');
  deleteButton.textContent = 'Hapus';
  deleteButton.addEventListener('click', () => {
    transactions = transactions.filter((item) => item.id !== transaction.id);
    if (editingTransactionId === transaction.id) {
      resetForm();
    }
    saveTransactions();
    notifyTransactionUpdated();
  });

  actions.append(editTypeButton, editButton, deleteButton);
  card.append(title, amount, date, type, actions);

  return card;
}

function renderTransactions() {
  incomeList.replaceChildren();
  expenseList.replaceChildren();

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.title.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  filteredTransactions.forEach((transaction) => {
    const card = createTransactionCard(transaction);

    if (transaction.type === 'income') {
      incomeList.appendChild(card);
    } else {
      expenseList.appendChild(card);
    }
  });
}

function updateDashboard() {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const balance = totalIncome - totalExpense;

  incomeAmount.textContent = formatCurrency(totalIncome);
  expenseAmount.textContent = formatCurrency(totalExpense);
  balanceAmount.textContent = formatCurrency(balance);
}

function resetForm() {
  transactionForm.reset();
  editingTransactionId = null;
  submitButton.textContent = 'Simpan';
}

transactionForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;
  const type = typeSelect.value;

  if (!title) {
    alert('Judul transaksi tidak boleh kosong.');
    titleInput.focus();
    return;
  }

  if (amount < 1 || !Number.isFinite(amount)) {
    alert('Nominal transaksi harus lebih dari atau sama dengan Rp1.');
    amountInput.focus();
    return;
  }

  if (editingTransactionId !== null) {
    const transaction = transactions.find((item) => item.id === editingTransactionId);

    if (transaction) {
      transaction.title = title;
      transaction.amount = amount;
      transaction.date = date;
      transaction.type = type;
    }
  } else {
    transactions.push({
      id: generateId(),
      title,
      amount,
      date,
      type,
    });
  }

  saveTransactions();
  resetForm();
  notifyTransactionUpdated();
});

searchInput.addEventListener('input', (event) => {
  searchKeyword = event.target.value.trim();
  renderTransactions();
});

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  searchKeyword = searchInput.value.trim();
  renderTransactions();
});

document.addEventListener('transaction:updated', () => {
  renderTransactions();
  updateDashboard();
});

renderTransactions();
updateDashboard();
