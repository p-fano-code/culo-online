# Culo Online

Proyecto de práctica personal para experimentar con interfaces gráficas tipo videojuego en React y comparar tecnologías de backend en tiempo real. Reimplementa el clásico juego de cartas español "Culo" como app multijugador por salas, usando React + TypeScript en el cliente y Node.js + Socket.io en el servidor.

## Funcionamiento

Un jugador crea una sala y comparte un código con el resto para unirse a la partida. El servidor mantiene el estado autoritativo del juego (mazo, turnos, mano de cada jugador) y sincroniza la mesa en tiempo real vía WebSockets.

## Stack

- **Cliente**: React, TypeScript, Vite, Zustand, Framer Motion
- **Servidor**: Node.js, TypeScript, Express, Socket.io
- **Herramientas de desarrollo**: Claude Code como asistente de IA para arquitectura y desarrollo

## Documentación

La arquitectura completa del proyecto está documentada en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
