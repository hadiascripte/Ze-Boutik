document.addEventListener("DOMContentLoaded", async function () {
    const produits = await fetchProducts();
    const produit = produits.find((p) => p.status === "Publié");
    if (!produit) {
        document.body.innerHTML =
            '<div class="container py-5 text-center"><h2>Aucun produit publié pour le moment.</h2></div>';
        return;
    }
    // Debug : afficher le produit publié dans la console
    console.log("Produit publié récupéré pour la boutique:", produit);
    // Remplir dynamiquement la page avec les infos du produit publié
    document.querySelector(".img-fluid.rounded.shadow").src =
        produit.photo || "../assets/no-photo.png";
    document.querySelector(".img-fluid.rounded.shadow").alt = produit.name;
    document.querySelector("h1").textContent = produit.name;
    document.querySelector(".badge.bg-success").textContent = "En stock";
    document.querySelector(".text-primary.mb-3").textContent = produit.price
        ? produit.price + " €"
        : "";
    document.querySelector(".card-subtitle, .mb-2.text-primary").textContent =
        produit.catchyTitle || "";
    document.getElementById("desc-detail").textContent = produit.advantages || "";
    // Description détaillée
    document.querySelectorAll(".mb-3")[1].textContent =
        produit.characteristics || "";
    // Audio
    const btnAudio = document.getElementById("btn-audio");
    const audioBlock = document.getElementById("audio-block");
    if (produit.audio) {
        audioBlock.innerHTML = "";
        audioBlock.style.display = "none";
        btnAudio.style.display = "inline-block";
        btnAudio.textContent = "▶️ Écouter la description audio";
        btnAudio.onclick = function () {
            const isHidden = audioBlock.style.display === "none";
            if (isHidden) {
                audioBlock.innerHTML = `<audio controls style=\"width:100%\" tabindex=\"0\"><source src=\"${produit.audio}\" type=\"audio/mpeg\">Audio non supporté</audio>`;
                audioBlock.style.display = "block";
                btnAudio.textContent = "⏸️ Masquer l'audio";
                // Focus sur le lecteur audio si affiché
                const audioEl = audioBlock.querySelector("audio");
                if (audioEl) audioEl.focus();
            } else {
                audioBlock.innerHTML = "";
                audioBlock.style.display = "none";
                btnAudio.textContent = "▶️ Écouter la description audio";
            }
        };
        btnAudio.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                btnAudio.click();
            }
        });
    } else {
        btnAudio.style.display = "inline-block";
        audioBlock.style.display = "block";
        audioBlock.innerHTML =
            '<div class="alert alert-warning">Aucune description audio disponible pour ce produit.</div>';
    }
    // Avis/Commentaires : à adapter si tu veux les rendre dynamiques
});
