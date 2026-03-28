document.getElementById('syncBtn').addEventListener('click', syncData);

let activeEmail = "";

async function syncData() {
    const list = document.getElementById('customerList');
    list.innerHTML = '<tr><td colspan="4" class="p-10 text-center animate-pulse">Connecting to Store...</td></tr>';
    
    try {
        const res = await fetch('../backend/get_customers.php');
        const data = await res.json();
        render(data);
    } catch (e) { console.error(e); }
}

function render(customers) {
    const list = document.getElementById('customerList');
    list.innerHTML = "";
    let total = 0;

    customers.forEach(c => {
        const spent = parseFloat(c.total_spent || 0);
        total += spent;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-4 font-bold text-slate-800">${c.first_name} ${c.last_name}</td>
            <td class="p-4 text-slate-500 text-sm">${c.email}</td>
            <td class="p-4 font-mono text-emerald-600 font-bold">$${spent.toFixed(2)}</td>
            <td class="p-4 text-right space-x-2">
                <button onclick="viewOrders(${c.id})" class="bg-slate-800 text-white text-xs px-3 py-1.5 rounded">Orders</button>
                <button onclick="openNote('${c.email}')" class="border text-xs px-3 py-1.5 rounded">+ Note</button>
            </td>
        `;
        list.appendChild(row);
    });

    document.getElementById('totalRev').innerText = `$${total.toFixed(2)}`;
    document.getElementById('totalCust').innerText = customers.length;
    document.getElementById('avgOrder').innerText = `$${(total / customers.length || 0).toFixed(2)}`;
}

// 📦 VIEW ORDERS LOGIC
async function viewOrders(id) {
    const modal = document.getElementById('orderModal');
    const content = document.getElementById('orderContent');
    modal.classList.remove('hidden');
    content.innerHTML = "Loading...";

    const res = await fetch(`../backend/get_orders.php?customer_id=${id}`);
    const orders = await res.json();
    
    content.innerHTML = orders.map(o => `
        <div class="border-b py-3 flex justify-between">
            <span>Order #${o.id} <br><small>${new Date(o.date_created).toLocaleDateString()}</small></span>
            <span class="font-bold">$${o.total}</span>
        </div>
    `).join('') || "No orders found.";
}

// 📝 SAVE NOTE LOGIC (THIS IS THE FIX)
function openNote(email) {
    activeEmail = email;
    document.getElementById('noteModal').classList.remove('hidden');
}

document.getElementById('confirmSaveNote').addEventListener('click', async () => {
    const note = document.getElementById('noteContent').value;
    const btn = document.getElementById('confirmSaveNote');
    
    btn.innerText = "Saving...";

    const res = await fetch('../backend/save_note.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customer_email: activeEmail,
            note_text: note
        })
    });

    const result = await res.json();
    if(result.success) {
        alert("Note Saved to MySQL Database!");
        document.getElementById('noteModal').classList.add('hidden');
        document.getElementById('noteContent').value = "";
    } else {
        alert("Error: " + result.message);
    }
    btn.innerText = "Save to DB";
});