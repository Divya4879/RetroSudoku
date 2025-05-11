/**
 * RADICAL SUDOKU EXTREME - Sudoku Generator
 * A powerful sudoku puzzle generator with difficulty levels
 */

class SudokuGenerator {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
    }

    /**
     * Generate a new Sudoku puzzle with the specified difficulty
     * @param {string} difficulty - 'easy', 'medium', 'hard', or 'expert'
     * @param {number} level - Game level (1-10)
     * @returns {Object} - Contains the puzzle grid and solution
     */
    generate(difficulty, level = 1) {
        console.log(`Generating puzzle with difficulty: ${difficulty}, level: ${level}`);
        
        // Clear the grid
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        
        // Fill the diagonal boxes first (these are independent of each other)
        this.fillDiagonalBoxes();
        
        // Fill the rest of the grid
        if (!this.fillRemaining(0, 0)) {
            console.log("Failed to fill grid, using default puzzle");
            // If filling fails, use a default puzzle
            return this.getDefaultPuzzle(difficulty, level);
        }
        
        // Save the solution
        this.solution = this.grid.map(row => [...row]);
        
        // Remove numbers based on difficulty and level
        this.removeNumbers(difficulty, level);
        
        return {
            puzzle: this.grid.map(row => [...row]),
            solution: this.solution
        };
    }

    /**
     * Fill the diagonal 3x3 boxes
     */
    fillDiagonalBoxes() {
        for (let box = 0; box < 9; box += 3) {
            this.fillBox(box, box);
        }
    }

    /**
     * Fill a 3x3 box starting at the given row and column
     * @param {number} row - Starting row
     * @param {number} col - Starting column
     */
    fillBox(row, col) {
        let num;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                do {
                    num = Math.floor(Math.random() * 9) + 1;
                } while (!this.isSafe(row + i, col + j, num));
                
                this.grid[row + i][col + j] = num;
            }
        }
    }

    /**
     * Check if it's safe to place a number at the given position
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {number} num - Number to check
     * @returns {boolean} - True if safe, false otherwise
     */
    isSafe(row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (this.grid[row][x] === num) {
                return false;
            }
        }
        
        // Check column
        for (let x = 0; x < 9; x++) {
            if (this.grid[x][col] === num) {
                return false;
            }
        }
        
        // Check 3x3 box
        let startRow = row - row % 3;
        let startCol = col - col % 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.grid[i + startRow][j + startCol] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Fill the remaining cells recursively using backtracking
     * @param {number} row - Current row
     * @param {number} col - Current column
     * @returns {boolean} - True if filled successfully
     */
    fillRemaining(row, col) {
        // If we've filled all cells, we're done
        if (row >= 9) {
            return true;
        }
        
        // Move to the next row when we reach the end of the current row
        if (col >= 9) {
            return this.fillRemaining(row + 1, 0);
        }
        
        // Skip cells that are already filled
        if (this.grid[row][col] !== 0) {
            return this.fillRemaining(row, col + 1);
        }
        
        // Try placing each number
        for (let num = 1; num <= 9; num++) {
            if (this.isSafe(row, col, num)) {
                this.grid[row][col] = num;
                
                if (this.fillRemaining(row, col + 1)) {
                    return true;
                }
                
                // If placing the current number doesn't lead to a solution, backtrack
                this.grid[row][col] = 0;
            }
        }
        
        // No valid number found, backtrack
        return false;
    }

    /**
     * Remove numbers from the grid based on difficulty and level
     * @param {string} difficulty - 'easy', 'medium', 'hard', or 'expert'
     * @param {number} level - Game level (1-10)
     */
    removeNumbers(difficulty, level = 1) {
        // Base cells to remove for each difficulty
        let baseCellsToRemove;
        
        switch (difficulty.toLowerCase()) {
            case 'easy':
                baseCellsToRemove = 30; // Leave ~51 clues
                break;
            case 'medium':
                baseCellsToRemove = 45; // Leave ~36 clues
                break;
            case 'hard':
                baseCellsToRemove = 55; // Leave ~26 clues
                break;
            case 'expert':
                baseCellsToRemove = 60; // Leave ~21 clues
                break;
            default:
                baseCellsToRemove = 40;
        }
        
        // Adjust cells to remove based on level (within the same difficulty)
        let levelAdjustment = 0;
        
        if (difficulty === 'easy') {
            // Level 1-2: Easy
            levelAdjustment = (level - 1) * 5;
        } else if (difficulty === 'medium') {
            // Level 3-5: Medium
            levelAdjustment = (level - 3) * 3;
        } else if (difficulty === 'hard') {
            // Level 6-8: Hard
            levelAdjustment = (level - 6) * 2;
        } else if (difficulty === 'expert') {
            // Level 9-10: Expert
            levelAdjustment = (level - 9) * 2;
        }
        
        const cellsToRemove = baseCellsToRemove + levelAdjustment;
        
        console.log(`Removing ${cellsToRemove} cells for ${difficulty} difficulty, level ${level}`);
        
        let attempts = 0;
        let removed = 0;
        
        while (removed < cellsToRemove && attempts < 100) {
            // Select a random cell
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);
            
            // Skip if the cell is already empty
            if (this.grid[row][col] === 0) {
                attempts++;
                continue;
            }
            
            // Remember the value in case we need to restore it
            let backup = this.grid[row][col];
            this.grid[row][col] = 0;
            removed++;
            
            // For expert difficulty, we don't check for unique solutions to make it harder
            if (difficulty.toLowerCase() === 'expert') {
                continue;
            }
            
            // For other difficulties, ensure the puzzle has a unique solution
            let solver = new SudokuSolver(this.grid.map(row => [...row]));
            
            // If there's not exactly one solution, restore the value
            if (solver.countSolutions(2) !== 1) {
                this.grid[row][col] = backup;
                removed--;
                attempts++;
            }
        }
        
        console.log(`Successfully removed ${removed} cells`);
    }
    
    /**
     * Get a pre-defined puzzle as a fallback
     * @param {string} difficulty - 'easy', 'medium', 'hard', or 'expert'
     * @param {number} level - Game level (1-10)
     * @returns {Object} - Contains the puzzle grid and solution
     */
    getDefaultPuzzle(difficulty, level = 1) {
        console.log("Using default puzzle");
        
        // A simple pre-defined puzzle and its solution
        const solution = [
            [5, 3, 4, 6, 7, 8, 9, 1, 2],
            [6, 7, 2, 1, 9, 5, 3, 4, 8],
            [1, 9, 8, 3, 4, 2, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3],
            [4, 2, 6, 8, 5, 3, 7, 9, 1],
            [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4],
            [2, 8, 7, 4, 1, 9, 6, 3, 5],
            [3, 4, 5, 2, 8, 6, 1, 7, 9]
        ];
        
        // Create a puzzle by removing some numbers from the solution
        const puzzle = solution.map(row => [...row]);
        
        // Base cells to remove for each difficulty
        let baseCellsToRemove;
        
        switch (difficulty.toLowerCase()) {
            case 'easy':
                baseCellsToRemove = 30;
                break;
            case 'medium':
                baseCellsToRemove = 45;
                break;
            case 'hard':
                baseCellsToRemove = 55;
                break;
            case 'expert':
                baseCellsToRemove = 60;
                break;
            default:
                baseCellsToRemove = 40;
        }
        
        // Adjust cells to remove based on level
        let levelAdjustment = 0;
        
        if (difficulty === 'easy') {
            // Level 1-2: Easy
            levelAdjustment = (level - 1) * 5;
        } else if (difficulty === 'medium') {
            // Level 3-5: Medium
            levelAdjustment = (level - 3) * 3;
        } else if (difficulty === 'hard') {
            // Level 6-8: Hard
            levelAdjustment = (level - 6) * 2;
        } else if (difficulty === 'expert') {
            // Level 9-10: Expert
            levelAdjustment = (level - 9) * 2;
        }
        
        const cellsToRemove = baseCellsToRemove + levelAdjustment;
        
        // Remove random cells
        let removed = 0;
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (puzzle[row][col] !== 0) {
                puzzle[row][col] = 0;
                removed++;
            }
        }
        
        return {
            puzzle: puzzle,
            solution: solution
        };
    }
}

