const API_URL = "./api/pokemons.php";
const POKEAPI_URL = "https://pokeapi.co/api/v2/pokemon/";

let pokemonsCarregados = [];

document
  .getElementById("formPokemon")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!document.getElementById("nome_oficial").value) {
      mostrarAlerta("Busque um Pokémon na PokéAPI antes de salvar.", "warning");
      return;
    }

    const id = document.getElementById("id").value;

    const pokemon = {
      id: id,

      nome_oficial: document.getElementById("nome_oficial").value,
      numero_pokedex: document.getElementById("numero_pokedex").value,
      imagem_url: document.getElementById("imagem_url").value,
      tipo_primario: document.getElementById("tipo_primario").value,
      tipo_secundario: document.getElementById("tipo_secundario").value,
      altura_m: document.getElementById("altura_m").value,
      peso_kg: document.getElementById("peso_kg").value,
      experiencia_base: document.getElementById("experiencia_base").value,
      habilidades: lerArrayCampo("habilidades"),
      movimentos: lerArrayCampo("movimentos"),

      treinador: document.getElementById("treinador").value,
      apelido: document.getElementById("apelido").value,
      nivel: document.getElementById("nivel").value,
      raridade_na_turma: document.getElementById("raridade_na_turma").value,
      observacao: document.getElementById("observacao").value,
    };

    try {
      const resposta = await fetch(API_URL, {
        method: id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pokemon),
      });

      const dados = await lerRespostaJson(resposta);

      if (!resposta.ok) {
        throw new Error(dados.erro || "Erro ao salvar Pokémon.");
      }

      mostrarAlerta(dados.mensagem, "success");

      limparFormulario();
      carregarPokemons();
    } catch (erro) {
      mostrarAlerta(erro.message, "danger");
    }
  });

async function buscarDadosPokemon(mostrarMensagem = true) {
  const busca = document
    .getElementById("pokemonBusca")
    .value.trim()
    .toLowerCase();

  if (!busca) {
    mostrarAlerta("Digite o nome ou número do Pokémon.", "warning");
    return;
  }

  const termoBusca = normalizarNomePokemon(busca);

  try {
    const resposta = await fetch(`${POKEAPI_URL}${termoBusca}`);

    if (!resposta.ok) {
      throw new Error(
        "Pokémon não encontrado. Tente o nome oficial em inglês ou o número da Pokédex."
      );
    }

    const dados = await resposta.json();

    preencherDadosOficiais(dados);

    if (mostrarMensagem) {
      mostrarAlerta("Dados oficiais carregados pela PokéAPI!", "success");
    }
  } catch (erro) {
    limparDadosOficiais();
    mostrarAlerta(erro.message, "warning");
  }
}

