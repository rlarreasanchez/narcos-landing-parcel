<p align="center">
  <img src="src/assets/images/hero.jpg" alt="Narcos" width="100%" />
</p>

<h1 align="center">Narcos · Web de fans</h1>

<p align="center">
  Landing page de fans de la serie <strong>Narcos</strong>, creada para la PEC 1 de <em>Herramientas HTML y CSS II</em> (UOC).
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/Sass-CC6699?logo=sass&logoColor=white" alt="Sass" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Parcel-21374B?logo=parcel&logoColor=white" alt="Parcel" />
</p>

## Secciones

Página única con navegación por anclas:

1. **Hero**: imagen a pantalla completa, con recorte distinto en móvil, y llamada a la acción.
2. **Sinopsis**: resumen de la serie y ficha técnica.
3. **Temporadas**: tarjetas de las tres temporadas.
4. **Importancia histórica**: línea de tiempo con los hechos reales.
5. **Reparto principal**: tarjetas con actor y personaje.
6. **Tráiler**: vídeo de YouTube (`youtube-nocookie`) incrustado de forma responsive.
7. **Cita** destacada.
8. **Por qué verla**: cinco motivos con iconos.
9. **Footer**: enlaces a las secciones y recursos externos.

## Funcionalidades

- **Diseño responsive mobile-first**, con breakpoints `sm`, `md`, `lg` y `xl` gestionados por el mixin `mq()`.
- **Navbar fija** que cambia de estilo al hacer scroll y se convierte en un menú hamburguesa en móvil. El menú se cierra con `Escape` o al pulsar un enlace.
- **Animaciones al hacer scroll** con [AOS](https://michalsnik.github.io/aos/), desactivadas si el usuario tiene activado `prefers-reduced-motion`.
- **Imágenes optimizadas**: WebP generado con `sharp`, `srcset`/`sizes` para servir el tamaño adecuado y `loading="lazy"` en las que quedan fuera de la primera pantalla.
- **Fuentes autoalojadas** (Bebas Neue e Inter vía Fontsource), cargando solo el subconjunto latino y los pesos que se usan.
- **Iconos** de Font Awesome.

## Accesibilidad

- HTML semántico (`header`, `nav`, `main`, `section`, `article`, `blockquote`, `dl`) y secciones enlazadas a su título con `aria-labelledby`.
- Enlace para saltar al contenido (_skip link_) y un anillo de foco visible.
- Menú móvil con `aria-expanded` y etiqueta accesible.
- Paleta oscura con contraste WCAG 2.1 AA y abreviaturas marcadas con `<abbr>`.
- Efectos `hover` solo en dispositivos con puntero.

## Estructura

```
src/
├── index.html              # Esqueleto de la página; incluye los parciales
├── views/                  # Una sección por parcial (posthtml-include)
└── assets/
    ├── images/             # Imágenes originales (sharp genera las variantes)
    ├── favicon/
    ├── scripts/
    │   ├── main.js         # Dependencias, AOS e inicialización
    │   └── navbar.js       # Scroll y menú móvil
    └── styles/
        ├── main.scss       # Solo importa parciales
        ├── abstracts/      # Variables, funciones y mixins
        ├── base/           # Reset, tipografía y utilidades
        ├── layout/         # Contenedor y secciones
        └── components/     # Un parcial por componente
```

## Criterios

- **Sass modular** con `@use` y una organización inspirada en el patrón 7-1, simplificada en `abstracts`, `base`, `layout` y `components`.
- **BEM** para nombrar las clases (`bloque__elemento--modificador`), validado con `stylelint-selector-bem-pattern`.
- **Design tokens** en `_variables.scss` (colores, fuentes, breakpoints, capas de `z-index` y espaciado), a los que se accede mediante funciones como `color()`.
- **HTML dividido en parciales** para que cada sección se pueda mantener por separado.
- **JavaScript mínimo**, como mejora progresiva: la clase `no-js` se sustituye por `js` al cargar, y la página sigue funcionando sin scripts.

## Uso

Requiere Node.js >= 18. Proyecto basado en [UOC Boilerplate 3.x](https://github.com/uoc-advanced-html-css/uoc-boilerplate) (Parcel v2).

```bash
npm install       # instalar dependencias
npm run dev       # servidor de desarrollo en http://localhost:8123
npm run build     # build de producción en dist/
npm run lint:css  # revisar los estilos con Stylelint
```

## Autor

**Rafael Larrea**: PEC 1 de _Herramientas HTML y CSS II_, Máster Universitario en Desarrollo de Sitios y Aplicaciones Web (UOC).

## Licencia

El código se distribuye bajo licencia [MIT](LICENSE), igual que el UOC Boilerplate en el que se basa.

_Narcos_ y todas sus imágenes y marcas pertenecen a Netflix y a sus respectivos titulares. Se usan aquí solo con fines educativos, en un proyecto sin ánimo de lucro.
