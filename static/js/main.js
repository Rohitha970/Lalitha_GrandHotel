// Only run on pages that have ROOMS/FOOD provided
document.addEventListener("DOMContentLoaded", function() {
  // if ROOMS is undefined, skip (admin/login pages)
  if (typeof ROOMS === "undefined") return;

  const roomType = document.getElementById("roomType");
  const roomImageDiv = document.getElementById("roomImageDiv");
  const roomList = document.getElementById("roomList");
  const cuisine = document.getElementById("cuisine");
  const mealOptions = document.getElementById("mealOptions");
  const selRoom = document.getElementById("selRoom");
  const selFood = document.getElementById("selFood");
  const totalPrice = document.getElementById("totalPrice");
  const roomNumberInput = document.getElementById("room_number_input");
  const totalPriceInput = document.getElementById("total_price_input");
  const special = document.getElementById("special");
  const livePreview = document.getElementById("livePreview");

  let selectedRoomPrice = 0;
  let selectedFood = [];

  function updateSummary() {
    selFood.innerHTML = "";
    selectedFood.forEach(f => {
      const li = document.createElement("li");
      li.textContent = `${f.name} x ${f.qty} — ₹${f.price * f.qty}`;
      selFood.appendChild(li);
    });
    const total = selectedRoomPrice + selectedFood.reduce((s, f) => s + (f.qty * f.price), 0);
    totalPrice.textContent = total;
    totalPriceInput.value = total;
  }

  // Room type change -> show single type image and list of its rooms (10)
  roomType && roomType.addEventListener("change", function() {
    roomImageDiv.innerHTML = "";
    roomList.innerHTML = "";
    selectedRoomPrice = 0;
    roomNumberInput.value = "";
    selRoom.textContent = "None";
    updateSummary();

    const t = roomType.value;
    if (!t || !ROOMS[t]) return;

    // show large image for type
    const img = document.createElement("img");
    img.src = `/static/images/rooms/${t.toLowerCase()}.jpg`;
    img.className = "img-fluid rounded shadow-sm";
    img.style.maxHeight = "220px";
    img.style.objectFit = "cover";
    roomImageDiv.appendChild(img);

    // show up to 10 rooms (from JSON)
    const list = ROOMS[t];
    list.forEach((r, idx) => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-2";

      const card = document.createElement("div");
      card.className = "card p-2 text-center room-card";

      const number = document.createElement("div");
      number.className = "fw-bold mb-1";
      number.textContent = r.number;

      const price = document.createElement("div");
      price.textContent = `₹${r.price}`;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-outline-gold mt-2";
      btn.textContent = r.available ? "Select" : "Booked";
      btn.disabled = !r.available;

      btn.addEventListener("click", function() {
        // highlight
        roomList.querySelectorAll(".card").forEach(c=>c.classList.remove("selected-room"));
        card.classList.add("selected-room");
        roomNumberInput.value = r.number;
        selectedRoomPrice = r.price;
        selRoom.textContent = `${t} — ${r.number} (₹${r.price})`;
        updateSummary();
      });

      card.appendChild(number);
      card.appendChild(price);
      card.appendChild(btn);
      col.appendChild(card);
      roomList.appendChild(col);
    });
  });

  // Food selection
  cuisine && cuisine.addEventListener("change", function() {
    mealOptions.innerHTML = "";
    selectedFood = [];
    updateSummary();
    const c = cuisine.value;
    if (!c || !FOOD[c]) return;

    ["Breakfast","Lunch","Dinner","Snacks"].forEach(meal => {
      const block = document.createElement("div");
      block.className = "mb-3";
      const h = document.createElement("h5"); h.textContent = meal;
      block.appendChild(h);

      const items = FOOD[c][meal].slice(0,5); // first 5 only
      items.forEach((it, idx) => {
        const row = document.createElement("div");
        row.className = "d-flex align-items-center mb-2";

        const img = document.createElement("img");
        img.src = `/static/images/food/${c.toLowerCase()}/${(idx%5)+1}.jpg`;
        img.style.width = "80px";
        img.style.height = "60px";
        img.style.objectFit = "cover";
        img.className = "me-2 rounded";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "form-check-input me-2";

        const label = document.createElement("label");
        label.className = "me-2";
        label.textContent = `${it.name} — ₹${it.price}`;

        const qty = document.createElement("input");
        qty.type = "number"; qty.min = 1; qty.value = 1;
        qty.style.width = "70px"; qty.disabled = true;

        cb.addEventListener("change", function() {
          if (cb.checked) {
            qty.disabled = false;
            selectedFood.push({ name: it.name, price: it.price, qty: parseInt(qty.value) });
          } else {
            qty.disabled = true;
            selectedFood = selectedFood.filter(x => x.name !== it.name);
          }
          updateSummary();
        });

        qty.addEventListener("input", function() {
          const f = selectedFood.find(x => x.name === it.name);
          if (f) { f.qty = parseInt(qty.value); updateSummary(); }
        });

        row.appendChild(img); row.appendChild(cb); row.appendChild(label); row.appendChild(qty);
        block.appendChild(row);
      });

      mealOptions.appendChild(block);
    });
  });

  // Live typing preview for special requests
  if (special && livePreview) {
    special.addEventListener("input", function() {
      livePreview.textContent = special.value || "Your special requests will show here as you type...";
    });
  }

  // final set total on submit (also prepare hidden food inputs)
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", function(e) {
      // ensure a room number selected
      if (!roomNumberInput.value) {
        e.preventDefault();
        alert("Please select a room number before confirming.");
        return false;
      }
      // create hidden inputs for food items (name x qty)
      // remove any previous appended hidden inputs first
      document.querySelectorAll('input[name="food_items[]"]').forEach(n=>n.remove());
      selectedFood.forEach(f => {
        const h = document.createElement("input");
        h.type = "hidden";
        h.name = "food_items[]";
        h.value = `${f.name} x ${f.qty} | ${f.price}`;
        bookingForm.appendChild(h);
      });
      // set totals
      totalPriceInput.value = totalPrice.textContent;
    });
  }
});
