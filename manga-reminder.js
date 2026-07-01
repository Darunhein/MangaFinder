const form = document.getElementById("mangaForm");
const recordsBody = document.getElementById("recordsBody");
const tableWrap = document.getElementById("tableWrap");
const emptyState = document.getElementById("emptyState");
const recordCount = document.getElementById("recordCount");

const validators = {
  autor(value) {
    if (!value.trim()) return "El nombre del autor es obligatorio.";
    if (value.trim().length < 2) return "Mínimo 2 caracteres.";
    if (value.trim().length > 50) return "Máximo 50 caracteres.";
    if (!/^[a-zA-Z\s]+$/.test(value.trim())) return "El nombre del autor solo puede contener letras y espacios.";
    if (/^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/.test(value.trim())) return "El nombre del autor debe empezar con una letra mayúscula y las siguientes con minúsculas.";
    return "";
  },

  numero(value) {
    if (!value.trim()) return "Ingresa el número a buscar.";
    const pattern = /^\d+(\.\d+)?$/;
    if (!pattern.test(value.trim())) {
      return "Usa un número válido (ej. 12 o 12.5).";
    }
    const num = Number(value);
    if (num <= 0) return "El número debe ser mayor que 0.";
    if (num > 99999) return "El número es demasiado alto.";
    return "";
  },

  tipo() {
    if (!form.querySelector('input[name="tipo"]:checked')) {
      return "Selecciona el tipo de número.";
    }
    return "";
  },

  serie(value) {
    if (!value) return "Selecciona una serie de manga, usa la opcion de 'Otra serie' si la que buscasno está en la lista.";
    return "";
  },

  idioma(value) {
    if (!value.trim()) return "El idioma del manga es obligatorio.";
    if (value.trim().length < 2) return "Escribe al menos 2 caracteres.";
    if (value.trim().length > 50) return "Máximo 50 caracteres.";
    if (!/^[a-zA-Z\s]+$/.test(value.trim())) return "El idioma del manga solo puede contener letras y espacios.";
    if(/^[A-Z][a-z]+$/.test(value.trim())) return "El idioma del manga debe empezar con una letra mayúscula y las siguientes con minúsculas.";
    return "";
  },

  terminos() {
    if (!document.getElementById("terminos").checked) {
      return "Debes confirmar que la información es correcta.";
    }
    return "";
  },
};

function showError(fieldName, message) {
  const errorEl = document.querySelector(`[data-error="${fieldName}"]`);
  if (errorEl) errorEl.textContent = message;

  if (fieldName === "tipo") {
    document.getElementById("tipoGroup").classList.toggle("invalid", Boolean(message));
    return;
  }

  if (fieldName === "terminos") {
    document.getElementById("terminos").classList.toggle("invalid", Boolean(message));
    return;
  }

  const input = document.getElementById(fieldName);
  if (input) input.classList.toggle("invalid", Boolean(message));
}

function clearErrors() {
  Object.keys(validators).forEach((field) => showError(field, ""));
}

function validateForm() {
  let isValid = true;

  const values = {
    autor: document.getElementById("autor").value,
    numero: document.getElementById("numero").value,
    serie: document.getElementById("serie").value,
    idioma: document.getElementById("idioma").value,
  };

  Object.keys(validators).forEach((field) => {
    const error = validators[field](values[field] ?? "");
    showError(field, error);
    if (error) isValid = false;
  });

  return isValid;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function buildReference(serie, tipo, numero) {
  const prefix = {
    Capítulo: "CH",
    Volumen: "VOL",
    "One-shot": "OS",
  }[tipo];

  const slug = serie
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${slug}-${prefix}-${numero}`;
}

function addRecord(data) {
  emptyState.hidden = true;
  tableWrap.hidden = false;

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${escapeHtml(data.autor)}</td>
    <td>${escapeHtml(data.serie)}</td>
    <td><span class="tag">${escapeHtml(data.tipo)}</span></td>
    <td>${escapeHtml(data.numero)}</td>
    <td><span class="ref-code">${escapeHtml(data.referencia)}</span></td>
    <td>${escapeHtml(data.idioma)}</td>
  `;

  recordsBody.prepend(row);
  recordCount.textContent = String(recordsBody.children.length);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrors();

  if (!validateForm()) return;

  const tipo = form.querySelector('input[name="tipo"]:checked').value;
  const serie = document.getElementById("serie").value;
  const numero = document.getElementById("numero").value.trim();

  const data = {
    autor: document.getElementById("autor").value.trim(),
    serie,
    tipo,
    numero,
    idioma: document.getElementById("idioma").value.trim(),
    referencia: buildReference(serie, tipo, numero),
  };  

  form.reset();
  clearErrors();
  addRecord(data);
});

form.querySelectorAll("input[type='text'], textarea, select").forEach((element) => {
  element.addEventListener("input", () => {
    const field = element.name;
    if (!validators[field]) return;
    showError(field, validators[field](element.value));
  });
});

form.querySelectorAll('input[name="tipo"]').forEach((radio) => {
  radio.addEventListener("change", () => showError("tipo", ""));
});

document.getElementById("terminos").addEventListener("change", () => {
  showError("terminos", validators.terminos());
});
