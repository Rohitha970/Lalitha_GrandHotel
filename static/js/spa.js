// ===============================
// SPA STATE
// ===============================
window.APP = {
    currentRoomType: null,
    currentRoomIndex: null,
    currentRoom: null,
    currentFoodCuisine: null,
    currentMeal: null,
    currentFood: [],
    currentStaff: [],
    bookings: []
};

// ===============================
// HELPER: LOAD SECTION
// ===============================
function renderSection(section) {
    if (!window.SERVE) return;

    const area = document.getElementById("contentArea");
    if (!area) return;

    switch (section) {
        case "rooms": renderRoomTypes(); break;
        case "food": renderFoodCuisine(); break;
        case "staff": renderStaff(); break;
        case "bookings": renderBookings(); break;
        case "receipt": renderReceipt(); break;
        case "about": renderAbout(); break;
        default:
            area.innerHTML = "<h3 class='text-center text-muted'>Invalid section</h3>";
    }

    document.querySelectorAll("#sidebarNav .nav-link").forEach(a => {
        a.classList.remove("active");
        if (a.dataset.section === section) a.classList.add("active");
    });
}

// ===============================
// ROOMS
// ===============================
// ===============================
// ROOMS
// ===============================
// ===============================
// ROOMS
// ===============================
function renderRoomTypes() {
    const area = document.getElementById("contentArea");
    const types = Object.keys(window.SERVE.rooms);

    let html = `<h2 class="text-gold mb-3 text-center">Select Room Type</h2>
                <div class="d-flex flex-wrap gap-3 justify-content-center">`;

    types.forEach(type => {
        const firstRoom = window.SERVE.rooms[type][0];
        html += `
        <div class="card room-card shadow-lg p-3 bg-dark text-white" style="width:200px; text-align:center;">
            <img src="/static/images/rooms/${type.toLowerCase()}.jpg" class="card-img-top rounded" style="height:120px; object-fit:cover;">
            <div class="card-body">
                <h5 class="card-title">${type} Room</h5>
                <p class="text-muted mb-1">Starting Price: ₹${firstRoom.price}</p>
                <button class="btn btn-outline-gold w-100" onclick="renderRoomNumbers('${type}')">View Rooms</button>
            </div>
        </div>`;
    });

    html += "</div>";
    area.innerHTML = html;
}

// Step 2: show all room numbers for selected type
function renderRoomNumbers(type) {
    const area = document.getElementById("contentArea");
    const rooms = window.SERVE.rooms[type];

    let html = `<h2 class="text-gold mb-3 text-center">${type} Rooms</h2>
                <div class="d-flex flex-wrap gap-3 justify-content-center">`;

    rooms.forEach((room, index) => {
        html += `<div class="card shadow-sm bg-dark text-white p-3" style="width:150px; text-align:center;">
            <h6>${type} #${room.number}</h6>
            <p class="text-muted mb-1"><b>Price:</b> ₹${room.price}</p>
            <button class="btn btn-outline-gold w-100" onclick="openRoomModal('${type}', ${index})">View Details</button>
        </div>`;
        if ((index + 1) % 5 === 0) html += `<div class="w-100"></div>`; // 5 per row
    });

    html += `</div>
            <div class="text-center mt-3">
                <button class="btn btn-secondary" onclick="renderRoomTypes()">Back to Room Types</button>
            </div>`;
    area.innerHTML = html;
}

// Step 3: show modal with room details
function openRoomModal(type, index) {
    const room = window.SERVE.rooms[type][index];
    const modalHtml = `
    <div class="modal fade show" id="roomModal" style="display:block; background: rgba(0,0,0,0.7);" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white">
          <div class="modal-header">
            <h5 class="modal-title">${type} Room #${room.number}</h5>
            <button type="button" class="btn-close btn-close-white" onclick="closeModal('roomModal')"></button>
          </div>
          <div class="modal-body text-center">
            <img src="/static/images/rooms/${type.toLowerCase()}.jpg" class="rounded mb-3" style="width:100%; max-height:250px; object-fit:cover;">
            <p><b>Price:</b> ₹${room.price}</p>
            <p><b>Facilities:</b> ${room.facilities.join(", ")}</p>
            <p><b>Availability:</b> ${room.available ? "Yes" : "No"}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-success" onclick="confirmRoom('${type}', ${index})">Confirm</button>
            <button class="btn btn-secondary" onclick="closeModal('roomModal')">Close</button>
          </div>
        </div>
      </div>
    </div>`;

    document.getElementById("contentArea").insertAdjacentHTML('beforeend', modalHtml);
}

