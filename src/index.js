class Cell {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    if (value === 0) {
      this.solved = false;
      this.posibleValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    } else {
      this.solved = true;
      this.posibleValues = [value];
    }
    this.value = value;
  }

  removeNotPosibleValue(value) {
    const ind = this.posibleValues.indexOf(value);
    let removed = false;
    if (ind !== -1) {
      this.posibleValues.splice(ind, 1);
      if (this.posibleValues.length === 1) {
        this.value = this.posibleValues[0];
        this.solved = true;
      }
      removed = true;
    }
    return removed;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getBlockNumber() {
    return Math.floor(this.x / 3) + Math.floor(this.y / 3) * 3;
  }

  getValue() {
    return this.value;
  }

  isSolved() {
    return this.solved;
  }
}

class Sudoku {
  constructor(matrix) {
    this.sudoku = [];
    this.blocks = [[], [], [], [], [], [], [], [], []];
    for (let x = 0; x < 9; x++) {
      this.sudoku[x] = [];
      for (let y = 0; y < 9; y++) {
        const cell = new Cell(x, y, matrix[x][y]);
        this.sudoku[x][y] = cell;
        this.blocks[cell.getBlockNumber()].push(cell);
      }
    }
  }

  solve() {
    let changed = true;
    while (changed) {
      changed = false;
      for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
          const cell = this.sudoku[x][y];
          if (!cell.isSolved()) {
            const changedInRow = this.checkInRow(x, y);
            const changedInColumn = this.checkInColumn(x, y);
            const changedInBlock = this.checkInBlock(x, y);
            const changedOneLeftInRow = this.checkOneLeftInRow(x, y);
            const changedOneLeftInColumn = this.checkOneLeftInColumn(x, y);
            const changedOneLeftInBlock = this.checkOneLeftInBlock(x, y);
            changed = changed || changedInRow || changedInColumn || changedInBlock || changedOneLeftInRow || changedOneLeftInColumn || changedOneLeftInBlock;
          }
        }
      }
    }
  }

  isSolved() {
    const filled = this.sudoku.every(row => row.every(cell => cell.isSolved()));
    const rows = this.sudoku.every(row => row.reduce((acc, cell) => acc + cell.getValue(), 0) === 45);
    const columns = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(val => {
      let sum = 0;
      for (let i = 0; i < this.sudoku.length; i++) {
        sum += this.sudoku[i][val].getValue();
      }
      return sum;
    }).every(val => val === 45);
    const blocks = this.blocks.every(block => block.reduce((acc, cell) => acc + cell.getValue(), 0) === 45)
    return filled && rows && columns && blocks;
  }

  predict() {
    let cell = null;
    const prediction = [];
    cicle:
    for (let x = 0; x < this.sudoku.length; x++) {
      for (let y = 0; y < this.sudoku[x].length; y++) {
        const currentCell = this.sudoku[x][y];
        if (!currentCell.isSolved()) {
          cell = currentCell;
          break cicle;
        }
      }
    }
    if (cell !== null) {
      const possible = cell.posibleValues;
      for (let i = 0; i < possible.length; i++) {
        const matrix = this.getMatrix();
        matrix[cell.getX()][cell.getY()] = possible[i];
        prediction.push(matrix);
      }
    }
    return prediction;
  }

  checkInRow(x, y) {
    const cell = this.sudoku[x][y];
    let changed = false;
    if (!cell.isSolved()) {
      for (let i = 0; i < this.sudoku[x].length; i++) {
        const cellToCheck = this.sudoku[x][i];
        if (cellToCheck !== cell && cellToCheck.isSolved()) {
          const removed = cell.removeNotPosibleValue(cellToCheck.getValue());
          changed = changed || removed;
        }
      }
    }
    return changed;
  }

  checkOneLeftInRow(x, y) {
    const cell = this.sudoku[x][y];
    const posibleValues = cell.posibleValues;
    let changed = false;
    if (!cell.isSolved()) {
      for (let i = 0; i < posibleValues.length; i++) {
        const value = posibleValues[i];
        let found = false;
        for (let j = 0; j < this.sudoku[x].length; j++) {
          const cellToCheck = this.sudoku[x][j];
          if (cellToCheck !== cell && cellToCheck.posibleValues.indexOf(value) !== -1) {
            found = true;
          }
        }
        if (!found) {
          changed = true;
          cell.value = value;
          cell.solved = true;
          cell.posibleValues = [value];
        }
      }
    }
    return changed;
  }

  checkInColumn(x, y) {
    const cell = this.sudoku[x][y];
    let changed = false;
    if (!cell.isSolved()) {
      for (let i = 0; i < this.sudoku.length; i++) {
        const cellToCheck = this.sudoku[i][y];
        if (cellToCheck !== cell && cellToCheck.isSolved()) {
          const removed = cell.removeNotPosibleValue(cellToCheck.getValue());
          changed = changed || removed;
        }
      }
    }
    return changed;
  }

  checkOneLeftInColumn(x, y) {
    const cell = this.sudoku[x][y];
    const posibleValues = cell.posibleValues;
    let changed = false;
    if (!cell.isSolved()) {
      for (let i = 0; i < posibleValues.length; i++) {
        const value = posibleValues[i];
        let found = false;
        for (let j = 0; j < this.sudoku.length; j++) {
          const cellToCheck = this.sudoku[j][y];
          if (cellToCheck !== cell && cellToCheck.posibleValues.indexOf(value) !== -1) {
            found = true;
          }
        }
        if (!found) {
          changed = true;
          cell.value = value;
          cell.solved = true;
          cell.posibleValues = [value];
        }
      }
    }
    return changed;
  }

  checkInBlock(x, y) {
    const cell = this.sudoku[x][y];
    const block = this.blocks[cell.getBlockNumber()];
    let changed = false;
    if (!cell.isSolved()) {
      for (let i = 0; i < block.length; i++) {
        const cellToCheck = block[i];
        if (cellToCheck !== cell && cellToCheck.isSolved()) {
          const removed = cell.removeNotPosibleValue(cellToCheck.getValue());
          changed = changed || removed;
        }
      }
    }
    return changed;
  }

  checkOneLeftInBlock(x, y) {
    const cell = this.sudoku[x][y];
    const block = this.blocks[cell.getBlockNumber()];
    const posibleValues = cell.posibleValues;
    let changed = false;
    if (!cell.isSolved()) {
      for (let i = 0; i < posibleValues.length; i++) {
        const value = posibleValues[i];
        let found = false;
        for (let j = 0; j < block.length; j++) {
          const cellToCheck = block[j];
          if (cellToCheck !== cell && cellToCheck.posibleValues.indexOf(value) !== -1) {
            found = true;
          }
        }
        if (!found) {
          changed = true;
          cell.value = value;
          cell.solved = true;
          cell.posibleValues = [value];
        }
      }
    }
    return changed;
  }

  getMatrix() {
    return this.sudoku.map(row => row.map(cell => cell.getValue()));
  }
}

module.exports = function solveSudoku(matrix) {
  const possible = [matrix];
  let i = 0;
  while(possible.length > 0) {
    const newMatrix = possible.pop();
    const sudoku = new Sudoku(newMatrix);
    sudoku.solve();
    if (sudoku.isSolved()) {
      return sudoku.getMatrix();
    } else {
      const prediction = sudoku.predict();
      for (let i = 0; i < prediction.length; i++) {
        possible.push(prediction[i]);
      }
    }
    i++;
  }
}
