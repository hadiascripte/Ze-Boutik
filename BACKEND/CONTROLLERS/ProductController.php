<?php
require_once __DIR__ . '/../MODELS/AirtableModel.php';

class ProductController {
    private $model;
    public function __construct() {
        $this->model = new AirtableModel();
    }

    public function getAll() {
        $data = $this->model->getAllProducts();
        header('Content-Type: application/json');
        echo json_encode($data['records']);
    }

    public function publish() {
        $id = $_POST['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID manquant']);
            return;
        }
        $result = $this->model->updateProductStatus($id, 'Publié');
        header('Content-Type: application/json');
        echo json_encode($result);
    }

    public function validate() {
        $id = $_POST['id'] ?? null;
        $status = $_POST['status'] ?? 'A publier';
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID manquant']);
            return;
        }
        $result = $this->model->updateProductStatus($id, $status);
        header('Content-Type: application/json');
        echo json_encode($result);
    }
} 