// Step 4: confirm room and move to food
function confirmRoom(type, index) {
    const rooms = window.SERVE.rooms[type];
    window.APP.currentRoomType = type;
    window.APP.currentRoomIndex = index;
    window.APP.currentRoom = rooms[index];

    closeModal('roomModal');
    renderSection("food");
}

// Close modal helper
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.remove();
}



// ===============================
// FOOD SECTION
// ===============================
function renderFoodCuisine() {
    const area = document.getElementById("contentArea");
    const cuisines = ["North","South"];
    let html = `<h2 class="text-gold mb-3 text-center">Select Cuisine</h2>
    <div class="d-flex gap-3 justify-content-center flex-wrap mb-3">`;

    cuisines.forEach(c => {
        html += `<div class="card shadow-sm p-3 bg-dark text-white" style="width:180px; text-align:center;">
            <h5>${c} Indian</h5>
            <p class="mt-1 text-muted small">Delicious ${c} flavors for you</p>
            <button class="btn btn-outline-gold mt-2 w-100" onclick="selectCuisine('${c}')">Select</button>
        </div>`;
    });

    html += `</div>
             <div id="mealContainer" class="text-center mb-3"></div>
             <div id="foodItemsContainer" class="d-flex flex-wrap gap-3 justify-content-center"></div>
             <div class="text-center mt-3">
               <button class="btn btn-success w-25" onclick="confirmFood()">Confirm Food</button>
             </div>
             <ul id="foodList" class="text-center mt-3"></ul>`;

    area.innerHTML = html;
}

