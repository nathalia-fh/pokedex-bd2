<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Pokédex da Turma</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="./style.css?v=4" rel="stylesheet">
</head>

<body>

<div class="page-wrapper">

    <header class="hero">
        <div>
            <span class="hero-badge">BD2 + Web</span>
            <h1>Pokédex da Turma</h1>
        </div>

        <div class="hero-ball">
            <div class="hero-ball-inner"></div>
        </div>
    </header>

    <main class="container pb-5">

        <div id="alerta"></div>

        <section class="panel-card mb-4">
            <div class="section-title">
                <div>
                    <h2>Buscar Pokémon</h2>
                </div>
            </div>

            <form id="formPokemon">
                <input type="hidden" id="id">

                <input type="hidden" id="nome_oficial">
                <input type="hidden" id="numero_pokedex">
                <input type="hidden" id="imagem_url">
                <input type="hidden" id="tipo_primario">
                <input type="hidden" id="tipo_secundario">
                <input type="hidden" id="altura_m">
                <input type="hidden" id="peso_kg">
                <input type="hidden" id="experiencia_base">
                <input type="hidden" id="habilidades">
                <input type="hidden" id="movimentos">

                <div class="row align-items-stretch">
                    <div class="col-lg-7">
                        <div class="mb-3">
                            <label for="pokemonBusca" class="form-label">Pokémon</label>
                            <div class="input-group input-group-lg">
                                <input type="text" id="pokemonBusca" class="form-control" placeholder="Ex.: pikachu, charizard, eevee ou 25">
                                <button class="btn btn-dark" type="button" onclick="buscarDadosPokemon()">
                                    Buscar na PokéAPI
                                </button>
                            </div>
                            <small class="text-muted">
                                Dica: use nomes oficiais em inglês, como pikachu, bulbasaur, charizard ou squirtle.
                            </small>
                        </div>

                        <div id="painelDadosApi" class="api-data-card d-none">
                            <div class="api-data-header">
                                <div>
                                    <span id="apiNumero" class="api-number">#000</span>
                                    <h3 id="apiNome">Pokémon</h3>
                                </div>

                                <div id="apiTipos"></div>
                            </div>

                            <div class="api-grid">
                                <div>
                                    <span>Altura</span>
                                    <strong id="apiAltura">-</strong>
                                </div>

                                <div>
                                    <span>Peso</span>
                                    <strong id="apiPeso">-</strong>
                                </div>

                                <div>
                                    <span>Experiência base</span>
                                    <strong id="apiExperiencia">-</strong>
                                </div>
                            </div>

                            <div class="mt-3">
                                <span class="api-label">Habilidades</span>
                                <div id="apiHabilidades" class="tag-list"></div>
                            </div>

                            <div class="mt-3">
                                <span class="api-label">Alguns golpes</span>
                                <div id="apiMovimentos" class="tag-list"></div>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-5">
                        <div class="preview-card h-100">
                            <div class="preview-image-area">
                                <img id="previewImagem" src="" alt="Prévia do Pokémon">
                                <div id="previewPlaceholder">?</div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr class="my-4">

                <div class="section-title">
                    <div>
                        <h2>Dados da turma</h2>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label for="treinador" class="form-label">Treinador</label>
                        <input type="text" id="treinador" class="form-control" placeholder="Ex.: Ash" required>
                    </div>

                    <div class="col-md-4 mb-3">
                        <label for="apelido" class="form-label">Apelido na turma</label>
                        <input type="text" id="apelido" class="form-control" placeholder="Ex.: ADS Dev" required>
                    </div>

                    <div class="col-md-2 mb-3">
                        <label for="nivel" class="form-label">Nível</label>
                        <input type="number" id="nivel" class="form-control" min="1" max="100" value="1" required>
                    </div>

                    <div class="col-md-2 mb-3">
                        <label for="raridade_na_turma" class="form-label">Raridade</label>
                        <select id="raridade_na_turma" class="form-select">
                            <option>Comum</option>
                            <option>Incomum</option>
                            <option>Raro</option>
                            <option>Épico</option>
                            <option>Lendário</option>
                        </select>
                    </div>
                </div>

                <div class="mb-3">
                    <label for="observacao" class="form-label">Observação da turma</label>
                    <textarea id="observacao" class="form-control" rows="3" placeholder="Por que esse Pokémon foi escolhido? Qual seria sua função na equipe?" required></textarea>
                </div>

                <div class="d-flex gap-2 mt-2">
                    <button class="btn btn-primary btn-lg" type="submit" id="btnSalvar">
                        Salvar na Pokédex
                    </button>

                    <button class="btn btn-light btn-lg" type="button" onclick="limparFormulario()">
                        Limpar
                    </button>
                </div>
            </form>
        </section>

        <section class="panel-card mb-4">
            <div class="section-title">
                <div>
                    <h2>Filtros</h2>
                    <p>Pesquise os registros salvos pela turma.</p>
                </div>
            </div>

            <div class="row g-2">
                <div class="col-md-4">
                    <input type="text" id="filtroBusca" class="form-control" placeholder="Buscar por Pokémon, treinador, apelido ou observação">
                </div>

                <div class="col-md-3">
                    <select id="filtroTipo" class="form-select">
                        <option value="">Todos os tipos</option>
                        <option>Normal</option>
                        <option>Fogo</option>
                        <option>Água</option>
                        <option>Grama</option>
                        <option>Elétrico</option>
                        <option>Gelo</option>
                        <option>Lutador</option>
                        <option>Venenoso</option>
                        <option>Terra</option>
                        <option>Voador</option>
                        <option>Psíquico</option>
                        <option>Inseto</option>
                        <option>Pedra</option>
                        <option>Fantasma</option>
                        <option>Dragão</option>
                        <option>Sombrio</option>
                        <option>Aço</option>
                        <option>Fada</option>
                    </select>
                </div>

                <div class="col-md-3">
                    <select id="filtroRaridade" class="form-select">
                        <option value="">Todas as raridades</option>
                        <option>Comum</option>
                        <option>Incomum</option>
                        <option>Raro</option>
                        <option>Épico</option>
                        <option>Lendário</option>
                    </select>
                </div>

                <div class="col-md-2">
                    <button class="btn btn-dark w-100" onclick="carregarPokemons()">
                        Filtrar
                    </button>
                </div>
            </div>
        </section>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h2 class="list-title mb-0">Pokémon cadastrados</h2>
            </div>

            <button class="btn btn-outline-dark btn-sm" onclick="carregarPokemons()">
                Atualizar Pokédex
            </button>
        </div>

        <div id="carregando" class="alert alert-info">
            Carregando Pokédex...
        </div>

        <div id="listaPokemons" class="row g-4"></div>

    </main>

</div>

<script src="./app.js?v=5"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>