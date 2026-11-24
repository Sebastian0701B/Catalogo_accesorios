// Tu número de WhatsApp (57 + número, sin + ni espacios)
const WHATSAPP = "573053685137";

const productos = [
  // ARETES
  { nombre: "Arete Especial ", categoria: "aretes", imagen: "img/aretes/Arete_especial1.jpeg" },
  { nombre: "Arete Especial ", categoria: "aretes", imagen: "img/aretes/Arete_especial2.jpeg" },
  { nombre: "Arete Geométrico ", categoria: "aretes", imagen: "img/aretes/Arete_geometrico1.jpeg" },
  { nombre: "Arete Geométrico ", categoria: "aretes", imagen: "img/aretes/Arete_geometrico2.jpeg" },
  { nombre: "Arete Topitos", categoria: "aretes", imagen: "img/aretes/Arete_topitos.jpeg" },

  // CAMÁNDULAS
  { nombre: "Camándula Jesús", categoria: "camandulas", imagen: "img/camandulas/camandula_jesus.jpeg" },
  { nombre: "Camándula Virgen", categoria: "camandulas", imagen: "img/camandulas/Virgen.jpeg" }
];

const contenedor = document.getElementById("productos");
const buscador = document.getElementById("buscador");
const botones = document.querySelectorAll(".filtro");
let categoriaActual = "todos";

let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
let combinacion = JSON.parse(localStorage.getItem("combinacion")) || { aretes: null, camandulas: null };

function buscarProducto(imagen) {
  return productos.find(p => p.imagen === imagen);
}

/* ---------- CATÁLOGO ---------- */
function mostrarProductos() {
  const texto = buscador.value.toLowerCase();

  const filtrados = productos.filter(p => {
    const coincideCategoria =
      categoriaActual === "todos" ||
      (categoriaActual === "favoritos" && favoritos.includes(p.imagen)) ||
      p.categoria === categoriaActual;
    return coincideCategoria && p.nombre.toLowerCase().includes(texto);
  });

  if (filtrados.length === 0) {
    contenedor.innerHTML = categoriaActual === "favoritos"
      ? "<p>Aún no tienes favoritos. Toca el ♡ en los que te gusten 💕</p>"
      : "<p>Muy pronto tendremos accesorios aquí 💕</p>";
    return;
  }

  contenedor.innerHTML = filtrados.map(p => {
    const esFav = favoritos.includes(p.imagen);
    return `
      <div class="tarjeta">
        <button class="corazon ${esFav ? "activo" : ""}" onclick="toggleFavorito('${p.imagen}')">
          ${esFav ? "♥" : "♡"}
        </button>
        <img src="${p.imagen}" alt="${p.nombre}" onclick="abrirZoom('${p.imagen}')">
        <div class="tarjeta-info">
          <h3>${p.nombre}</h3>
          <button class="btn" onclick="agregarACombinacion('${p.imagen}')">+ Combinar</button>
        </div>
      </div>
    `;
  }).join("");
}

/* ---------- FAVORITOS ---------- */
function toggleFavorito(imagen) {
  if (favoritos.includes(imagen)) {
    favoritos = favoritos.filter(f => f !== imagen);
  } else {
    favoritos.push(imagen);
  }
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  actualizarContador();
  mostrarProductos();
}

function actualizarContador() {
  const total = favoritos.filter(f => buscarProducto(f)).length;
  document.getElementById("contadorFav").textContent = total;
}

/* ---------- COMBINACIÓN ---------- */
function agregarACombinacion(imagen) {
  const p = buscarProducto(imagen);
  combinacion[p.categoria] = imagen;
  guardarCombinacion();
  document.getElementById("combinacion").scrollIntoView({ behavior: "smooth" });
}

function quitarDeCombinacion(categoria) {
  combinacion[categoria] = null;
  guardarCombinacion();
}

function guardarCombinacion() {
  localStorage.setItem("combinacion", JSON.stringify(combinacion));
  mostrarCombinacion();
}

function mostrarCombinacion() {
  const textos = { aretes: "Elige unos aretes", camandulas: "Elige una camándula" };
  const elegidos = [];

  ["aretes", "camandulas"].forEach(cat => {
    const slot = document.getElementById("slot-" + cat);
    const p = combinacion[cat] ? buscarProducto(combinacion[cat]) : null;

    if (p) {
      elegidos.push(p.nombre);
      slot.classList.add("lleno");
      slot.innerHTML = `
        <button class="quitar" onclick="quitarDeCombinacion('${cat}')">✕</button>
        <img src="${p.imagen}" alt="${p.nombre}" onclick="abrirZoom('${p.imagen}')">
        <p>${p.nombre}</p>
      `;
    } else {
      slot.classList.remove("lleno");
      slot.innerHTML = `<span>${textos[cat]}</span>`;
    }
  });

  const enviar = document.getElementById("enviarCombo");
  if (elegidos.length > 0) {
    const mensaje = "Hola, me interesa esta combinación: " + elegidos.join(" + ");
    enviar.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    enviar.classList.remove("desactivado");
  } else {
    enviar.removeAttribute("href");
    enviar.classList.add("desactivado");
  }
}

document.getElementById("limpiarCombo").addEventListener("click", () => {
  combinacion = { aretes: null, camandulas: null };
  guardarCombinacion();
});

/* ---------- ZOOM ---------- */
const visor = document.getElementById("visor");
const visorImg = document.getElementById("visorImg");
const visorNombre = document.getElementById("visorNombre");

function abrirZoom(imagen) {
  const p = buscarProducto(imagen);
  visorImg.src = p.imagen;
  visorImg.alt = p.nombre;
  visorNombre.textContent = p.nombre;
  visorImg.classList.remove("ampliada");
  visor.classList.add("abierto");
  document.body.style.overflow = "hidden";
}

function cerrarZoom() {
  visor.classList.remove("abierto");
  document.body.style.overflow = "";
}

function moverZoom(e) {
  const rect = visorImg.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  visorImg.style.transformOrigin = `${x}% ${y}%`;
}

visorImg.addEventListener("click", e => {
  moverZoom(e);
  visorImg.classList.toggle("ampliada");
});

visorImg.addEventListener("mousemove", e => {
  if (visorImg.classList.contains("ampliada")) moverZoom(e);
});

document.getElementById("cerrarVisor").addEventListener("click", cerrarZoom);
visor.addEventListener("click", e => {
  if (e.target === visor) cerrarZoom();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") cerrarZoom();
});

/* ---------- FILTROS Y BUSCADOR ---------- */
botones.forEach(boton => {
  boton.addEventListener("click", () => {
    botones.forEach(b => b.classList.remove("activo"));
    boton.classList.add("activo");
    categoriaActual = boton.dataset.categoria;
    mostrarProductos();
  });
});

buscador.addEventListener("input", mostrarProductos);

// Inicio
actualizarContador();
mostrarProductos();
mostrarCombinacion();