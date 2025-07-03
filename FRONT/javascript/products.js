// FRONT/javascript/products.js

// Récupérer tous les produits depuis le backend
async function fetchProducts() {
    const res = await fetch("/BACKEND/index.php?route=products");
    const data = await res.json();
    return data.map((record) => ({
        id: record.id,
        name: record.fields["Nom du produit"] || "",
        status: record.fields["Statut du produit"] || "",
        photo: record.fields["photo du produit"]?.[0]?.url || null,
        catchyTitle: record.fields["Titre accrocheur"] || "",
        advantages: record.fields["Fonctionnalités et avantages"] || "",
        characteristics: record.fields["Liste des caractéristiques"] || "",
        audio: record.fields["Description audio complète"]?.[0]?.url || null,
        createdAt: record.createdTime,
    }));
}

// Publier un produit (changer son statut)
async function publishProduct(productId) {
    const formData = new FormData();
    formData.append("id", productId);
    const res = await fetch("/BACKEND/index.php?route=products/publish", {
        method: "POST",
        body: formData,
    });
    return await res.json();
}
