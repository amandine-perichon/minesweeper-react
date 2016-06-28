
// Object board - model of the game
// cell properties are: row col isMine isHidden isMarked
var board = {
  size: 5,
  cells: []
}

window.board = board

// Class for cell
var Cell = React.createClass({
  propTypes: {
    row: React.PropTypes.number.isRequired,
    col: React.PropTypes.number.isRequired,
    surroundingMines: React.PropTypes.number.isRequired,
    isMine: React.PropTypes.bool.isRequired,
    isHidden: React.PropTypes.bool.isRequired,
    isMarked: React.PropTypes.bool.isRequired
  },
  render: function () {
    var c = "row-" + this.props.row + " col-" + this.props.col
    if (this.props.isHidden) {
      c+= " hidden"
    }
    if (this.props.isMine) {
      c+= " mine"
    }
    if (this.props.isMarked) {
      c+= " marked"
    }
    var inner = ""
    if (!this.props.isHidden && !this.props.isMine && this.props.surroundingMines !== 0 && !this.props.isMarked) {
      inner = this.props.surroundingMines
    }
    return (
      <div 
        className={c} 
        onClick= {this.unhide}
        onContextMenu= {this.toggleMark}
      >
      {inner}
      </div>
    )
  },
  unhide: function () {
    var cellIndex = getCellIndex(this.props.row, this.props.col)
    board.cells[cellIndex].isHidden = false
    var surr = getSurroundingCells(this.props.row, this.props.col)
    surr.forEach(function(cell) {
      var cellIndex = getCellIndex(cell.row, cell.col)
      if (!cell.isMine && !cell.isMarked) {
        board.cells[cellIndex].isHidden = false
      }
    })
    if (board.cells[cellIndex].isMine) {
      showAllMines()
      refreshHeader('You have lost')
    }
    refreshBoard()
    checkForWin()
  },
  toggleMark: function (evt) {
    var cellIndex = getCellIndex(this.props.row, this.props.col)
    evt.preventDefault()
    board.cells[cellIndex].isMarked = !board.cells[cellIndex].isMarked
    board.cells[cellIndex].isHidden = !board.cells[cellIndex].isHidden
    refreshBoard()
    checkForWin()
  }
})

// Class for board
var Board = React.createClass({
  propTypes: {
    model: React.PropTypes.object.isRequired,
  },
  render: function () {
    var cells = this.props.model.cells.map((elem, i)=> 
      <Cell  key={i} className={Cell} 
                        row={elem.row}
                        col={elem.col}
                        surroundingMines={elem.surroundingMines}
                        isMine={elem.isMine}
                        isHidden={elem.isHidden}
                        isMarked={elem.isMarked}
                  />)
    return (
        <div className="board">{cells}</div>
    )
  }
})

// Class for the header
var Header = React.createClass({
  propTypes: {
    result: React.PropTypes.string.isRequired
  },
  render: function () {
    return (
        <div className="header">
          <h1>Minesweeper</h1>
          <p>{this.props.result}</p>
          <button onClick={resetGame}>Play!</button>
        </div>
    )
  }
})

// Construct board.cells elements
function generateNewBoard () {
  // Create board without mines
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      var newCell = {
        row: i,
        col: j,
        isMine: false,
        isHidden: true,
        isMarked: false
      }
      board.cells.push(newCell)
    }
  }
  // Add mines
  var mines = generateMines()
  board.cells.forEach(function (cell) {
    mines.forEach(function (mine) {
      if (cell.row === mine.row && cell.col === mine.col) {
        cell.isMine = true
      }
    })
  })
  // Count surrounding cells
  board.cells.forEach(function (cell) {
    cell.surroundingMines = countSurroundingMines(cell)
  })
}

function generateMines () {
  var mines = []
  while (mines.length < board.size) {
    var mine = {}
    mine.row = getRandomIntInclusive(0, board.size - 1)
    mine.col = getRandomIntInclusive(0, board.size - 1)
    // check if mine already included in mines
    var mineDuplicate = false
    mines.forEach(function (m) {
      if (m.row === mine.row && m.col === mine.col) {
        mineDuplicate = true
      }
    })
    if (!mineDuplicate) {
      mines.push(mine)
    }
  }
  return mines
}

function showAllMines () {
  board.cells.forEach(elem => {
    if (elem.isMine) {
      elem.isHidden = false
    }
  })
}

function getCellIndex(r, c) {
  var index = -1
  board.cells.forEach(function(elem, i) {
    if (elem.row === r && elem.col === c) {
      index = i
    }
  })
  return index
}

function countSurroundingMines (cell) {
  var surroundingCells = getSurroundingCells(cell.row, cell.col)
  var count = 0
  for (var i = 0; i < surroundingCells.length; i++) {
    if (surroundingCells[i].isMine) {
      count++
    }
  }
  return count
}

// From MDN:
// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomIntInclusive (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function resetGame () {
  board = {
    size: 5,
    cells: []
  }
  generateNewBoard()
  refreshHeader('')
  refreshBoard()
}

function checkForWin () {
  // Check that that all mines have been marked
  // and there are no marked cells that are not mines
  // and there is no hidden cell left
  var result = true
  for (var i = 0; i < board.cells.length; i++) {
    if ((board.cells[i].isMine === false && board.cells[i].isMarked === true) ||
     (board.cells[i].isMine === true && board.cells[i].isMarked === undefined) || board.cells[i].isHidden === true) {
      result = false
      break
    }
  }
  // if user has won, display 'You won' msg, and reset game
  if (result) {
    refreshHeader('You have won!')
  }
}

// Start game
// Generate a new board by modifying the global board object
generateNewBoard()
refreshHeader('')
refreshBoard()

// Refresh renders the board
function refreshBoard () {
  var boardDisplay = <Board model={board}/>
  ReactDOM.render(boardDisplay, document.getElementById('content'))
}

function refreshHeader (str) {
  var headerDisplay = <Header result={str}/>
  ReactDOM.render(headerDisplay, document.getElementById('header'))
}


// Extract from lib EDA
function getSurroundingCells (row, col) {
  var columns = getRange(getLowerBound(col), getUpperBound(col))
  var rows = getRange(getLowerBound(row), getUpperBound(row))
  return board.cells
    .filter(function (cell) {
      return columns.includes(cell.col) && rows.includes(cell.row)
    })
}

function getRange(begin, end) {
  return Array.apply(begin, Array(end - begin + 1))
    .map(function (n, i) {
      return begin + i
    })
}

function getLowerBound (n) {
  return n - 1 < 0 ? 0 : n -1
}

function getUpperBound (n) {
  var limit = board.size - 1
  return n + 1 > limit ? limit : n + 1
}
