const url = "https://raw.githubusercontent.com/CesarMCuellarCha/apis/main/SENA-CTPI.matriculados.json";

function login() {
  const usuario = document.getElementById("usuario").value.trim();
  const password = document.getElementById("password").value;
  if (!usuario || !password) {
    alert("Por favor ingresa usuario y contraseña.");
    return;
  }
  if (password === "adso3064975") {
    localStorage.setItem("usuario", usuario);
    const remember = document.getElementById("recordarme")?.checked;
    if (remember) {
      localStorage.setItem("remember", "1");
    } else {
      localStorage.removeItem("remember");
    }
    document.getElementById("nombreUsuario").textContent = usuario;
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
    const navU = document.getElementById("navbarUser");
    const navB = document.getElementById("btnLogout");
    if (navU) navU.classList.remove("d-none");
    if (navB) navB.classList.remove("d-none");
    cargarFichas();
  } else {
    alert("Usuario o contraseña incorrectos. Inténtalo de nuevo.");
  }
}

function logout() {
  const remember = localStorage.getItem("remember") === "1";
  const user = localStorage.getItem("usuario");
  localStorage.clear();
  if (remember && user) {
    localStorage.setItem("remember", "1");
    localStorage.setItem("usuario", user);
  }
  document.getElementById("login").style.display = "block";
  document.getElementById("app").style.display = "none";
  const navU = document.getElementById("navbarUser");
  const navB = document.getElementById("btnLogout");
  if (navU) navU.classList.add("d-none");
  if (navB) navB.classList.add("d-none");
}

async function cargarFichas() {
  const input = document.getElementById("selectFicha");
  const lista = document.getElementById("listaFichas");
  if (input) {
    input.value = "";
    input.placeholder = "Cargando fichas…";
    input.disabled = true;
  }
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.json();
    const datos = Array.isArray(raw)
      ? raw.map((r) => ({
          codigoFicha: r.FICHA,
          nombrePrograma: r.PROGRAMA,
          nivelFormacion: r.NIVEL_DE_FORMACION,
          estadoFicha: r.ESTADO_FICHA,
          tipoDocumento: r.TIPO_DOCUMENTO,
          numeroDocumento: r.NUMERO_DOCUMENTO,
          nombre: r.NOMBRE,
          primerApellido: r.PRIMER_APELLIDO,
          segundoApellido: r.SEGUNDO_APELLIDO,
          estadoAprendiz: r.ESTADO_APRENDIZ,
        }))
      : [];
    const fichas = [...new Set(datos.map((a) => a.codigoFicha).filter(Boolean))];
    window.datos = datos;
    if (lista) {
      lista.innerHTML = "";
      fichas.forEach((f) => {
        const opt = document.createElement("option");
        opt.value = f;
        lista.appendChild(opt);
      });
    }
    if (input) {
      input.disabled = false;
      input.placeholder = fichas.length ? "Escribe o selecciona una ficha" : "No hay fichas disponibles";
    }
  } catch (err) {
    console.error("Error cargando fichas:", err);
    alert("No pudimos cargar las fichas. Revisa tu conexión e inténtalo nuevamente.");
    if (input) {
      input.disabled = false;
      input.placeholder = "Error al cargar fichas";
    }
  }
}

