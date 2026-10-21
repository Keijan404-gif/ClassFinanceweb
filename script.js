// ======================================================
// KASMATE - JAVASCRIPT
// Fitur: Search, Filter, Sorting, Validasi, Empty State,
// Error Message, Responsive Menu, Loading State,
// dan Konfirmasi Delete.
// ======================================================

const state = {
    data: [
        { id: 1, label: "Pembayaran Kas", status: "paid", amount: 50000 },
        { id: 2, label: "Pembayaran Kas", status: "unpaid", amount: 50000 },
        { id: 3, label: "Pembayaran Kas", status: "paid", amount: 100000 },
        { id: 4, label: "Pengeluaran Kelas", status: "paid", amount: 75000 }
    ],
    deleteId: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const dataTable = $("#dataTable");
const searchInput = $("#searchInput");
const filterSelect = $("#filterSelect");
const sortSelect = $("#sortSelect");
const loadingState = $("#loadingState");
const errorState = $("#errorState");
const emptyState = $("#emptyState");
const tableWrap = $("#tableWrap");

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(value);
}

function updateSummary() {
    const total = state.data.length;
    const paid = state.data.filter(item => item.status === "paid").length;
    const unpaid = state.data.filter(item => item.status === "unpaid").length;

    $("#totalData").textContent = total;
    $("#paidData").textContent = paid;
    $("#unpaidData").textContent = unpaid;
}

function getFilteredData() {
    const keyword = searchInput.value.trim().toLowerCase();
    const filter = filterSelect.value;
    const sort = sortSelect.value;

    let result = state.data.filter(item => {
        const matchSearch = item.label.toLowerCase().includes(keyword);
        const matchFilter = filter === "all" || item.status === filter;
        return matchSearch && matchFilter;
    });

    if (sort === "amountHigh") result.sort((a, b) => b.amount - a.amount);
    if (sort === "amountLow") result.sort((a, b) => a.amount - b.amount);
    if (sort === "status") result.sort((a, b) => a.status.localeCompare(b.status));

    return result;
}