/**
 * Helper class to solve and count solutions for a Sudoku puzzle
 */
class SudokuSolver {
    constructor(grid) {
        this.grid = grid;
        this.solutionCount = 0;
    }

    /**
     * Count the number of solutions up to a maximum
     * @param {number} max - Maximum number of solutions to count
     * @returns {number} - Number of solutions found (up to max)
     */
    countSolutions(max = 1) {
        this.solutionCount = 0;
        this.solve(0, 0, max);
        return this.solutionCount;
    }

    /**
     * Solve the Sudoku puzzle recursively using backtracking
     * @param {number} row - Current row
     * @param {number} col - Current column
     * @param {number} max - Maximum number of solutions to find
     * @returns {boolean} - True if a solution is found
     */
    solve(row, col, max) {
        // If we've filled all cells, we've found a solution
        if (row >= 9) {
            this.solutionCount++;
            return this.solutionCount < max;
        }
        
        // Move to the next row when we reach the end of the current row
        if (col >= 9) {
            return this.solve(row + 1, 0, max);
        }
        
        // Skip cells that are already filled
        if (this.grid[row][col] !== 0) {
            return this.solve(row, col + 1, max);
        }
        
        // Try placing each number
        for (let num = 1; num <= 9; num++) {
            if (this.isSafe(row, col, num)) {
                this.grid[row][col] = num;
                
                // Continue solving with this number placed
                if (!this.solve(row, col + 1, max)) {
                    return false;
                }
                
                // Backtrack
                this.grid[row][col] = 0;
            }
        }
        
        return true;
    }

    /**
     * Check if it's safe to place a number at the given position
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {number} num - Number to check
     * @returns {boolean} - True if safe, false otherwise
     */
    isSafe(row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (this.grid[row][x] === num) {
                return false;
            }
        }
        
        // Check column
        for (let x = 0; x < 9; x++) {
            if (this.grid[x][col] === num) {
                return false;
            }
        }
        
        // Check 3x3 box
        let startRow = row - row % 3;
        let startCol = col - col % 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.grid[i + startRow][j + startCol] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }
}
