/**
 * KILOWOTT AI-CRM: MASTER LOGIC ENGINE
 * Integrated with: GSAP, FontAwesome, WooCommerce REST API, and MySQL Note Vault.
 */

// 1. GLOBAL STATE
let activeEmail = "";

// 2. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('syncBtn').addEventListener('click', syncData);
    initSearch();
});

// 3. LIVE SEARCH (Filters Name, Email, or AI Status)
function initSearch() {
    const searchInput = document.getElementById('customerSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#customerList tr');

        rows.forEach(row => {
            const content = row.innerText.toLowerCase();
            row.style.display = content.includes(term) ? "" : "none";
        });
    });
}

// 4. DATA SYNCHRONIZATION
async function syncData() {
    const list = document.getElementById('customerList');
    const syncBtn = document.getElementById('syncBtn');

    // UI Loading State
    syncBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Establishing Tunnel...';
    syncBtn.disabled = true;

    list.innerHTML = `
        <tr>
            <td colspan="4" class="p-20 text-center">
                <i class="fa-solid fa-circle-notch fa-spin fa-3x text-indigo-500"></i>
                <p class="mt-4 text-slate-400 font-bold tracking-widest uppercase text-xs">Syncing Cloud Intelligence...</p>
            </td>
        </tr>
    `;

    try {
        const res = await fetch('../backend/get_customers.php');
        const data = await res.json();

        syncBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Sync Live Data';
        syncBtn.disabled = false;

        render(data);
        showToast("Enterprise Data Synced", "success");
    } catch (e) {
        showToast("API Connection Refused", "error");
        list.innerHTML = '<tr><td colspan="4" class="p-10 text-center text-rose-500 font-black italic">API TUNNEL OFFLINE</td></tr>';
    }
}

// 5. THE RENDERING ENGINE (With Emergency LTV Overrides)
function render(customers) {
    const list = document.getElementById('customerList');
    list.innerHTML = "";

    // Filter out Admin
    const valid = customers.filter(c => c.id !== 1 && c.first_name.trim() !== "");

    valid.forEach(c => {
        const row = document.createElement('tr');
        row.className = "row-animate border-b border-slate-50 opacity-0 translate-x-[-10px]";

        row.innerHTML = `
            <td class="p-6">
                <div class="font-black text-slate-800 text-lg">${c.first_name} ${c.last_name}</div>
                <div class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">WOO ID: #${c.id}</div>
            </td>
            <td class="p-6" id="ai-insight-${c.id}">
                <div class="text-slate-300 italic text-xs animate-pulse">AI Analyzing...</div>
            </td>
            <td class="p-6 text-center font-black text-emerald-600 text-xl" id="ltv-val-${c.id}">
                $0.00
            </td>
            <td class="p-6 text-right space-x-2">
                <button onclick="viewOrders(${c.id})" class="bg-slate-900 text-white p-3 rounded-xl shadow-lg"><i class="fa-solid fa-box-open"></i></button>
                <button onclick="openNote('${c.email}')" class="border-2 p-3 rounded-xl"><i class="fa-solid fa-pen-to-square"></i></button>
            </td>
        `;
        list.appendChild(row);
        fetchAIInsight(c.id);
    });

    gsap.to(".row-animate", { duration: 0.5, opacity: 1, x: 0, stagger: 0.05 });
    updateGlobalStats();
}

async function fetchAIInsight(customerId) {
    try {
        const res = await fetch(`../backend/ai_engine.php?id=${customerId}`);
        const ai = await res.json();
        
        // 1. Update the AI Badge cell
        const aiCell = document.getElementById(`ai-insight-${customerId}`);
        const bg = { blue:'bg-blue-50 text-blue-700', purple:'bg-purple-50 text-purple-700', orange:'bg-orange-50 text-orange-700', emerald:'bg-emerald-50 text-emerald-700' };
        
        aiCell.innerHTML = `
            <div class="flex flex-col items-start gap-1">
                <span class="px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest ${bg[ai.color] || bg.blue}">
                    <i class="fa-solid fa-bolt-lightning mr-1"></i> ${ai.insight}
                </span>
                <span class="text-[11px] text-slate-500 font-medium leading-tight ml-1">${ai.action}</span>
            </div>
        `;

        // 2. UPDATE THE LTV COLUMN LIVE (This fixes your $0.00 issue!)
        // Find the 3rd column in this row and update the text
        const row = aiCell.closest('tr');
        const ltvCell = row.querySelectorAll('td')[2]; 
        ltvCell.innerText = `$${parseFloat(ai.real_ltv).toFixed(2)}`;

        // 3. Update the Top Dashboard Cards
        updateGlobalStats();

    } catch (e) {
        console.warn("AI Sync failed for ID: " + customerId);
    }
}

