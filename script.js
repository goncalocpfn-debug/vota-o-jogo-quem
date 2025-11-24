// =========================
// CONFIGURAÇÃO DA VOTAÇÃO
// =========================
//
// Para alterar a pergunta ou os nomes,
// basta mudar este objeto:

const pollConfig = {
  question: "Quem é o mais provável de apanhar sida",
  options: ["antónio", "viegas", "carlos", "neto", "salvador","francisco","judeu"],
  // Muda este "id" se quiseres começar uma votação nova
  // e apagar votos antigos deste navegador
  pollId: "votacao-equipa-v1"
};

// =========================
// LÓGICA DA APLICAÇÃO
// =========================

const questionEl = document.getElementById("poll-question");
const optionsEl = document.getElementById("poll-options");
const messageEl = document.getElementById("vote-message");
const resultsEl = document.getElementById("poll-results");

const STORAGE_VOTE_KEY = `poll_vote_${pollConfig.pollId}`;
const STORAGE_RESULTS_KEY = `poll_results_${pollConfig.pollId}`;

// Ler resultados guardados ou criar de raiz
function loadResults() {
  const saved = localStorage.getItem(STORAGE_RESULTS_KEY);
  if (saved) {
    try {
      const obj = JSON.parse(saved);
      // Garantir que todas as opções existem
      pollConfig.options.forEach((opt) => {
        if (typeof obj[opt] !== "number") obj[opt] = 0;
      });
      return obj;
    } catch (e) {
      console.warn("Erro a ler resultados, a reiniciar.", e);
    }
  }

  const initial = {};
  pollConfig.options.forEach((opt) => {
    initial[opt] = 0;
  });
  return initial;
}

function saveResults(results) {
  localStorage.setItem(STORAGE_RESULTS_KEY, JSON.stringify(results));
}

function loadUserVote() {
  return localStorage.getItem(STORAGE_VOTE_KEY);
}

function saveUserVote(option) {
  localStorage.setItem(STORAGE_VOTE_KEY, option);
}

// Renderizar pergunta e botões
function renderPoll() {
  questionEl.textContent = pollConfig.question;

  optionsEl.innerHTML = "";

  const userVote = loadUserVote();

  pollConfig.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = option;
    btn.dataset.option = option;

    if (userVote) {
      btn.disabled = true;
      if (userVote === option) {
        btn.classList.add("selected");
      }
    }

    btn.addEventListener("click", () => {
      handleVote(option);
    });

    optionsEl.appendChild(btn);
  });

  if (userVote) {
    messageEl.textContent = `Já votaste em: ${userVote}`;
    messageEl.className = "message info";
  } else {
    messageEl.textContent = "";
    messageEl.className = "message";
  }
}

// Atualizar área de resultados
function renderResults(results) {
  resultsEl.innerHTML = "";

  const totalVotes = Object.values(results).reduce((sum, v) => sum + v, 0);

  pollConfig.options.forEach((option) => {
    const count = results[option] || 0;
    const percent = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);

    const row = document.createElement("div");
    row.className = "result-row";

    const header = document.createElement("div");
    header.className = "result-header";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = option;

    const countSpan = document.createElement("span");
    countSpan.textContent = `${count} voto(s) · ${percent}%`;

    header.appendChild(nameSpan);
    header.appendChild(countSpan);

    const barWrapper = document.createElement("div");
    barWrapper.className = "result-bar-wrapper";

    const bar = document.createElement("div");
    bar.className = "result-bar";
    bar.style.width = `${percent}%`;

    barWrapper.appendChild(bar);

    row.appendChild(header);
    row.appendChild(barWrapper);

    resultsEl.appendChild(row);
  });
}

// Quando alguém vota
function handleVote(option) {
  const userVote = loadUserVote();
  if (userVote) {
    // Já tinha votado
    messageEl.textContent = `Já tinhas votado em: ${userVote} (não podes votar outra vez neste navegador)`;
    messageEl.className = "message info";
    return;
  }

  let results = loadResults();
  if (typeof results[option] !== "number") {
    results[option] = 0;
  }

  results[option] += 1;
  saveResults(results);
  saveUserVote(option);

  // Atualizar UI
  renderPoll();
  renderResults(results);

  messageEl.textContent = `Voto registado em: ${option}`;
  messageEl.className = "message success";
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  const results = loadResults();
  renderPoll();
  renderResults(results);
});
