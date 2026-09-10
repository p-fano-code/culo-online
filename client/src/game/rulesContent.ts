export interface RulesPage {
  title: string;
  paragraphs: string[];
  list?: string[];
}

export const RULES_PAGES: RulesPage[] = [
  {
    title: 'La baraja',
    paragraphs: [
      'Se juega con la baraja española de 40 cartas: oros, copas, espadas y bastos.',
      'El orden de valor, de más baja a más alta, es:',
    ],
    list: ['3', '4', '5', '6', '7', 'Sota', 'Caballo', 'Rey', 'As', '2 (la más alta)'],
  },
  {
    title: 'Cómo se juega',
    paragraphs: [
      'Por turnos, cada jugador debe jugar una o varias cartas del mismo valor (una suelta, pareja o trío), igualando o superando el valor de la última jugada y con la misma cantidad de cartas.',
      'Si no puedes o no quieres jugar, puedes pasar. Quien pasa queda fuera de esa ronda de mesa hasta que se queme.',
      'Quien abre una ronda de mesa puede jugar lo que quiera: cualquier valor y de 1 a 4 cartas.',
    ],
  },
  {
    title: 'Salto de turno',
    paragraphs: [
      'Si juegas una carta (o cartas) del mismo valor que la jugada anterior, se salta el turno del siguiente jugador y la partida sigue con el que viene después.',
      'Cuando esto ocurra, el pirata avisará con un "¡SALTO!", y a la persona saltada le dirá "¡Te han saltado!".',
    ],
  },
  {
    title: 'El 2: comodín y quema',
    paragraphs: [
      'El 2 es especial: se puede jugar en cualquier momento, sea cual sea la jugada anterior, sin igualar cantidad ni valor.',
      'Jugar un 2 quema la mesa al instante: se retiran las cartas y quien lo jugó abre una ronda nueva libremente.',
      'La mesa también se quema si todos los demás jugadores pasan tras una jugada.',
    ],
  },
  {
    title: 'Fin de la partida',
    paragraphs: [
      'Cada jugador queda fuera de la partida en cuanto se queda sin cartas. El orden en que los jugadores se quedan sin cartas marca el ranking final:',
    ],
    list: ['1º: Presidente', '2º: Vicepresidente', '...', 'Penúltimo: Viceculo', 'Último: Culo'],
  },
  {
    title: 'Intercambio entre rondas',
    paragraphs: ['Al empezar una nueva ronda hay un intercambio obligatorio de cartas según el ranking anterior:'],
    list: [
      'El Culo da sus 2 mejores cartas al Presidente, que le da a cambio sus 2 peores.',
      'El Viceculo da su mejor carta al Vicepresidente, que le da a cambio su peor.',
    ],
  },
];
