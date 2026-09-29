# Culo Online — Reglamento

Este documento fija el reglamento que implementa la máquina de estados del servidor. Cualquier cambio de regla debe reflejarse aquí antes de modificarse en el código.

## 1. Baraja

Baraja española: palos oros, copas, espadas y bastos.

El tamaño de la baraja depende del número de jugadores de la sala:

- **Hasta 6 jugadores**: baraja estándar de 40 cartas, valores del 1 al 7 y figuras sota, caballo y rey.
- **De 7 a 10 jugadores**: baraja extendida de 48 cartas, se añaden el 8 y el 9 de cada palo. Con más de 6 jugadores, una baraja de 40 cartas se agotaría demasiado rápido para que la partida tenga recorrido.

Orden de valor en el juego, de más baja a más alta:

```
3 < 4 < 5 < 6 < 7 < 8 < 9 < sota < caballo < rey < as < 2
```

El 8 y el 9 solo existen en la baraja extendida; en una partida con baraja estándar esos valores simplemente no aparecen. El 2 es la carta más alta de la baraja y tiene además comportamiento especial (ver sección 4).

## 2. Jugadores y reparto

Admite entre 2 y 10 jugadores. Con 4 o más jugadores se asignan los cuatro roles extremos (Presidente, Vicepresidente, Viceculo, Culo); por debajo de 4 jugadores, los roles intermedios no existen (ver sección 7).

Al inicio de la partida, la baraja completa (40 u 48 cartas según el número de jugadores, ver sección 1) se reparte a partes iguales entre los jugadores. Cuando el número de jugadores no divide exacto el tamaño de la baraja, los jugadores en los primeros puestos del reparto reciben una carta adicional.

## 3. Inicio de turno

- **Primera partida**: empieza el jugador que tiene el 3 de bastos.
- **Partidas siguientes**: empieza el jugador que quedó de Culo en la partida anterior.

El turno avanza en sentido horario.

## 4. Desarrollo del turno

En su turno, un jugador debe:
- Jugar una o varias cartas del mismo valor (una carta suelta, pareja, trío o póker) igualando o superando en valor a la última jugada realizada sobre la mesa, y con la misma cantidad de cartas que esa jugada, o
- Pasar.

Un jugador que pasa queda fuera de la ronda de juego actual (no vuelve a poder jugar hasta que la mesa se queme), pero sigue en la partida.

La primera jugada de una ronda de mesa la hace libremente el jugador en turno: cualquier valor, con la cantidad de cartas que decida (1 a 4), y esa cantidad queda fijada como obligatoria para el resto de esa ronda de mesa.

### Salto de turno

Si un jugador juega una carta (o cartas) del mismo valor que la jugada anterior sobre la mesa, se salta el turno del siguiente jugador activo: el turno pasa directamente al jugador posterior a ese. El jugador saltado no llega a actuar en ese ciclo, pero sigue en la partida con normalidad a partir de su siguiente turno.

Esta mecánica no se aplica al 2 (que ya tiene su propio efecto de quema, ver más abajo) ni a la jugada que abre una ronda de mesa (no hay "jugada anterior" con la que comparar).

### El 2 como comodín

El 2 puede jugarse en cualquier turno, sea cual sea la última jugada sobre la mesa, sin necesidad de igualar cantidad de cartas ni superar el valor de la jugada anterior.

### Quema de la mesa

La mesa se quema (se retiran las cartas jugadas y se abre una ronda de mesa nueva) en dos situaciones:
- Se juega un 2 (solo o combinado con otras cartas).
- Todos los jugadores restantes en la ronda de mesa pasan tras una jugada.

En ambos casos, el jugador que hizo la última jugada antes de la quema inicia la siguiente ronda de mesa libremente, según la regla de la sección anterior.

**Aviso**: al igual que con el salto de turno, el pirata anuncia la quema en el momento en que ocurre — "¡Has quemado la mesa!" a quien la provocó y "¡Mesa quemada!" al resto — para que quede claro que, aunque no ha cambiado el nombre en el indicador de turno, sigue jugando la misma persona.

