let allProducts = [];
let currentView = "all";
let currentStatus = "all";
let lastUpdateTime = null;
let updateTimer = null;

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
        loadProducts(); // Actualiser la page après le changement de statut
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
        loadProducts(); // Actualiser la page après le changement de statut
    }, 3000);
}
window.toggleDetails = toggleDetails;
window.publishAndRefresh = publishAndRefresh;
window.validateProduct = validateProduct;

async function loadProducts() {
    const currentState = saveCurrentState();
    allProducts = await fetchProducts();
    // Restaurer l'état AVANT de rendre la vue
    restoreCurrentState(currentState);
    renderCurrentView();
}

// Fonction pour sauvegarder l'état actuel
function saveCurrentState() {
    return {
        view: currentView,
        status: currentStatus,
    };
}

// Fonction pour restaurer l'état actuel
function restoreCurrentState(state) {
    if (state) {
        console.log("Restauration de l'état:", state);
        currentView = state.view;
        currentStatus = state.status;

        // Restaurer les classes actives visuellement
        if (currentStatus !== "all") {
            const btnGroup = document.getElementById("statusBtnGroup");
            if (btnGroup) {
                btnGroup.querySelectorAll("button").forEach((b) => {
                    const isActive = b.getAttribute("data-status") === currentStatus;
                    b.classList.toggle("active", isActive);
                    console.log(
                        `Bouton ${b.getAttribute("data-status")} actif:`,
                        isActive
                    );
                });
            }
            const select = document.getElementById("statusFilter");
            if (select) {
                select.value = currentStatus;
                console.log("Select mis à jour avec:", currentStatus);
            }
        }

        if (currentView !== "all") {
            document.querySelectorAll(".navbar-nav .nav-link").forEach((l) => {
                const isActive = l.id === `nav-${currentView}`;
                l.classList.toggle("active", isActive);
                console.log(`Lien ${l.id} actif:`, isActive);
            });
        }
    }
}

// Fonction pour vérifier les mises à jour
async function checkForStatusUpdates() {
    try {
        const response = await fetch(
            "/BACKEND/index.php?route=products/last-update"
        );
        const data = await response.json();

        if (data.lastUpdate && lastUpdateTime !== data.lastUpdate) {
            // Si c'est la première vérification, on enregistre juste le timestamp
            if (lastUpdateTime === null) {
                lastUpdateTime = data.lastUpdate;
                return;
            }

            // Si il y a eu un changement, on attend 3 secondes puis on actualise
            if (updateTimer) {
                clearTimeout(updateTimer);
            }

            updateTimer = setTimeout(async () => {
                console.log("Mise à jour détectée, actualisation de la page...");
                await loadProducts();
                lastUpdateTime = data.lastUpdate;
            }, 3000);
        }
    } catch (error) {
        console.error("Erreur lors de la vérification des mises à jour:", error);
    }
}

// Démarrer la vérification périodique (toutes les 2 secondes)
setInterval(checkForStatusUpdates, 2000);

loadProducts();