// Add this helper function at the bottom of app.js
function updateGlobalStats() {
    let grandTotal = 0;
    // Sum up all the values currently in the 3rd column of the table
    document.querySelectorAll('#customerList tr').forEach(row => {
        const val = row.querySelectorAll('td')[2].innerText.replace('$', '');
        grandTotal += parseFloat(val || 0);
    });
    
    document.getElementById('totalRev').innerText = `$${grandTotal.toFixed(2)}`;
    const count = document.querySelectorAll('#customerList tr').length;
    document.getElementById('avgOrder').innerText = `$${(grandTotal / (count || 1)).toFixed(2)}`;
}

// Simple function to sum up all LTV cells and update the top card
function updateGlobalStats() {
    let grandTotal = 0;
    document.querySelectorAll('[id^="ltv-val-"]').forEach(cell => {
        grandTotal += parseFloat(cell.innerText.replace('$', ''));
    });
    document.getElementById('totalRev').innerText = `$${grandTotal.toFixed(2)}`;

    const count = document.querySelectorAll('#customerList tr').length;
    document.getElementById('totalCust').innerText = count;
    document.getElementById('avgOrder').innerText = `$${(grandTotal / (count || 1)).toFixed(2)}`;
}

// 7. ORDER MODAL LOGIC
async function viewOrders(id) {
    const modal = document.getElementById('orderModal');
    const content = document.getElementById('orderContent');
    modal.classList.remove('hidden');
    content.innerHTML = '<div class="text-center py-10 animate-spin"><i class="fa-solid fa-circle-notch fa-2x text-slate-200"></i></div>';

    const res = await fetch(`../backend/get_orders.php?customer_id=${id}`);
    const orders = await res.json();

    content.innerHTML = orders.map(o => `
        <div class="bg-slate-50 p-6 rounded-2xl flex justify-between items-center border border-slate-100">
            <div>
                <div class="font-black text-slate-800 text-sm uppercase">ORDER #${o.id}</div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${new Date(o.date_created).toLocaleDateString()}</div>
            </div>
            <div class="text-right">
                <div class="text-xl font-black text-indigo-600">$${o.total}</div>
                <div class="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500">${o.status}</div>
            </div>
        </div>
    `).join('') || '<div class="text-center text-slate-400 italic py-10">No order history available.</div>';
}

// 8. NOTE VAULTING (MySQL Integration)
function openNote(email) {
    activeEmail = email;
    document.getElementById('noteModal').classList.remove('hidden');
    document.getElementById('noteContent').focus();
}

document.getElementById('confirmSaveNote').addEventListener('click', async () => {
    const note = document.getElementById('noteContent').value;
    const btn = document.getElementById('confirmSaveNote');
    if (!note.trim()) return showToast("Note content required", "error");

    btn.innerHTML = '<i class="fa-solid fa-shield-halved fa-spin"></i> Securing...';
    btn.disabled = true;

    const res = await fetch('../backend/save_note.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_email: activeEmail, note_text: note })
    });

    const result = await res.json();
    if (result.success) {
        document.getElementById('noteModal').classList.add('hidden');
        document.getElementById('noteContent').value = "";
        showToast("Intelligence Vaulted Successfully", "success");
    }
    btn.innerHTML = 'Secure Save';
    btn.disabled = false;
});

// 9. TOAST SYSTEM
function showToast(message, type = "success") {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    const bgColor = type === "success" ? "bg-slate-900" : "bg-rose-600";
    const icon = type === "success" ? "fa-circle-check text-emerald-400" : "fa-circle-exclamation text-white";

    toast.className = `${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 opacity-0 translate-y-10`;
    toast.innerHTML = `<i class="fa-solid ${icon} text-lg"></i><div><span class="text-[9px] font-black uppercase tracking-widest opacity-50">${type}</span><br><span class="text-sm font-bold leading-tight">${message}</span></div>`;

    container.appendChild(toast);
    gsap.to(toast, { duration: 0.4, opacity: 1, y: 0, ease: "back.out(1.7)" });
    gsap.to(toast, { duration: 0.4, opacity: 0, x: 40, delay: 3.5, onComplete: () => toast.remove() });
}