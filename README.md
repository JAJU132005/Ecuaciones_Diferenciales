# El aprendizaje como ecuación diferencial — clase interactiva

Página web de una sola página (sin framework, sin build) que explica, con simuladores
en vivo, cómo el entrenamiento de una red neuronal es una ecuación diferencial.

```
.
├── render.yaml          # Blueprint para desplegar en Render (sitio estático)
└── public/              # Archivos servidos
    ├── index.html       # estructura (HTML)
    ├── styles.css       # estilos (CSS)
    └── script.js        # lógica y simuladores (JS)
```

## Ver en local
No requiere instalación. Basta abrir `public/index.html` en el navegador.
Para evitar restricciones de origen, puedes servirlo con cualquier servidor estático:

```bash
cd public
python3 -m http.server 8080      # luego abre http://localhost:8080
```

## Desplegar en Render

### Opción A — Blueprint (recomendada, usa render.yaml)
1. Sube esta carpeta a un repositorio de GitHub / GitLab / Bitbucket.
2. En el panel de Render: **New ▸ Blueprint** y selecciona el repo.
3. Render detecta `render.yaml` y crea el sitio estático automáticamente.

### Opción B — Manual desde el panel
1. Sube el repo a GitHub/GitLab/Bitbucket.
2. **New ▸ Static Site** y conecta el repo.
3. Configura:
   - **Build Command:** *(vacío — no hay build)*
   - **Publish Directory:** `public`
4. **Create Static Site.**

Cada cambio que subas a la rama desplegada vuelve a publicar el sitio. Render sirve
sobre un CDN global con HTTPS automático y permite dominios propios.

## Atajos de teclado
`→ / espacio` siguiente · `←` anterior · `1–6` ir a diapositiva ·
`O` resumen · `T` tema claro/oscuro · `F` pantalla completa · `?` ayuda · `Esc` cerrar.
