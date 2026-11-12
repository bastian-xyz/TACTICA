# TÁCTICA

RTS táctico multiplataforma: celular en vertical y computador en horizontal. 1v1 contra la CPU o con un amigo por enlace, sin cuenta.

**Jugar:** https://bastian-xyz.github.io/TACTICA/

Autor: Bastián Jiménez Molina.

## Estructura

```
src/index.html        plantilla de la página
src/body.html         HUD, barra, mapa y menús
src/css/game.css      estilos (vertical, horizontal y tema de interfaz)
src/js/NN-*.js        el juego por secciones, en orden (comparten ámbito: el build las une en una sola función)
src/net/sala-web.js   1v1 por enlace directo entre navegadores (WebRTC)
src/net/sala-claude.js  1v1 en la versión publicada como artefacto
src/changelog.json    registro de cambios que se ve dentro del juego
tools/build.mjs       arma dist/web y dist/claude
tools/bump.mjs        sube la versión y anota los cambios
```

## Uso

```
node tools/build.mjs                         # dist/web/index.html y dist/claude/index.html
node tools/bump.mjs patch "Qué cambió" "…"   # o minor / major / x.y.z
git commit -am "vX.Y.Z" && git tag vX.Y.Z && git push --follow-tags
```

No necesita dependencias: solo Node 20 o superior. `dist/web/index.html` se puede abrir directo en el navegador.

- Cada push a `main` publica la web (Settings → Pages → Source: **GitHub Actions**).
- Cada etiqueta `vX.Y.Z` crea una versión con los dos html adjuntos.
- La web revisa `version.json` y avisa cuando hay una versión nueva.

## Controles

| | Celular | Computador |
|---|---|---|
| Cámara | arrastrar · mapa de navegación | WASD o flechas · arrastrar · mapa |
| Zoom | pellizcar | rueda · Q / E |
| Cartas | tocar | 1–8 tropas · Z X C V B N edificios |
| Selección múltiple | mantener apretado y arrastrar | mantener el clic y arrastrar |
| Soltar selección | ✕ del panel | clic derecho · Esc |
| Base | — | Espacio |

El modo horizontal se activa solo en pantallas anchas; se puede forzar en Configuración → Pantalla.
