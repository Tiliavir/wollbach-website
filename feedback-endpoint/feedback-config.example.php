<?php

// Copy to feedback-config.php one directory ABOVE the web root that serves feedback.php.
// Never place it inside the web root and never commit the real file.
return [
    'token' => 'github_pat_…',
    'owner' => 'Tiliavir',
    'repo' => 'public-feedback',
    'source' => 'wollbach.info',
    'labels' => ['ungeprüft'],
    'allowed_origins' => ['https://www.wollbach.info', 'https://wollbach.info'],
    'success_url' => 'https://www.wollbach.info/feedback/danke/',
    'error_url' => 'https://www.wollbach.info/feedback/fehler/',
    'salt' => 'replace with: php -r "echo bin2hex(random_bytes(32));"',
    'storage_dir' => __DIR__ . '/feedback-data',
    'limit_per_client_per_hour' => 5,
    'limit_per_day' => 30,
];
