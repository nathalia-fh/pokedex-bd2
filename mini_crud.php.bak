<?php
require __DIR__ . '/vendor/autoload.php';

use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;

$mongoUri = "mongodb+srv://nathaliafh:741258sofia@cluster0.kunhsnl.mongodb.net/?retryWrites=true&w=majority";

$client = new MongoDB\Client($mongoUri);

$colecao = $client
    ->selectDatabase("bd2_pokedex")
    ->selectCollection("mini_crud");

$acao = $_GET["acao"] ?? "listar";

if ($acao === "criar") {
    $numeroPokedex = intval($_GET["numero"] ?? 0);
    $nome          = $_GET["nome"] ?? "Sem nome";
    $tipo          = $_GET["tipo"] ?? "Normal";
    if ($numeroPokedex <= 0) { echo "Informe um numero valido."; exit; }
    $resultado = $colecao->insertOne([
        "numero_pokedex" => $numeroPokedex,
        "nome"           => $nome,
        "tipo"           => $tipo,
        "nivel"          => 1,
        "criado_em"      => new UTCDateTime()
    ]);
    echo "Documento criado com ID: " . $resultado->getInsertedId();
    exit;
}

if ($acao === "listar") {
    $cursor = $colecao->find([], ["sort" => ["numero_pokedex" => 1]]);
    echo "<h1>Mini CRUD</h1>";
    foreach ($cursor as $doc) {
        echo "<p>";
        echo "ID MongoDB: "     . $doc["_id"]                    . "<br>";
        echo "Numero Pokedex: " . ($doc["numero_pokedex"] ?? "") . "<br>";
        echo "Nome: "           . ($doc["nome"]           ?? "") . "<br>";
        echo "Tipo: "           . ($doc["tipo"]           ?? "") . "<br>";
        echo "Nivel: "          . ($doc["nivel"]          ?? "") . "<br>";
        echo "</p><hr>";
    }
    exit;
}

if ($acao === "buscar_tipo") {
    $tipo   = $_GET["tipo"] ?? "Normal";
    $cursor = $colecao->find(["tipo" => $tipo]);
    foreach ($cursor as $doc) {
        echo ($doc["numero_pokedex"] ?? "") . " - ";
        echo ($doc["nome"]           ?? "") . " - ";
        echo ($doc["tipo"]           ?? "") . "<br>";
    }
    exit;
}

if ($acao === "buscar_numero") {
    $numeroPokedex = intval($_GET["numero"] ?? 0);
    $doc = $colecao->findOne(["numero_pokedex" => $numeroPokedex]);
    if (!$doc) { echo "Nenhum Pokemon encontrado."; exit; }
    echo "<h1>Pokemon encontrado</h1>";
    echo "ID MongoDB: "     . $doc["_id"]                    . "<br>";
    echo "Numero Pokedex: " . ($doc["numero_pokedex"] ?? "") . "<br>";
    echo "Nome: "           . ($doc["nome"]           ?? "") . "<br>";
    echo "Tipo: "           . ($doc["tipo"]           ?? "") . "<br>";
    echo "Nivel: "          . ($doc["nivel"]          ?? "") . "<br>";
    exit;
}

if ($acao === "atualizar") {
    $numeroPokedex = intval($_GET["numero"] ?? 0);
    $nivel         = intval($_GET["nivel"]  ?? 1);
    if ($numeroPokedex <= 0) { echo "Informe um numero valido."; exit; }
    $resultado = $colecao->updateOne(
        ["numero_pokedex" => $numeroPokedex],
        ['$set' => ["nivel" => $nivel]]
    );
    echo "Encontrados: "  . $resultado->getMatchedCount()  . "<br>";
    echo "Alterados: "    . $resultado->getModifiedCount();
    exit;
}

if ($acao === "excluir") {
    $numeroPokedex = intval($_GET["numero"] ?? 0);
    if ($numeroPokedex <= 0) { echo "Informe um numero valido."; exit; }
    $resultado = $colecao->deleteOne(["numero_pokedex" => $numeroPokedex]);
    echo "Excluidos: " . $resultado->getDeletedCount();
    exit;
}