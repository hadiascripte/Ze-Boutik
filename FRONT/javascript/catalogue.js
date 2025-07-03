let allProducts = [];
let currentView = "all";
let currentStatus = "all";
let pollingInterval = null;
let lastRefresh = null;

function switchView(view, el) {
    currentView = view;
    document
        .querySelectorAll(".navbar-nav .nav-link, .btn.btn-outline-primary")
        .forEach((l) => l.classList.remove("active"));
    if (el) el.classList.add("active");
    // Désactive le filtre statut
    currentStatus = "all";
    // Réinitialise l'état actif des boutons de filtre statut
    const btnGroup = document.getElementById("statusBtnGroup");
    if (btnGroup) {
        btnGroup.querySelectorAll("button").forEach((b) => {
            b.classList.remove("active");
        });
    }
    const select = document.getElementById("statusFilter");
    if (select) select.value = "all";
    renderCurrentView();
}

function renderCurrentView() {
    let filtered = allProducts;
    // Si un filtre statut est actif (autre que 'all'), il prime sur la vue
    if (currentStatus !== "all") {
        filtered = allProducts.filter((p) => p.status === currentStatus);
    } else {
        // Sinon, on applique la vue nav
        if (currentView === "withoutPhoto") {
            filtered = allProducts.filter((p) => p.status === "Photo à ajouter");
        } else if (currentView === "ready") {
            filtered = allProducts.filter((p) => p.status === "A publier");
        } else if (currentView === "all") {
            filtered = allProducts;
        }
    }
    // Tri par date de dernière modification (du plus récent au plus ancien)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderProducts(filtered);
}

document.addEventListener("DOMContentLoaded", function () {
    // Gestion du filtre par boutons (desktop)
    const btnGroup = document.getElementById("statusBtnGroup");
    if (btnGroup) {
        btnGroup.querySelectorAll("button").forEach((btn) => {
            btn.addEventListener("click", function () {
                currentStatus = this.getAttribute("data-status");
                btnGroup
                    .querySelectorAll("button")
                    .forEach((b) => b.classList.remove("active"));
                this.classList.add("active");
                // Synchroniser le select mobile
                const select = document.getElementById("statusFilter");
                if (select) select.value = currentStatus;
                // Désactive l'état actif de la nav
                document
                    .querySelectorAll(".navbar-nav .nav-link")
                    .forEach((l) => l.classList.remove("active"));
                renderCurrentView();
            });
        });
    }
    // Gestion du filtre par select (mobile)
    document.getElementById("statusFilter").addEventListener("change", function () {
        currentStatus = this.value;
        // Synchroniser les boutons desktop
        if (btnGroup) {
            btnGroup.querySelectorAll("button").forEach((b) => {
                b.classList.toggle(
                    "active",
                    b.getAttribute("data-status") === currentStatus
                );
            });
        }
        // Désactive l'état actif de la nav
        document
            .querySelectorAll(".navbar-nav .nav-link")
            .forEach((l) => l.classList.remove("active"));
        renderCurrentView();
    });
});

