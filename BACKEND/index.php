<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// Point d'entrée du backend (routeur principal)
// Contrôle d'accès et d'autorisation à ajouter ici 

require_once __DIR__ . '/CONTROLLERS/ProductController.php';

$controller = new ProductController();
$route = $_GET['route'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

if ($route === 'products' && $method === 'GET') {
    $controller->getAll();
} elseif ($route === 'products/publish' && $method === 'POST') {
    $controller->publish();
} elseif ($route === 'products/validate' && $method === 'POST') {
    $controller->validate();
} elseif ($route === 'products/last-update' && $method === 'GET') {
    $controller->getLastUpdate();
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route non trouvée']);
} 