## 5. Fin de la partida y ranking

Un jugador termina su participación en la partida cuando se queda sin cartas en la mano. El orden en que los jugadores se quedan sin cartas determina el ranking final:

| Posición | Rol |
|---|---|
| 1º | Presidente |
| 2º | Vicepresidente |
| ... | (sin rol, jugadores intermedios) |
| penúltimo | Viceculo |
| último | Culo |

La partida termina cuando queda un único jugador con cartas: ese jugador es el Culo, sin necesidad de que juegue su mano.

## 6. Siguiente ronda e intercambio de cartas

Al terminar una ronda, el anfitrión puede pulsar "Jugar otra ronda" para repartir de nuevo en la misma sala; si no lo hace en 90 segundos, la siguiente ronda arranca sola. Quien empieza la nueva ronda es el Culo de la ronda anterior (sección 3).

Justo después de repartir las cartas de la nueva ronda (no antes), se aplica un intercambio automático y obligatorio sobre esas manos recién repartidas, según el ranking con el que terminó la ronda anterior:

- El Culo entrega sus 2 mejores cartas al Presidente; el Presidente entrega a cambio sus 2 peores cartas al Culo.
- El Viceculo entrega su mejor carta al Vicepresidente; el Vicepresidente entrega a cambio su peor carta al Viceculo.
- Los jugadores sin rol (posiciones intermedias) no intercambian cartas.

"Mejor" y "peor" se determinan por el orden de valor de la sección 1. El intercambio es automático (el jugador no elige qué cartas dar) y no puede rechazarse. Los 4 implicados ven una animación con las cartas que han dado y recibido; el resto de jugadores solo ve un aviso de que se está produciendo el intercambio, sin ver las cartas.

## 7. Casos límite por número de jugadores

- **2 jugadores**: solo existen los roles Presidente y Culo. El intercambio es de 2 cartas en cada sentido (regla del Presidente/Culo).
- **3 jugadores**: existen Presidente, un jugador intermedio sin rol, y Culo. No hay Vicepresidente ni Viceculo, por lo que no hay intercambio de 1 carta.
- **4 o más jugadores**: se aplican los cuatro roles y ambos intercambios tal como se describen en la sección 6.
- **7 a 10 jugadores**: además de los cuatro roles, se juega con la baraja extendida de 48 cartas (sección 1).

## 8. Altas y bajas a mitad de partida

Una sala admite unirse o reconectar en cualquier momento, incluso con una ronda en marcha.

- **Unirse a mitad de partida**: el jugador entra en modo espectador. Ve la mesa con normalidad pero no recibe cartas de la ronda en curso; podrá jugar en cuanto se reparta la siguiente ronda (sección 6).
- **Desconexión durante una ronda activa**: la mano de ese jugador se descarta al instante y sale de la rotación de turnos, pero no se le expulsa de la sala — su nombre sigue visible (en un tono gris apagado, marcado como "desconectado") en vez de desaparecer. No recibe ningún rol de esa ronda. Si no vuelve a conectarse, se le quita de la lista de jugadores al empezar la siguiente ronda.
- **Reconexión durante una ronda activa**: si vuelve antes de que la ronda termine, entra en modo espectador igual que una unión nueva — no recupera la mano que tenía. Si vuelve una vez la ronda ya ha terminado (o la sala sigue en el lobby), se reincorpora con normalidad.
- **Rol forzoso**: a quienes están esperando la siguiente ronda (espectadores nuevos o desconectados que han vuelto) se les ordena por el momento en que empezaron a esperar. Al repartir la siguiente ronda, el último de esa cola será Culo y el penúltimo Viceculo, sin importar cómo jueguen esa ronda; el resto entra sin rol forzado, como cualquier otro jugador.
- **Aviso**: cada vez que alguien se une a mitad de partida o abandona una ronda en marcha, el pirata lo anuncia brevemente al resto de la mesa.

## 9. Estado pendiente de definición

- Tiempo límite por turno, si lo hay.
