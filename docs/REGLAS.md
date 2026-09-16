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

## 6. Intercambio de cartas entre rondas

Al finalizar una ronda y antes de repartir la siguiente, se realiza un intercambio obligatorio de cartas según el ranking:

- El Culo entrega sus 2 mejores cartas al Presidente; el Presidente entrega a cambio sus 2 peores cartas al Culo.
- El Viceculo entrega su mejor carta al Vicepresidente; el Vicepresidente entrega a cambio su peor carta al Viceculo.
- Los jugadores sin rol (posiciones intermedias) no intercambian cartas.

"Mejor" y "peor" se determinan por el orden de valor de la sección 1. El intercambio es obligatorio y no puede rechazarse.

## 7. Casos límite por número de jugadores

- **2 jugadores**: solo existen los roles Presidente y Culo. El intercambio es de 2 cartas en cada sentido (regla del Presidente/Culo).
- **3 jugadores**: existen Presidente, un jugador intermedio sin rol, y Culo. No hay Vicepresidente ni Viceculo, por lo que no hay intercambio de 1 carta.
- **4 o más jugadores**: se aplican los cuatro roles y ambos intercambios tal como se describen en la sección 6.
- **7 a 10 jugadores**: además de los cuatro roles, se juega con la baraja extendida de 48 cartas (sección 1).

## 8. Estado pendiente de definición

- Condición de victoria de la partida completa (¿se juega una única serie de rondas hasta X puntos, o se repiten rondas indefinidamente hasta que los jugadores decidan terminar?).
- Tiempo límite por turno, si lo hay.
