<?php
require __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

$mongoUri = getenv('MONGODB_URI');

if (!$mongoUri) {
    $mongoUri = "mongodb+srv://nathaliafh:741258sofia@cluster0.kunhsnl.mongodb.net/?retryWrites=true&w=majority";
}

$client = new Client($mongoUri);

$collection = $client
    ->selectDatabase("bd2_pokedex")
    ->selectCollection("pokemons");