<?php
class AirtableModel {
    private $apiKey = 'patrc69P1LYcFO41b.9a2be0ec7c789b9b43e82e7c11d53c42f27ac96a08e1c3736cb933da3f592455';
    private $baseId = 'appbXs2X0z5rW9Vsh';
    private $table = 'Catalogue';
    private $apiUrl;

    public function __construct() {
        $this->apiUrl = "https://api.airtable.com/v0/{$this->baseId}/{$this->table}";
    }

    public function getAllProducts() {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->apiKey
        ]);
        $result = curl_exec($ch);
        curl_close($ch);
        return json_decode($result, true);
    }

    public function updateProductStatus($id, $newStatus) {
        $url = $this->apiUrl . "/$id";
        $data = [
            'fields' => [
                'Statut du produit' => $newStatus
            ]
        ];
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json'
        ]);
        $result = curl_exec($ch);
        curl_close($ch);
        return json_decode($result, true);
    }
} 