# Minecraft-starter (minimal)

Proyecto sencillo de inicio que muestra un nivel de bloques en rejilla, físicas básicas con `cannon-es`, interacción (colocar, eliminar, agarrar) y una UI mínima de inventario.

Requisitos
- Navegador moderno con soporte ES modules
- (Opcional) Python o un servidor estático para servir la carpeta

Cómo ejecutar
1. Abrir una terminal en la carpeta `minecraft-starter`.
2. Servir con Python (ejemplo):

```powershell
python -m http.server 8000
```

3. Abrir `http://localhost:8000` en tu navegador.

Controles
- Click y arrastrar: mover un bloque
- R: colocar un bloque en la posición actual del hover
- X: eliminar el bloque apuntado
- G: mostrar/ocultar rejilla

Siguientes mejoras recomendadas
- Snap-to-grid con animación
- Texturas PBR y environment maps
- Mecánica de inventario persistente
- Guardado/carga de niveles

Licencia: MIT
# Minecraft-starter

Pequeño proyecto starter que usa Three.js y cannon-es para físicas.

Cómo usar:

1. Servir la carpeta con un servidor estático (ej: `npx serve` o `python -m http.server` desde la carpeta `minecraft-starter`).
2. Abrir `http://localhost:5000` (o el puerto que el servidor devuelva).

Controles:
- WASD/Orbit para mover la cámara (OrbitControls activo)
- Click para agarrar/soltar bloques
- R para colocar un bloque en frente de la cámara