function mostrarFicha() {
  const inputEl = document.getElementById("selectFicha");
  const codigo = inputEl ? inputEl.value.trim() : "";
  if (!codigo) {
    alert("Por favor selecciona o escribe una ficha.");
    return;
  }
  const aprendices = Array.isArray(window.datos)
    ? window.datos.filter((a) => String(a.codigoFicha) === String(codigo))
    : [];
  const tabla = document.getElementById("tablaAprendices");
  const conteo = document.getElementById("conteoAprendices");
  if (conteo) conteo.textContent = aprendices.length;
  if (aprendices.length > 0) {
    localStorage.setItem("codigoFicha", codigo);
    localStorage.setItem("nombrePrograma", aprendices[0].nombrePrograma);
    localStorage.setItem("nivelFormacion", aprendices[0].nivelFormacion);
    localStorage.setItem("estadoFicha", aprendices[0].estadoFicha);
    document.getElementById("nombrePrograma").value = aprendices[0].nombrePrograma;
    tabla.innerHTML = `
      <thead class="table-dark">
        <tr>
          <th>Tipo de documento</th>
          <th>Número de documento</th>
          <th>Nombre</th>
          <th>Primer apellido</th>
          <th>Segundo apellido</th>
          <th>Estado del aprendiz</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    const tbody = tabla.querySelector("tbody");
    const estadoClase = (estado) => {
      const key = String(estado || "").toLowerCase();
      if (key.includes("cancel")) return "estado estado-cancelado";
      if (key.includes("retiro")) return "estado estado-retiro";
      return "estado estado-formacion";
    };

    aprendices.forEach((a) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${a.tipoDocumento}</td>
        <td>${a.numeroDocumento}</td>
        <td>${a.nombre}</td>
        <td>${a.primerApellido}</td>
        <td>${a.segundoApellido}</td>
        <td><span class="${estadoClase(a.estadoAprendiz)}">${a.estadoAprendiz}</span></td>
      `;
      if (a.estadoAprendiz === "Retiro Voluntario") {
        row.classList.add("retiro");
      }
      tbody.appendChild(row);
    });
  } else {
    tabla.innerHTML = `
      <thead class="table-dark">
        <tr>
          <th>Tipo de documento</th>
          <th>Número de documento</th>
          <th>Nombre</th>
          <th>Primer apellido</th>
          <th>Segundo apellido</th>
          <th>Estado del aprendiz</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="6" class="text-center">No hay aprendices para esta ficha.</td>
        </tr>
      </tbody>
    `;
  }
}

function togglePassword() {
  const input = document.getElementById("password");
  const btn = document.getElementById("verClave") || document.querySelector('button[onclick="togglePassword()"]');
  if (!input) return;
  const isPass = input.type === "password";
  input.type = isPass ? "text" : "password";
  if (btn) btn.textContent = isPass ? "Ocultar" : "Ver";
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("login");
  if (root) {
    root.innerHTML = `
      <div class="row justify-content-center">
        <div class="col-lg-8 col-xl-7">
          <div class="card card-elevated overflow-hidden">
            <div class="row g-0">
              <div class="col-md-6 bg-primary text-white d-flex align-items-center p-4">
                <div>
                  <h3 class="fw-semibold mb-2">Bienvenido</h3>
                  <p class="mb-0 opacity-75">Ingresa para consultar fichas y aprendices.</p>
                </div>
              </div>
              <div class="col-md-6 p-4">
                <h5 class="mb-3">Iniciar sesión</h5>
                <div class="mb-3">
                  <label class="form-label">Usuario</label>
                  <input type="text" id="usuario" class="form-control" placeholder="Tu usuario">
                </div>
                <div class="mb-3">
                  <label class="form-label">Contraseña</label>
                  <div class="input-group">
                    <input type="password" id="password" class="form-control" placeholder="••••••••">
                    <button class="btn btn-outline-secondary" type="button" id="verClave">Ver</button>
                  </div>
                </div>
                <div class="form-check mb-3">
                  <input class="form-check-input" type="checkbox" id="recordarme">
                  <label class="form-check-label" for="recordarme">Recordarme</label>
                </div>
                <button class="btn btn-primary w-100" id="btnIngresar">Ingresar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const btn = document.getElementById("btnIngresar");
    const pass = document.getElementById("password");
    const ver = document.getElementById("verClave");
    if (btn) btn.addEventListener("click", login);
    if (pass) pass.addEventListener("keydown", (e) => { if (e.key === "Enter") login(); });
    if (ver) ver.addEventListener("click", togglePassword);

    const remembered = localStorage.getItem("remember") === "1";
    const user = localStorage.getItem("usuario") || "";
    if (user && document.getElementById("usuario")) {
      document.getElementById("usuario").value = user;
    }
    const chk = document.getElementById("recordarme");
    if (chk) chk.checked = remembered;
  }
});
