<?php
require __DIR__ . '/../src/mongo.php';

use MongoDB\BSON\Regex;

header('Content-Type: application/json; charset=utf-8');

function responder($dados, $status = 200) {
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

function lerJson() {
    $json  = file_get_contents('php://input');
    $dados = json_decode($json, true);
    return is_array($dados) ? $dados : [];
}

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $filtro = [];
    if (!empty($_GET["raridade"])) {
        $filtro["raridade_na_turma"] = $_GET["raridade"];
    }
    if (!empty($_GET["tipo"])) {
        $filtro['$or'] = [
            ["tipo_primario"   => $_GET["tipo"]],
            ["tipo_secundario" => $_GET["tipo"]]
        ];
    }
    if (!empty($_GET["q"])) {
        $busca = preg_quote(trim($_GET["q"]), '/');
        $filtro['$or'] = [
            ["nome_oficial" => new Regex($busca, "i")],
            ["treinador"    => new Regex($busca, "i")],
            ["apelido"      => new Regex($busca, "i")],
            ["observacao"   => new Regex($busca, "i")]
        ];
    }
    $cursor    = $collection->find($filtro);
    $resultado = [];
    foreach ($cursor as $doc) {
        $doc["_id"] = (string) $doc["_id"];
        $resultado[] = $doc;
    }
    responder($resultado);
}

if ($metodo === 'POST') {
    $dados = lerJson();
    if (empty(trim($dados["treinador"] ?? ""))) {
        responder(["erro" => "O nome do treinador é obrigatório."], 400);
    }
    if (empty($dados["nome_oficial"])) {
        responder(["erro" => "Busque o Pokémon na PokéAPI antes de salvar."], 400);
    }
    $novoPokemon = [
        "nome_oficial"      => $dados["nome_oficial"]           ?? "",
        "numero_pokedex"    => intval($dados["numero_pokedex"]  ?? 0),
        "imagem_url"        => $dados["imagem_url"]             ?? "",
        "tipo_primario"     => $dados["tipo_primario"]          ?? "",
        "tipo_secundario"   => $dados["tipo_secundario"]        ?? "",
        "altura_m"          => floatval($dados["altura_m"]      ?? 0),
        "peso_kg"           => floatval($dados["peso_kg"]       ?? 0),
        "experiencia_base"  => intval($dados["experiencia_base"]?? 0),
        "habilidades"       => $dados["habilidades"]            ?? [],
        "movimentos"        => $dados["movimentos"]             ?? [],
        "treinador"         => trim($dados["treinador"]         ?? ""),
        "apelido"           => $dados["apelido"]                ?? "",
        "nivel"             => intval($dados["nivel"]           ?? 1),
        "raridade_na_turma" => $dados["raridade_na_turma"]      ?? "Comum",
        "observacao"        => $dados["observacao"]             ?? ""
    ];
    $resultado = $collection->insertOne($novoPokemon);
    responder([
        "sucesso"  => true,
        "mensagem" => "Pokémon salvo na Pokédex da turma!",
        "id"       => (string) $resultado->getInsertedId()
    ], 201);
}

if ($metodo === 'DELETE') {
    $id = $_GET["id"] ?? "";
    if (empty($id)) {
        responder(["erro" => "ID não informado."], 400);
    }
    $collection->deleteOne(["_id" => new MongoDB\BSON\ObjectId($id)]);
    responder(["sucesso" => true, "mensagem" => "Pokémon removido."]);
}