function selectCuisine(cuisine) {
    window.APP.currentFoodCuisine = cuisine;
    const meals = ["Breakfast","Lunch","Dinner","Snacks"];
    const container = document.getElementById("mealContainer");
    let html = `<h3 class="text-gold mb-3 text-center">${cuisine} Cuisine - Select Meal</h3>
                <p class="text-center text-white mb-3">Choose from a variety of dishes to enjoy your meal.</p>
                <div class="d-flex gap-3 justify-content-center flex-wrap mb-3">`;
    meals.forEach(m => {
        html += `<button class="btn btn-outline-gold" style="width:120px;" onclick="renderFoodItems('${m}')">${m}</button>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function renderFoodItems(meal) {
    window.APP.currentMeal = meal;
    const container = document.getElementById("foodItemsContainer");
    const items = window.SERVE.food[window.APP.currentFoodCuisine][meal];
    let html = `<h4 class="text-gold mb-3 text-center">${meal} Items</h4><div class="d-flex flex-wrap gap-3 justify-content-center">`;
    items.forEach(item => {
        html += `<div class="card p-2 shadow-sm bg-dark text-white" style="width:150px; text-align:center;">
            <img src="/static/images/food/${window.APP.currentFoodCuisine}/${item.image}" class="card-img-top mb-1" style="height:100px; object-fit:cover;">
            <h6>${item.name}</h6>
            <p class="text-muted mb-1">₹${item.price}</p>
            <button class="btn btn-outline-gold btn-sm w-100" onclick="addFood('${item.name}',${item.price})">Add</button>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function addFood(name,price){
    window.APP.currentFood.push({name,price});
    updateFoodList();
}

function updateFoodList(){
    const ul = document.getElementById("foodList");
    if(!ul) return;
    ul.innerHTML = window.APP.currentFood.map(f=>`<li>${f.name} - ₹${f.price}</li>`).join("");
}

function confirmFood(){
    renderSection("staff");
}

// ===============================
// STAFF SECTION
// ===============================
function renderStaff() {
    const staffList = window.SERVE.staff || [];
    const area = document.getElementById("contentArea");

    if(staffList.length === 0){
        area.innerHTML = "<h3 class='text-gold text-center'>No staff available</h3>";
        return;
    }

    let html = `<h2 class='text-gold mb-4 text-center'>Assign Staff</h2><div class="d-flex flex-wrap gap-3 justify-content-center">`;
    staffList.forEach((s, i) => {
        html += `<div class="card bg-dark text-gold shadow-lg p-3" style="width:180px; text-align:center;">
            <img src="/static/images/staff/${s.image}" class="card-img-top rounded mb-2" style="height:100px; object-fit:cover;">
            <h5 class="mb-1">${s.name}</h5>
            <p class="mb-1"><b>Role:</b> ${s.role}</p>
            <p class="mb-1"><b>Experience:</b> ${s.experience} yrs</p>
            <p class="mb-1"><b>Charge:</b> ₹${s.charge}</p>
            <button class="btn btn-outline-gold w-100 mt-2" onclick="viewStaffModal('${s.name}')">Assign</button>
        </div>`;
        if((i+1)%5===0) html += `<div class="w-100"></div>`;
    });
    html += `</div>`;
    area.innerHTML = html;
}


// ===============================
// BOOKINGS
function viewStaffModal(name){
    const staffObj = window.SERVE.staff.find(s=>s.name===name);
    const modalHtml = `<div class="modal fade show" id="staffModal" style="display:block; background: rgba(0,0,0,0.7);" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white">
          <div class="modal-header">
            <h5 class="modal-title">Assign ${name}</h5>
            <button type="button" class="btn-close btn-close-white" onclick="closeModal('staffModal')"></button>
          </div>
          <div class="modal-body text-center">
            <img src="/static/images/staff/${staffObj.image}" class="rounded mb-2" style="height:150px; object-fit:cover;">
            <p><b>Role:</b> ${staffObj.role}</p>
            <p><b>Experience:</b> ${staffObj.experience} yrs</p>
            <p><b>Charge:</b> ₹${staffObj.charge}</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-success w-50" onclick="assignStaff('${name}')">Assign & Continue</button>
          </div>
        </div>
      </div>
    </div>`;
    document.getElementById("contentArea").insertAdjacentHTML('beforeend', modalHtml);
}

function assignStaff(name){
    if(!window.APP.currentStaff.includes(name)) window.APP.currentStaff.push(name);
    closeModal('staffModal');

    // Automatically save booking after assigning staff
    saveBooking();

    // Navigate to bookings page immediately
    renderSection("bookings");
}
// ===============================
// SAVE BOOKING
// ===============================
function saveBooking() {
    if (!window.APP.currentRoom) {
        alert("Please select a room first!");
        return;
    }

    const totalStaffCharge = window.APP.currentStaff.reduce((t, s) => {
        const obj = window.SERVE.staff.find(st => st.name === s);
        return t + (obj ? obj.charge : 0);
    }, 0);

    const totalFoodPrice = window.APP.currentFood.reduce((t, f) => t + f.price, 0);

    const booking = {
        room: window.APP.currentRoom,
        food: window.APP.currentFood,
        staff: window.APP.currentStaff,
        total: window.APP.currentRoom.price + totalFoodPrice + totalStaffCharge
    };

    window.APP.bookings.push(booking);

    // Reset current selections
    window.APP.currentFood = [];
    window.APP.currentStaff = [];

    renderBookings();
}

// ===============================
// BOOKINGS PAGE
// ===============================
function renderBookings() {
    const area = document.getElementById("contentArea");

    if (!window.APP.bookings.length) {
        area.innerHTML = "<h3 class='text-center text-muted'>No bookings yet</h3>";
        return;
    }

    let html = `<h2 class='text-gold mb-3 text-center'>All Bookings</h2>`;

    window.APP.bookings.forEach((b, i) => {
        let foodList = b.food.map(f => `${f.name} - ₹${f.price}`).join(", ");
        let staffList = b.staff.map(s => {
            const obj = window.SERVE.staff.find(st => st.name === s);
            return `${s} (${obj.role}) - ₹${obj.charge}`;
        }).join(", ");

        html += `
        <div class="card p-3 mb-3 shadow-sm bg-dark text-white">
            <h5>Booking #${i + 1}</h5>
            <p><b>Room:</b> ${b.room.type} (${b.room.number}) - ₹${b.room.price}</p>
            <p><b>Food Items:</b> ${foodList}</p>
            <p><b>Staff Assigned:</b> ${staffList}</p>
            <h5 class="text-gold">Total: ₹${b.total}</h5>
        </div>`;
    });

    area.innerHTML = html;
}

// ===============================
// RECEIPT
function renderReceipt() {
    const area = document.getElementById("contentArea");
    const b = window.APP.bookings.at(-1);

    if (!b) {
        area.innerHTML = "<h3 class='text-center text-muted'>No receipt available</h3>";
        return;
    }

    let foodList = b.food.map(f => `<span class="badge bg-secondary me-2 mb-1">${f.name} ₹${f.price}</span>`).join("");
    let staffList = b.staff.map(s => {
        const obj = window.SERVE.staff.find(st => st.name === s);
        return `<span class="badge bg-info me-2 mb-1">${s} (${obj.role}) ₹${obj.charge}</span>`;
    }).join("");

    area.innerHTML = `
    <div class="card shadow-lg p-4 bg-dark text-white mx-auto" style="max-width:600px;">
        <div class="text-center mb-3">
            <img src="/static/images/logo.png" style="height:60px; margin-bottom:10px;">
            <h3>Lalitha Grand Hotel</h3>
            <small>Luxury · Comfort · Care</small>
        </div>
        <hr class="border-gold">
        <p><b>Room:</b> ${b.room.type} (${b.room.number}) - ₹${b.room.price}</p>
        <p><b>Food Items:</b></p><div class="d-flex flex-wrap mb-2">${foodList}</div>
        <p><b>Staff Assigned:</b></p><div class="d-flex flex-wrap mb-2">${staffList}</div>
        <h4 class="text-gold mt-3">Total: ₹${b.total}</h4>
        <button class="btn btn-outline-gold mt-3 w-100" onclick="downloadReceiptPDF()">Download PDF</button>
    </div>`;
}
// ===============================
// === ABOUT SECTION ===
function renderAbout() {
    const area = document.getElementById("contentArea");
    area.innerHTML = `

    <div class="particles" style="pointer-events:none;">
        ${Array.from({length: 25}).map(() => {
            const left = Math.random() * 100;
            const delay = Math.random() * 6;
            return `<div class="particle" style="left:${left}%; animation-delay:${delay}s"></div>`;
        }).join('')}
    </div>

    <div class="about-master">

        <div class="about-top parallax-layer">
            <div class="about-logo">
                <img src="/static/images/logo.png">
            </div>

            <div class="welcome-box">
                <h2>Welcome to Lalitha Grand Hotel</h2>
                
                <p class="center-text">Luxury · Comfort · Care</p>
                <p>Experience a blend of elegance, warmth, and premium  comfort.Every corner reflects elegance, every service reflects care.</p>
            </div>
        </div>

        <div class="about-card parallax-layer">
            <p>
                Discover interiors crafted to perfection. Every corner reflects 
                luxury, comfort, care and timeless elegance designed for world-class hospitality.our hotel offers beautifully designed rooms, royal suites, a multi-cuisine fine-dining restaurant, and a premium spa & wellness center.
            </p>
        </div>

        <div class="highlight-box parallax-layer" id="facilityBox">
            <h4>✨ Facilities of Lalitha Grand Hotel ✨</h4>

            <ul id="facilityList">
                <li>👑Luxury Rooms & Royal Suites🏰</li>
                <li>🥘 Fine Dining Multi-Cuisine Restaurant🍽️</li>
                <li>⏱️24×7 Concierge &world class hospitality🛎️</li>
                <li> 👨‍🍳premium quality Room Service⏱️</li>
                <li>🧖Premium Spa & Wellness Center🌿</li>
                <li>🏛️Banquet Hall & Conference Rooms🎤</li>
                <li>📶High-Speed Wi-Fi & Smart TV📺</li>
            </ul>
        </div>

    </div>
    `;

    // Animate facilities after DOM is painted
    requestAnimationFrame(() => {
        const items = document.querySelectorAll("#facilityList li");
        let delay = 200;

        items.forEach((li, i) => {
            li.classList.add(i % 2 === 0 ? 'slide-left' : 'slide-right');
            setTimeout(() => {
                li.classList.add(i % 2 === 0 ? 'show-left' : 'show-right');
            }, i * delay);
        });
    });
}

// === GLOBAL PARALLAX EFFECT ===
document.addEventListener("mousemove", (e) => {
    document.querySelectorAll(".parallax-layer").forEach(layer => {
        const speed = 0.03;
        const x = (window.innerWidth / 2 - e.clientX) * speed;
        const y = (window.innerHeight / 2 - e.clientY) * speed;
        layer.style.transform = `translate(${x}px, ${y}px)`;
    });
});
async function downloadReceiptPDF() {
    try {
        // Ensure libraries are available
        if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            alert('Required PDF libraries are missing. Make sure html2canvas and jsPDF are loaded.');
            return;
        }

        // get jspdf from the UMD bundle
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            alert('jsPDF not available');
            return;
        }

        const receiptCard = document.querySelector(".card.shadow-lg.p-4"); // the receipt card selector in renderReceipt

        if (!receiptCard) {
            alert("No receipt found!");
            return;
        }

        // temporarily remove any focus outline and shadows that might clip
        const origBoxShadow = receiptCard.style.boxShadow;
        receiptCard.style.boxShadow = 'none';

        const canvas = await html2canvas(receiptCard, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");

        // restore style
        receiptCard.style.boxShadow = origBoxShadow;

        const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 20;
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // If content is taller than a single page, split across pages
        let heightLeft = imgHeight;
        let position = margin;
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight() - margin * 2;

        while (heightLeft > 0) {
            pdf.addPage();
            position = margin - heightLeft + imgHeight; // adjust position on next page
            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight() - margin * 2;
        }

        pdf.save('receipt.pdf');
    }
    catch (err) {
        console.error('PDF Error:', err);
        alert('Unable to download PDF. See console for details.');
    }
}

