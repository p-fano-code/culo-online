# Culo Online — Arquitectura

## 1. Visión general

Monorepo con dos aplicaciones independientes que se comunican por WebSockets:

```
culo-online/
├── client/   # React (Vite + TypeScript) — UI, animaciones, cliente de socket
├── server/   # Node.js (TypeScript) — estado autoritativo del juego, salas, matchmaking por código
└── docs/
```

El servidor es la única fuente de verdad. El cliente no decide si una jugada es legal ni conoce las cartas de los rivales ni el resto del mazo: únicamente renderiza lo que el servidor le envía. Este diseño evita las trampas más obvias (ver cartas ajenas, jugar cartas que no se tienen) sin necesidad de lógica anti-cheat adicional.

## 2. Elección de stack en el backend: Node.js

El cuello de botella de este proyecto es la coordinación de eventos en tiempo real (turnos, salas, reconexiones), no el cómputo pesado. Socket.io ofrece el ecosistema más maduro sobre Node para este caso: gestión de salas integrada, reconexión automática y fallback a long-polling cuando WebSocket no está disponible.

Go ofrecería mejor rendimiento bruto, a costa de más código para resolver lo mismo (gorilla/websocket más un sistema propio de salas). Esa opción se revalúa si el proyecto llega a necesitar miles de partidas concurrentes por instancia; para el alcance actual, Node.js es la vía de menor fricción.

## 3. Modelo de dominio

```
Player
  id            string (uuid, por conexión de socket)
  name          string
  roomId        string
  hand          Card[]          // visible solo para el propio jugador
  connected     boolean
  isHost        boolean

Room
  code          string (6 caracteres, ej. "K3F9QX")
  hostId        string
  players       Player[]        // 2-8 jugadores
  state         'lobby' | 'playing' | 'finished'
  game          GameState | null

Card
  suit          'oros' | 'copas' | 'espadas' | 'bastos'   // baraja por confirmar
  rank          number

GameState
  deck          Card[]          // no se envía al cliente
  pile          Card[]          // cartas jugadas visibles en mesa
  turnOrder     string[]        // playerIds
  currentTurn   string
  lastPlay      { playerId, cards } | null
  finishedOrder string[]        // orden en que los jugadores se quedan sin cartas
  ranking       { presidente, vicepresidente, ..., culo }
```

**Pendiente de definición**: tipo de baraja (española de 40 o francesa de 52), número de jugadores admitido, y el reglamento exacto de "Culo" a implementar (existen variantes regionales en aspectos como jugar cuatro cartas iguales, cartas que "queman" la mesa, o si se puede jugar sobre un pase). Este bloque condiciona directamente la máquina de estados del servidor y debe cerrarse en un documento de reglas (`docs/REGLAS.md`) antes de implementar la lógica de juego.

## 4. Comunicación en tiempo real

Socket.io, usando su funcionalidad nativa de *rooms* como namespace lógico por partida.

Eventos cliente → servidor:
- `room:create` `{ playerName }` → responde con `{ roomCode }`
- `room:join` `{ roomCode, playerName }`
- `room:start` (solo host)
- `game:play` `{ cards: Card[] }`
- `game:pass`
- `player:reconnect` `{ roomCode, playerId }` (token guardado en localStorage del cliente)

Eventos servidor → cliente:
- `room:update` (lista de jugadores, host, estado de sala) — broadcast a todos
- `game:state` (vista filtrada del estado: mano completa propia, de los rivales solo el número de cartas) — envío individual por jugador
- `game:turnChanged`
- `game:invalidMove` `{ reason }` — solo al jugador que intentó la jugada
- `game:finished` `{ ranking }`

Regla de diseño: el servidor no realiza broadcasts de estado completo (`io.to(room).emit(fullState)`) con las manos de todos los jugadores. Cada jugador recibe un payload distinto (`socket.emit` individual) para evitar que las cartas ajenas queden expuestas mediante inspección del tráfico de red.

## 5. Reconexión

Las desconexiones (caída de wifi, cierre accidental de la app) son frecuentes en partidas de cartas y se contemplan como parte del diseño base, no como funcionalidad añadida posteriormente:
- Al crear o unirse a una sala, el cliente guarda `{ roomCode, playerId, secretToken }` en `localStorage`.
- Ante una desconexión de socket, el servidor no expulsa al jugador de inmediato: marca `connected: false` y arranca un timeout de gracia (por ejemplo, 2 minutos) antes de sacarlo de la partida.
- Al reconectar, el cliente envía `player:reconnect` con su token y recupera su mano y el estado actual de la partida.

## 6. Persistencia

Se distinguen dos necesidades con soluciones distintas:

- **Estado de partida activa**: reside en memoria del proceso Node mientras la sala existe. No requiere base de datos, ya que es efímero por diseño (una partida de cartas no se reanuda días después). Si el servidor llega a escalar a varias instancias detrás de un balanceador, este estado debe moverse a Redis (mediante el adapter oficial `@socket.io/redis-adapter`) para que los sockets de distintas instancias compartan salas. Esta pieza se incorpora solo cuando exista esa necesidad de escala.
- **Datos persistentes** (fuera del MVP): usuarios registrados, estadísticas de partidas, historial. Para esto se contempla Postgres, accedido desde el servidor con Prisma. El MVP (jugar como invitado con nombre y código de sala) no requiere esta capa.

Orden de implementación recomendado: MVP completo sin base de datos (todo en memoria) y, una vez el juego funcione, incorporar Postgres si se decide añadir cuentas o estadísticas persistentes.

## 7. Frontend

- **Vite + React + TypeScript**: arranque rápido, sin necesidad de SSR.
- **Zustand** para el estado de cliente (estado de socket, vista actual), más ligero que Redux para un estado que es, en esencia, un espejo de lo que reporta el servidor.
- **Framer Motion** para animar cartas (repartir, jugar, robar). No se emplea ninguna librería de cartas "todo en uno": las cartas son componentes simples (`<div>`/SVG con estilos) y Framer Motion aporta el movimiento.
- Cliente de socket centralizado en un único módulo (`src/socket.ts`) que expone hooks (`useRoom()`, `useGame()`) en lugar de dispersar `socket.on` por los componentes.

## 8. Estructura de carpetas

```
server/
  src/
    rooms/          # creación, códigos, join/leave
    game/            # máquina de estados del juego (reglas de Culo)
    sockets/         # handlers de eventos, mapeo socket ↔ player
    index.ts
client/
  src/
    components/
      Card.tsx
      Hand.tsx
      Table.tsx
      Lobby.tsx
    hooks/
      useRoom.ts
      useGame.ts
    store/            # zustand
    socket.ts
```

## 9. Estado del proyecto

- [x] Estructura de carpetas del monorepo (`client/`, `server/`, `docs/`).
- [x] Dependencias del servidor instaladas: `express`, `socket.io`, `cors`, `typescript`.
- [x] Cliente inicializado con Vite (React + TypeScript) y dependencias: `socket.io-client`, `zustand`, `framer-motion`.
- [x] Control de versiones inicializado (`git init`) con `.gitignore` para el monorepo.
- [ ] Reglamento de "Culo" a implementar (`docs/REGLAS.md`).
- [ ] Servidor mínimo (Express + Socket.io) con healthcheck.
- [ ] Cliente conectado al servidor por socket.
- [ ] Flujo de sala completo (crear / unirse / lobby).
- [ ] Máquina de estados del juego en el servidor.
- [ ] Interfaz de mesa y cartas.