async function carregarPokemons() {
  const lista = document.getElementById("listaPokemons");
  const carregando = document.getElementById("carregando");

  lista.innerHTML = "";
  carregando.style.display = "block";

  const busca = document.getElementById("filtroBusca").value;
  const tipo = document.getElementById("filtroTipo").value;
  const raridade = document.getElementById("filtroRaridade").value;

  const params = new URLSearchParams();

  if (busca) {
    params.append("q", busca);
  }

  if (tipo) {
    params.append("tipo", tipo);
  }

  if (raridade) {
    params.append("raridade", raridade);
  }

  try {
    const resposta = await fetch(`${API_URL}?${params.toString()}`);
    const resultado = await lerRespostaJson(resposta);

    if (!resposta.ok) {
      throw new Error(resultado.erro || "Erro ao carregar Pokédex.");
    }

    pokemonsCarregados = resultado.dados;
    montarLista(pokemonsCarregados);
  } catch (erro) {
    lista.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    ${escaparHtml(erro.message)}
                </div>
            </div>
        `;
  } finally {
    carregando.style.display = "none";
  }
}

function preencherDadosOficiais(dados) {
  const imagem =
    dados.sprites?.other?.["official-artwork"]?.front_default ||
    dados.sprites?.front_default ||
    "";

  const tiposTraduzidos = dados.types.map((item) =>
    converterTipo(item.type.name)
  );

  const tipoPrimario = tiposTraduzidos[0] || "Normal";
  const tipoSecundario = tiposTraduzidos[1] || "";

  const habilidades = dados.abilities.map((item) =>
    formatarNome(item.ability.name)
  );

  const movimentos = dados.moves
    .slice(0, 6)
    .map((item) => formatarNome(item.move.name));

  const alturaMetros = (dados.height / 10).toFixed(1);
  const pesoKg = (dados.weight / 10).toFixed(1);

  document.getElementById("nome_oficial").value = dados.name;
  document.getElementById("numero_pokedex").value = dados.id;
  document.getElementById("imagem_url").value = imagem;
  document.getElementById("tipo_primario").value = tipoPrimario;
  document.getElementById("tipo_secundario").value = tipoSecundario;
  document.getElementById("altura_m").value = alturaMetros;
  document.getElementById("peso_kg").value = pesoKg;
  document.getElementById("experiencia_base").value =
    dados.base_experience || 0;
  document.getElementById("habilidades").value = JSON.stringify(habilidades);
  document.getElementById("movimentos").value = JSON.stringify(movimentos);

  document.getElementById("pokemonBusca").value = dados.name;

  atualizarPreviewImagem(imagem);
  montarPainelApi({
    nome: dados.name,
    numero: dados.id,
    tipos: tiposTraduzidos,
    altura_m: alturaMetros,
    peso_kg: pesoKg,
    experiencia_base: dados.base_experience || 0,
    habilidades: habilidades,
    movimentos: movimentos,
  });
}

function montarPainelApi(dados) {
  document.getElementById("painelDadosApi").classList.remove("d-none");

  document.getElementById("apiNumero").innerText = `#${String(
    dados.numero
  ).padStart(3, "0")}`;
  document.getElementById("apiNome").innerText = formatarNome(dados.nome);
  document.getElementById("apiAltura").innerText = `${dados.altura_m} m`;
  document.getElementById("apiPeso").innerText = `${dados.peso_kg} kg`;
  document.getElementById("apiExperiencia").innerText = dados.experiencia_base;

  document.getElementById("apiTipos").innerHTML = dados.tipos
    .map(
      (tipo) => `
        <span class="type-pill ${classeTipo(tipo)}">${escaparHtml(tipo)}</span>
    `
    )
    .join("");

  document.getElementById("apiHabilidades").innerHTML = dados.habilidades
    .map(
      (habilidade) => `
        <span>${escaparHtml(habilidade)}</span>
    `
    )
    .join("");

  document.getElementById("apiMovimentos").innerHTML = dados.movimentos
    .map(
      (movimento) => `
        <span>${escaparHtml(movimento)}</span>
    `
    )
    .join("");
}

function montarLista(pokemons) {
  const lista = document.getElementById("listaPokemons");

  lista.innerHTML = "";

  if (!pokemons || pokemons.length === 0) {
    lista.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">
                    Nenhum Pokémon encontrado na Pokédex.
                </div>
            </div>
        `;

    return;
  }

  pokemons.forEach((pokemon) => {
    const tipoClasse = classeTipo(pokemon.tipo_primario || "Normal");

    lista.innerHTML += `
            <div class="col-md-6 col-xl-4">
                <article class="pokemon-card">
                    <div class="pokemon-card-top ${tipoClasse}">
                        <div class="pokemon-number">
                            #${String(pokemon.numero_pokedex).padStart(3, "0")}
                        </div>

                        <div class="pokemon-name">
                            ${escaparHtml(formatarNome(pokemon.nome_oficial))}
                        </div>

                        <div class="pokemon-trainer">
                            Treinador: ${escaparHtml(pokemon.treinador)}
                        </div>

                        ${
                          pokemon.imagem_url
                            ? `
                            <img class="pokemon-image" src="${escaparHtml(
                              pokemon.imagem_url
                            )}" alt="${escaparHtml(pokemon.nome_oficial)}">
                        `
                            : `
                            <div class="pokemon-no-image">?</div>
                        `
                        }
                    </div>

                    <div class="pokemon-card-body">
                        <div class="mb-2">
                            <span class="badge-soft">${escaparHtml(
                              pokemon.tipo_primario
                            )}</span>
                            ${
                              pokemon.tipo_secundario
                                ? `<span class="badge-soft">${escaparHtml(
                                    pokemon.tipo_secundario
                                  )}</span>`
                                : ""
                            }
                            <span class="badge-soft">Nv. ${escaparHtml(
                              pokemon.nivel
                            )}</span>
                            <span class="badge-soft">${escaparHtml(
                              pokemon.raridade_na_turma
                            )}</span>
                        </div>

                        <h5 class="nickname">
                            ${escaparHtml(pokemon.apelido)}
                        </h5>

                        <p class="pokemon-description">
                            ${escaparHtml(pokemon.observacao)}
                        </p>

                        <div class="mini-stats">
                            <div>
                                <span>Altura</span>
                                <strong>${escaparHtml(
                                  pokemon.altura_m
                                )} m</strong>
                            </div>

                            <div>
                                <span>Peso</span>
                                <strong>${escaparHtml(
                                  pokemon.peso_kg
                                )} kg</strong>
                            </div>

                            <div>
                                <span>XP base</span>
                                <strong>${escaparHtml(
                                  pokemon.experiencia_base
                                )}</strong>
                            </div>
                        </div>

                        <div class="mt-3">
                            <small class="text-muted">Habilidades</small>
                            <div class="tag-list small-tags">
                                ${pokemon.habilidades
                                  .map(
                                    (habilidade) =>
                                      `<span>${escaparHtml(habilidade)}</span>`
                                  )
                                  .join("")}
                            </div>
                        </div>

                        <div class="mt-3">
                            <small class="text-muted">Golpes</small>
                            <div class="tag-list small-tags">
                                ${pokemon.movimentos
                                  .map(
                                    (movimento) =>
                                      `<span>${escaparHtml(movimento)}</span>`
                                  )
                                  .join("")}
                            </div>
                        </div>

                        <small class="text-muted d-block mt-3">
                            Criado em: ${escaparHtml(pokemon.criado_em)}
                        </small>

                        ${
                          pokemon.atualizado_em
                            ? `
                            <small class="text-muted d-block">
                                Atualizado em: ${escaparHtml(
                                  pokemon.atualizado_em
                                )}
                            </small>
                        `
                            : ""
                        }

                        <div class="card-actions">
                            <button class="btn btn-sm btn-warning" onclick="editarPokemon('${
                              pokemon.id
                            }')">
                                Editar
                            </button>

                            <button class="btn btn-sm btn-danger" onclick="excluirPokemon('${
                              pokemon.id
                            }')">
                                Excluir
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        `;
  });
}

