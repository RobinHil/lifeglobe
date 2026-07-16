/**
 * Moteur du jeu de la vie de Conway (B3/S23), pur TypeScript.
 * Grille équirectangulaire : torique en longitude (est-ouest), pas de wrap aux pôles.
 * Seules les cellules "terre" peuvent être vivantes.
 */
export class LifeEngine {
  readonly width: number;
  readonly height: number;
  readonly isLand: Uint8Array;

  cells: Uint8Array;
  private next: Uint8Array;

  generation = 0;
  population = 0;
  births = 0;
  deaths = 0;

  constructor(width: number, height: number, isLand: Uint8Array) {
    this.width = width;
    this.height = height;
    this.isLand = isLand;
    this.cells = new Uint8Array(width * height);
    this.next = new Uint8Array(width * height);
  }

  randomize(density: number) {
    const { cells, isLand } = this;
    let pop = 0;
    for (let i = 0; i < cells.length; i++) {
      const v = isLand[i] && Math.random() < density ? 1 : 0;
      cells[i] = v;
      pop += v;
    }
    this.generation = 0;
    this.population = pop;
    this.births = 0;
    this.deaths = 0;
  }

  clear() {
    this.cells.fill(0);
    this.generation = 0;
    this.population = 0;
    this.births = 0;
    this.deaths = 0;
  }

  step() {
    const { width: w, height: h, cells, next, isLand } = this;
    let births = 0;
    let deaths = 0;
    let pop = 0;

    for (let y = 0; y < h; y++) {
      const row = y * w;
      const up = y > 0 ? row - w : -1;
      const down = y < h - 1 ? row + w : -1;

      for (let x = 0; x < w; x++) {
        const xl = x === 0 ? w - 1 : x - 1;
        const xr = x === w - 1 ? 0 : x + 1;

        let n = cells[row + xl] + cells[row + xr];
        if (up >= 0) n += cells[up + xl] + cells[up + x] + cells[up + xr];
        if (down >= 0) n += cells[down + xl] + cells[down + x] + cells[down + xr];

        const i = row + x;
        const alive = cells[i];
        let v = 0;
        if (alive) {
          v = n === 2 || n === 3 ? 1 : 0;
        } else if (n === 3 && isLand[i]) {
          v = 1;
        }
        if (v !== alive) {
          if (v) births++;
          else deaths++;
        }
        next[i] = v;
        pop += v;
      }
    }

    this.next = this.cells;
    this.cells = next;
    this.generation++;
    this.population = pop;
    this.births = births;
    this.deaths = deaths;
  }
}
