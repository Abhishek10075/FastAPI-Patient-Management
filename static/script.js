const BASE_URL = "http://127.0.0.1:8000";

// --- 1. LOAD ALL (GET) ---
function loadPatients() {
    fetch(`${BASE_URL}/view`)
        .then(res => res.json())
        .then(data => displayData(data))
        .catch(err => console.error("Load error:", err));
}

// --- 2. DISPLAY LOGIC ---
function displayData(data) {
    let html = "";
    for (let id in data) {
        const p = data[id];
        html += `
        <div class="patient-card">
            <div><small>ID: ${id}</small></div>
            <h3>${p.name}</h3>
            <p>📍 ${p.city} | 🎂 ${p.age} yrs | 🚻 ${p.gender}</p>
            <div style="background:#f0f7ff; padding:10px; border-radius:8px;">
                <b>BMI:</b> ${p.bmi} <span class="badge">${p.verdict}</span><br>
                <small>H: ${p.height}cm | W: ${p.weight}kg</small>
            </div>
            <div class="card-actions">
                <button class="edit-btn" onclick="prepareUpdate('${id}')">Edit</button>
                <button class="del-btn" onclick="deletePatient('${id}')">Delete</button>
            </div>
        </div>`;
    }
    document.getElementById("patients").innerHTML = html || "<p>No records found.</p>";
}

// --- 3. CREATE NEW (POST) ---
function createPatient() {
    const payload = {
        id: document.getElementById("id").value.trim(),
        name: document.getElementById("name").value.trim(),
        city: document.getElementById("city").value.trim(),
        age: parseInt(document.getElementById("age").value),
        gender: document.getElementById("gender").value,
        height: parseFloat(document.getElementById("height").value),
        weight: parseFloat(document.getElementById("weight").value)
    };

    if (!payload.id || !payload.name || isNaN(payload.age)) {
        return alert("Please fill ID, Name and Age properly!");
    }

    fetch(`${BASE_URL}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (res.ok) {
            alert("✅ Successfully Registered!");
            location.reload(); 
        } else {
            alert("❌ Error: Check if ID already exists or data is invalid.");
        }
    })
    .catch(err => alert("Server connection failed!"));
}

// --- 4. PREPARE & SAVE UPDATE (PUT) ---
function prepareUpdate(id) {
    fetch(`${BASE_URL}/patient/${id}`)
        .then(res => res.json())
        .then(p => {
            document.getElementById("id").value = id;
            document.getElementById("id").disabled = true;
            document.getElementById("name").value = p.name;
            document.getElementById("city").value = p.city;
            document.getElementById("age").value = p.age;
            document.getElementById("gender").value = p.gender;
            document.getElementById("height").value = p.height;
            document.getElementById("weight").value = p.weight;

            document.getElementById("formTitle").innerText = "📝 Update Details";
            document.getElementById("formButtons").innerHTML = `
                <button class="btn-update" onclick="saveUpdate('${id}')">Save Changes</button>
                <button style="background:#666; color:white; margin-top:5px;" onclick="location.reload()">Cancel</button>
            `;
            window.scrollTo(0,0);
        });
}

function saveUpdate(id) {
    const payload = {
        id: id,
        name: document.getElementById("name").value,
        city: document.getElementById("city").value,
        age: parseInt(document.getElementById("age").value),
        gender: document.getElementById("gender").value,
        height: parseFloat(document.getElementById("height").value),
        weight: parseFloat(document.getElementById("weight").value)
    };

    fetch(`${BASE_URL}/edit/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    }).then(res => {
        if(res.ok) { alert("Updated!"); location.reload(); }
    });
}

// --- 5. SEARCH & DELETE ---
function searchPatient() {
    const id = document.getElementById("searchId").value.trim();
    if(!id) return alert("Enter ID");
    fetch(`${BASE_URL}/patient/${id}`)
        .then(res => {
            if(!res.ok) throw new Error("Not found");
            return res.json();
        })
        .then(p => {
            const wrap = {}; wrap[id] = p;
            displayData(wrap);
        })
        .catch(err => alert("Patient ID not found!"));
}

function deletePatient(id) {
    if(confirm("Are you sure?")) {
        fetch(`${BASE_URL}/delete/${id}`, { method: "DELETE" })
            .then(() => loadPatients());
    }
}

// Initial Load
loadPatients();