function editarPokemon(id) {
  const pokemon = pokemonsCarregados.find((item) => item.id === id);

  if (!pokemon) {
    mostrarAlerta("Pokémon não encontrado na lista carregada.", "danger");
    return;
  }

  document.getElementById("id").value = pokemon.id;

  document.getElementById("pokemonBusca").value = pokemon.nome_oficial;
  document.getElementById("nome_oficial").value = pokemon.nome_oficial;
  document.getElementById("numero_pokedex").value = pokemon.numero_pokedex;
  document.getElementById("imagem_url").value = pokemon.imagem_url;
  document.getElementById("tipo_primario").value = pokemon.tipo_primario;
  document.getElementById("tipo_secundario").value =
    pokemon.tipo_secundario || "";
  document.getElementById("altura_m").value = pokemon.altura_m;
  document.getElementById("peso_kg").value = pokemon.peso_kg;
  document.getElementById("experiencia_base").value = pokemon.experiencia_base;
  document.getElementById("habilidades").value = JSON.stringify(
    pokemon.habilidades || []
  );
  document.getElementById("movimentos").value = JSON.stringify(
    pokemon.movimentos || []
  );

  document.getElementById("treinador").value = pokemon.treinador;
  document.getElementById("apelido").value = pokemon.apelido;
  document.getElementById("nivel").value = pokemon.nivel || 1;
  document.getElementById("raridade_na_turma").value =
    pokemon.raridade_na_turma || "Comum";
  document.getElementById("observacao").value = pokemon.observacao;

  atualizarPreviewImagem(pokemon.imagem_url || "");

  montarPainelApi({
    nome: pokemon.nome_oficial,
    numero: pokemon.numero_pokedex,
    tipos: [pokemon.tipo_primario, pokemon.tipo_secundario].filter(Boolean),
    altura_m: pokemon.altura_m,
    peso_kg: pokemon.peso_kg,
    experiencia_base: pokemon.experiencia_base,
    habilidades: pokemon.habilidades || [],
    movimentos: pokemon.movimentos || [],
  });

  document.getElementById("btnSalvar").innerText = "Atualizar Pokémon";

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

async function excluirPokemon(id) {
  const confirmou = confirm(
    "Deseja realmente remover este Pokémon da Pokédex?"
  );

  if (!confirmou) {
    return;
  }

  try {
    const resposta = await fetch(API_URL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });

    const dados = await lerRespostaJson(resposta);

    if (!resposta.ok) {
      throw new Error(dados.erro || "Erro ao excluir Pokémon.");
    }

    mostrarAlerta(dados.mensagem, "success");
    carregarPokemons();
  } catch (erro) {
    mostrarAlerta(erro.message, "danger");
  }
}