function renderTable() {
    const result = getFilteredData();

    dataTable.innerHTML = "";

    if (result.length === 0) {
        tableWrap.hidden = true;
        emptyState.hidden = false;
        return;
    }

    tableWrap.hidden = false;
    emptyState.hidden = true;

    result.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <strong>${item.label}</strong>
                <small>ID data: ${item.id}</small>
            </td>
            <td>
                <span class="status ${item.status}">
                    ${item.status === "paid" ? "Sudah Bayar" : "Belum Bayar"}
                </span>
            </td>
            <td>${formatRupiah(item.amount)}</td>
            <td>
                <button class="delete-button" data-delete-id="${item.id}" aria-label="Hapus data">Hapus</button>
            </td>
        `;

        dataTable.appendChild(row);
    });
}

function simulateLoading(callback) {
    loadingState.hidden = false;
    tableWrap.hidden = true;
    emptyState.hidden = true;
    errorState.hidden = true;

    setTimeout(() => {
        loadingState.hidden = true;
        callback();
    }, 450);
}

function refreshTable() {
    simulateLoading(renderTable);
    updateSummary();
}

searchInput.addEventListener("input", refreshTable);
filterSelect.addEventListener("change", refreshTable);
sortSelect.addEventListener("change", refreshTable);

// DELETE
dataTable.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-id]");
    if (!button) return;

    state.deleteId = Number(button.dataset.deleteId);
    openModal("deleteModal");
});

$("#confirmDelete").addEventListener("click", () => {
    if (state.deleteId === null) return;

    state.data = state.data.filter(item => item.id !== state.deleteId);
    state.deleteId = null;

    closeModal("deleteModal");
    showToast("Data berhasil dihapus.");
    refreshTable();
});

// ADD DEMO DATA
$("#addDemoData").addEventListener("click", () => {
    const nextId = state.data.length
        ? Math.max(...state.data.map(item => item.id)) + 1
        : 1;

    state.data.push({
        id: nextId,
        label: "Pembayaran Kas",
        status: "unpaid",
        amount: 50000
    });

    showToast("Data demo berhasil ditambahkan.");
    refreshTable();
});

// MODAL
function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    if (!document.querySelector(".modal.show")) {
        document.body.classList.remove("modal-open");
    }
}

$$("[data-open-modal]").forEach(button => {
    button.addEventListener("click", () => {
        openModal(button.dataset.openModal);
    });
});

$$("[data-close-modal]").forEach(button => {
    button.addEventListener("click", () => {
        const modal = button.closest(".modal");
        closeModal(modal.id);
    });
});

$$(".modal").forEach(modal => {
    modal.addEventListener("click", event => {
        if (event.target === modal) closeModal(modal.id);
    });
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        document.querySelectorAll(".modal.show").forEach(modal => closeModal(modal.id));
    }
});

// VALIDATION
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setError(id, message) {
    const element = document.getElementById(id);
    if (element) element.textContent = message;
}

function clearErrors(ids) {
    ids.forEach(id => setError(id, ""));
}

$("#loginForm").addEventListener("submit", event => {
    event.preventDefault();

    const email = $("#loginEmail").value.trim();
    const password = $("#loginPassword").value;

    clearErrors(["loginEmailError", "loginPasswordError"]);
    $("#loginSuccess").hidden = true;

    let valid = true;

    if (!validateEmail(email)) {
        setError("loginEmailError", "Masukkan email yang valid.");
        valid = false;
    }

    if (password.length < 6) {
        setError("loginPasswordError", "Password minimal 6 karakter.");
        valid = false;
    }

    if (!valid) return;

    $("#loginSuccess").hidden = false;
    showToast("Form login valid.");
});

$("#registerForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = $("#registerName").value.trim();
    const email = $("#registerEmail").value.trim();
    const password = $("#registerPassword").value;

    clearErrors([
        "registerNameError",
        "registerEmailError",
        "registerPasswordError"
    ]);

    $("#registerSuccess").hidden = true;

    let valid = true;

    if (name.length < 2) {
        setError("registerNameError", "Nama minimal 2 karakter.");
        valid = false;
    }

    if (!validateEmail(email)) {
        setError("registerEmailError", "Masukkan email yang valid.");
        valid = false;
    }

    if (password.length < 6) {
        setError("registerPasswordError", "Password minimal 6 karakter.");
        valid = false;
    }

    if (!valid) return;

    $("#registerSuccess").hidden = false;
    showToast("Form registrasi valid.");
});

$("#contactForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = $("#contactName").value.trim();
    const email = $("#contactEmail").value.trim();
    const message = $("#contactMessage").value.trim();

    clearErrors([
        "contactNameError",
        "contactEmailError",
        "contactMessageError"
    ]);

    $("#contactSuccess").hidden = true;

    let valid = true;

    if (name.length < 2) {
        setError("contactNameError", "Nama minimal 2 karakter.");
        valid = false;
    }

    if (!validateEmail(email)) {
        setError("contactEmailError", "Email tidak valid.");
        valid = false;
    }

    if (message.length < 10) {
        setError("contactMessageError", "Pesan minimal 10 karakter.");
        valid = false;
    }

    if (!valid) return;

    $("#contactSuccess").hidden = false;
    showToast("Pesan berhasil divalidasi.");
});

// RESPONSIVE NAVIGATION
$("#menuToggle").addEventListener("click", () => {
    $("#navMenu").classList.toggle("open");
});

$$(".nav-menu a").forEach(link => {
    link.addEventListener("click", () => {
        $("#navMenu").classList.remove("open");
    });
});

// TOAST
let toastTimer;

function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// ERROR DEMO SAFETY
window.addEventListener("error", () => {
    errorState.hidden = false;
    loadingState.hidden = true;
    tableWrap.hidden = true;
});

// INITIAL LOAD
updateSummary();
simulateLoading(renderTable);
