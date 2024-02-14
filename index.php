<?php

// Allow requests from any origin
header('Access-Control-Allow-Origin: *');
header("X-Robots-Tag: noindex, nofollow", true);

// Handle preflight requests for POST
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Secret-Key');
    exit(0);
}

// Include the configuration file
require_once 'config.php';

// Access configuration settings
$history_file = $config['history_file'];
$default_url = $config['default_url'];
$max_urls = $config['max_urls'];
$duration = $config['duration'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    if (isset($data['url'])) {
        $history = file_exists($history_file) ? json_decode(file_get_contents($history_file), true) : [];
        
        // Prepend the new URL with timestamp
        array_unshift($history, ['url' => $data['url'], 'timestamp' => time()]);
        
        // Keep only the latest 10 URLs
        $history = array_slice($history, 0, $max_urls);
        
        // Save the updated history
        file_put_contents($history_file, json_encode($history));
        
        echo json_encode(['message' => 'URL submitted successfully']);
        http_response_code(200);
        exit;
    }
}


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $history = file_exists($history_file) ? json_decode(file_get_contents($history_file), true) : [];

    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] == 'clearHistory') {
        // Assuming your history is stored in 'url_history.json'
        file_put_contents('url_history.json', json_encode([])); // Empty the history file
        echo json_encode(['status' => 'success', 'message' => 'History cleared']);
        exit;
    } else if (isset($_GET['action']) && $_GET['action'] == 'latest') {
        // Always redirect to the latest URL regardless of timestamp
        if (!empty($history)) {
            header("Location: " . $history[0]['url'], true, 303);
            exit;
        }
    } else if (isset($_GET['action']) && $_GET['action'] == 'history') {
        // Serve the history as JSON
        header('Content-Type: application/json');
        echo file_exists($history_file) ? file_get_contents($history_file) : json_encode([]);
        exit;
    }  else {

        if (!empty($history) && (time() - $history[0]['timestamp']) <= $duration) {
            header("Location: " . $history[0]['url'], true, 303);
            exit;
        } else {
            header("Location: " . $default_url, true, 303);
            exit;
        }
    }
}

?>