<?php

// Configuration settings
$config = [
    'history_file' => 'url_history.json', //path to json with URLs, ensure PHP has rear/write permissions to update the file
    'default_url' => 'https://example.com/', //default URL where pople will be redirected after "duration" lapses or if no entries are stored
    'max_urls' => 10, //maximum number of URLs to store
    'duration' => 900, //duration to redirect to last URL in seconds, remember to change the value in minutes config.js to show the value in the UI
];