function limparFormulario() {
  document.getElementById("id").value = "";
  document.getElementById("formPokemon").reset();

  document.getElementById("pokemonBusca").value = "";

  document.getElementById("nivel").value = 1;
  document.getElementById("raridade_na_turma").value = "Comum";
  document.getElementById("btnSalvar").innerText = "Salvar na Pokédex";

  limparDadosOficiais();
}

function limparDadosOficiais() {
  const campos = [
    "nome_oficial",
    "numero_pokedex",
    "imagem_url",
    "tipo_primario",
    "tipo_secundario",
    "altura_m",
    "peso_kg",
    "experiencia_base",
    "habilidades",
    "movimentos",
  ];

  campos.forEach((campo) => {
    document.getElementById(campo).value = "";
  });

  document.getElementById("painelDadosApi").classList.add("d-none");
  atualizarPreviewImagem("");
}

function atualizarPreviewImagem(url) {
  const img = document.getElementById("previewImagem");
  const placeholder = document.getElementById("previewPlaceholder");

  if (url) {
    img.src = url;
    img.style.display = "block";
    placeholder.style.display = "none";
  } else {
    img.src = "";
    img.style.display = "none";
    placeholder.style.display = "flex";
  }
}

function mostrarAlerta(mensagem, tipo) {
  const alerta = document.getElementById("alerta");

  alerta.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${escaparHtml(mensagem)}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

  setTimeout(() => {
    alerta.innerHTML = "";
  }, 4500);
}

function escaparHtml(texto) {
  if (texto === null || texto === undefined) {
    return "";
  }

  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function lerRespostaJson(resposta) {
  const texto = await resposta.text();

  try {
    return JSON.parse(texto);
  } catch (erro) {
    console.error("Resposta não era JSON:", texto);

    throw new Error(
      "A API não retornou JSON válido. Verifique se existe algum echo, HTML ou warning no PHP. Resposta recebida: " +
        texto.substring(0, 200)
    );
  }
}

function normalizarNomePokemon(nome) {
  return nome.toLowerCase().trim().replaceAll(" ", "-");
}

function converterTipo(tipoIngles) {
  const tipos = {
    normal: "Normal",
    fire: "Fogo",
    water: "Água",
    grass: "Grama",
    electric: "Elétrico",
    ice: "Gelo",
    fighting: "Lutador",
    poison: "Venenoso",
    ground: "Terra",
    flying: "Voador",
    psychic: "Psíquico",
    bug: "Inseto",
    rock: "Pedra",
    ghost: "Fantasma",
    dragon: "Dragão",
    dark: "Sombrio",
    steel: "Aço",
    fairy: "Fada",
  };

  return tipos[tipoIngles] || "Normal";
}

function formatarNome(nome) {
  if (!nome) {
    return "";
  }

  return String(nome)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function classeTipo(tipo) {
  return `type-${tipo || "Normal"}`;
}

function lerArrayCampo(idCampo) {
  const valor = document.getElementById(idCampo).value;

  if (!valor) {
    return [];
  }

  try {
    return JSON.parse(valor);
  } catch (erro) {
    return [];
  }
}

carregarPokemons();
