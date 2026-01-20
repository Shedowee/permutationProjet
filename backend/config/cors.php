<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'], // your React dev server

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['X-CSRF-TOKEN', 'X-XSRF-TOKEN'],

    'max_age' => 0,

    'supports_credentials' => true, // REQUIRED for HttpOnly cookies

];