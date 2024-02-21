<?php

header('Access-Control-Allow-Origin: *');
header("X-Robots-Tag: noindex, nofollow", true);

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  handlePreflight();
}

$historyFile = $config['history_file'];
$defaultUrl = $config['default_url'];
$maxUrls = $config['max_urls'];
$duration = $config['duration'];

function handlePreflight()
{
  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Secret-Key'); //Secret-Key for compatability with legacy versions that use authentication
  exit(0);
}

function saveUrl($url, $historyFile, $maxUrls)
{
  $history = loadHistory($historyFile);
  array_unshift($history, ['url' => $url, 'timestamp' => time()]);
  $history = array_slice($history, 0, $maxUrls);
  file_put_contents($historyFile, json_encode($history));
  return ['message' => 'URL submitted successfully'];
}

function loadHistory($historyFile)
{
  return file_exists($historyFile) ? json_decode(file_get_contents($historyFile), true) ?? [] : [];
}

function redirectToUrl($url)
{
  header("Location: $url", true, 303);
  exit;
}

function sendJsonResponse($data, $statusCode = 200)
{
  header('Content-Type: application/json');
  http_response_code($statusCode);
  echo json_encode($data);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = json_decode(file_get_contents('php://input'), true);
  if (isset($data['url'])) {
    $result = saveUrl($data['url'], $historyFile, $maxUrls);
    sendJsonResponse($result);
  }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
  handleGetRequest($config);
}

function handleGetRequest($config)
{
  $history = loadHistory($config['history_file']);
  if (isset($_GET['save'])) {
    $url = urldecode($_GET['save']);
    $result = saveUrl($url, $config['history_file'], $config['max_urls']);
    ?>
    <html>

    <head>
      <title>URL Saved</title>
      <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
      <link rel="icon" href="/favicon.ico" type="image/x-icon">
      <script type='text/javascript'>
        setTimeout(function () {
          window.close();
        }, 2000);
      </script>
    </head>
    <style>
      body {
        text-align: center;
        padding: 40px 0;
        background: #EBF0F5;
      }

      h1 {
        color: #88B04B;
        font-family: "Helvetica Neue", sans-serif;
        font-weight: 900;
        font-size: 40px;
        margin-bottom: 10px;
      }

      p {
        color: #404F5E;
        font-family: "Helvetica Neue", sans-serif;
        font-size: 20px;
        margin: 0;
      }

      i {
        color: #9ABC66;
        font-size: 100px;
        line-height: 200px;
        margin-left: -15px;
      }

      .card {
        background: white;
        padding: 60px;
        border-radius: 4px;
        box-shadow: 0 2px 3px #C8D0D8;
        display: inline-block;
        margin: 0 auto;
      }
    </style>

    <body>
      <div class="card">
        <div style="border-radius:200px; height:200px; width:200px; background: #F8FAF5; margin:0 auto;">
          <i class="checkmark">✓</i>
        </div>
        <h1>Saved</h1>
        <p>The URL has been saved.<br />This window will close automatically.</p>
      </div>
    </body>

    </html>

    <?php
    exit;
  } elseif (isset($_GET['action'])) {
    switch ($_GET['action']) {
      case 'latest':
        !empty($history) ? redirectToUrl($history[0]['url']) : redirectToUrl($config['default_url']);
        break;
      case 'clearHistory':
        file_put_contents($config['history_file'], json_encode([]));
        sendJsonResponse(['status' => 'success', 'message' => 'History cleared']);
        break;
      case 'history':
        sendJsonResponse($history);
        break;
      default:
        sendJsonResponse(['message' => 'Action not recognized.'], 400);
    }
  } elseif (empty($_GET)) {
    $url = !empty($history) && (time() - $history[0]['timestamp'] <= $config['duration']) ? $history[0]['url'] : $config['default_url'];
    redirectToUrl($url);
  } else {
    sendJsonResponse(['message' => 'Invalid request'], 400);
  }
}
