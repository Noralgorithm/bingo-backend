type BingoCard = number[][]

export class BingoController {
  constructor(private rows: number, private columns: number) {}

  public generateBalls(): number[] {
    const numbers: number[] = [];
    for (let i = 1; i <= 75; i++) {
      numbers.push(i);
    }
    const shuffledNumbers = this.shuffle(numbers);
    return shuffledNumbers.slice(0, 75);
  }

  public generateCard(): BingoCard {
    const card: number[][] = []

    const columnNumbers: number[][] = []
    for (let i = 0; i < this.columns; i++) {
      const numeros: number[] = []
      for (let j = 0; j < this.rows; j++) {
        const min: number = i * 15 + 1
        const max: number = (i + 1) * 15
        let numero: number = Math.floor(Math.random() * (max - min + 1)) + min

        while (numeros.includes(numero)) {
          numero = Math.floor(Math.random() * (max - min + 1)) + min
        }

        numeros.push(numero)
      }
      columnNumbers.push(numeros)
    }

    for (let i = 0; i < this.rows; i++) {
      const fila: number[] = []
      for (let j = 0; j < this.columns; j++) {
        fila.push(columnNumbers[j][i])
      }
      card.push(fila)
    }

    card[2][2] = -1

    return card
  }

  public checkVictory(card: BingoCard, numbers: number[]): string[] {
    const victories: string[] = []

    for (let i = 0; i < this.rows; i++) {
      const row = card[i].filter(num => num !== -1)
      if (row.every(num => numbers.includes(num))) {
        victories.push('Row ' + (i + 1) + ' win!')
      }
    }

    for (let j = 0; j < this.columns; j++) {
      const column = []
      for (let i = 0; i < 5; i++) {
        if (card[i][j] !== -1) {
          column.push(card[i][j])
        }
      }
      if (column.every(num => numbers.includes(num))) {
        victories.push('Column ' + (j + 1) + ' win!')
      }
    }

    if (this.rows === 5 && this.columns === 5) {
      let diagonal1 = [
        card[0][0],
        card[1][1],
        card[2][2],
        card[3][3],
        card[4][4]
      ]
      let diagonal2 = [
        card[0][4],
        card[1][3],
        card[2][2],
        card[3][1],
        card[4][0]
      ]
      diagonal1 = diagonal1.filter(num => num !== -1)
      diagonal2 = diagonal2.filter(num => num !== -1)
      if (diagonal1.every(num => numbers.includes(num))) {
        victories.push('Diagonal 1 win!')
      }
      if (diagonal2.every(num => numbers.includes(num))) {
        victories.push('Diagonal 2 win!')
      }
    }

    const flatCard = card.flat().filter(num => num !== -1)
    if (flatCard.every(num => numbers.includes(num))) {
      victories.push('Bingo!')
    }

    if (victories.length === 0) {
      victories.push('No win yet.')
    }

    return victories
  }

  private shuffle(array: number[]): number[] {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }
  
}