function renderProducts(products) {
    const list = document.getElementById("product-list");
    list.innerHTML = "";
    if (!products.length) {
        list.innerHTML =
            '<div class="col-12 text-center text-muted">Aucun produit à afficher.</div>';
        return;
    }
    const statusColors = {
        "Photo à ajouter": "bg-danger text-white",
        "Description effectuée":
            "bg-success bg-opacity-10 text-success border border-success",
        "A publier": "bg-success bg-opacity-10 text-success border border-success",
        Publié: "bg-success text-white",
        Nouveau: "bg-primary bg-opacity-10 text-primary border border-primary",
        "Photo non analysable": "bg-warning text-dark",
    };
    products.forEach((p, idx) => {
        const detailsId = `details-${p.id}-${idx}`;
        const photo = p.photo
            ? `<img src="${p.photo}" class="img-fluid rounded h-100 w-100 object-fit-cover card-img-custom" alt="${p.name}">`
            : `<div class="bg-light d-flex align-items-center justify-content-center rounded h-100 w-100 card-img-custom" style="min-height:180px;color:#bbb;">Pas de photo</div>`;
        const audioBlock = p.audio
            ? `<audio controls style="width:100%"><source src="${p.audio}" type="audio/mpeg">Audio non supporté</audio>`
            : '<span class="text-muted">Pas d\'audio</span>';
        let publishInfo = "";
        let validateBtn = "";
        // Affiche l'encadré info pour les produits 'A publier'
        if (p.status === "A publier") {
            publishInfo = `<div class='alert alert-info mt-2 mb-2 text-center'>Ce produit sera publié automatiquement à la date prévue.</div>`;
        } else if (p.status === "Description effectuée") {
            validateBtn = `<button class="btn btn-success btn-sm mt-2" onclick="validateProduct('${p.id}', this)">Valider</button>`;
        }
        // Ne pas afficher le bouton Publier si le produit est déjà Publié
        if (p.status === "Publié") {
            publishInfo = "";
        }
        list.innerHTML += `
      <div class="col-12 col-md-6">
        <div class="card h-100 p-2">
          <div class="row g-0 align-items-stretch h-100">
            <div class="col-4 d-flex align-items-center justify-content-center">
              ${photo}
            </div>
            <div class="col-8">
              <div class="card-body d-flex flex-column h-100">
                <h5 class="card-title">${p.name}</h5>
                <h6 class="card-subtitle mb-2 text-primary">${
                    p.catchyTitle || ""
                }</h6>
                <div class="mb-2">${audioBlock}</div>
                <button class="btn btn-outline-secondary btn-sm mb-2" type="button" onclick="toggleDetails('${detailsId}')">En savoir plus</button>
                <div id="${detailsId}" class="collapse" style="display:none;">
                  <p class="card-text"><strong>Fonctionnalités et avantages :</strong><br>${
                      p.advantages || '<span class="text-muted">Non renseigné</span>'
                  }</p>
                  <p class="card-text"><strong>Liste des caractéristiques :</strong><br>${
                      p.characteristics ||
                      '<span class="text-muted">Non renseigné</span>'
                  }</p>
                </div>
                <span class="badge badge-status mt-2 ${
                    statusColors[p.status] || "bg-secondary"
                }">${p.status}</span>
                ${publishInfo}
                ${validateBtn}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    });
}

function toggleDetails(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = el.style.display === "none" ? "block" : "none";
}

async function publishAndRefresh(id, btn) {
    btn.disabled = true;
    btn.textContent = "Publication...";
    btn.classList.add("btn-flash-success");
    await publishProduct(id);
    btn.textContent = "Publié !";
    setTimeout(() => {
        btn.classList.remove("btn-flash-success");
        loadProducts();
    }, 3000);
}

async function validateProduct(productId, btn) {
    btn.disabled = true;
    btn.classList.add("btn-flash-success");
    const formData = new FormData();
    formData.append("id", productId);
    formData.append("status", "A publier");
    const res = await fetch("/BACKEND/index.php?route=products/validate", {
        method: "POST",
        body: formData,
    });
    await res.json();
    btn.textContent = "Validé !";
    setTimeout(() => {
        btn.classList.remove("btn-flash-success");
        loadProducts();
    }, 3000);
}
window.toggleDetails = toggleDetails;
window.publishAndRefresh = publishAndRefresh;
window.validateProduct = validateProduct;

async function loadProducts() {
    allProducts = await fetchProducts();
    renderCurrentView();
}

// Rafraîchissement automatique basé sur le flag (peut être commenté pour désactiver)
async function checkForUpdate() {
    const res = await fetch("/BACKEND/refresh.flag?" + Date.now());
    const timestamp = await res.text();
    if (lastRefresh !== null && timestamp !== lastRefresh) {
        // Vérifier si un audio est en cours de lecture
        const audios = document.querySelectorAll("audio");
        let isPlaying = false;
        audios.forEach((audio) => {
            if (!audio.paused) isPlaying = true;
        });
        if (!isPlaying) {
            await loadProducts();
        } else {
            // Optionnel : afficher une notification "Mise à jour disponible"
            if (!document.getElementById("update-notif")) {
                const notif = document.createElement("div");
                notif.id = "update-notif";
                notif.className = "alert alert-info position-fixed top-0 end-0 m-3";
                notif.innerHTML =
                    "Une mise à jour est disponible. Elle sera appliquée à la fin de la lecture.";
                document.body.appendChild(notif);
            }
        }
    }
    lastRefresh = timestamp;
}
// setInterval(checkForUpdate, 2000); // Désactivé pour éviter le rafraîchissement automatique

loadProducts();
