export function serialize1d(grid: number[]): Buffer {
    return Buffer.from(grid); 
}

export function serialize2d(grid: number[][]): Buffer {
    return Buffer.from(grid.flat()); 
}

export function deserialize(buffer: Buffer): number[][]{
    const rows: number = process.env.ROWS ?  parseInt(process.env.ROWS) : 0;
    const cols: number = process.env.COLS ?  parseInt(process.env.COLS) : 0;
    
    const flatArray = Array.from(buffer); 
    const grid : number[][] = []; 

    for (let i = 0; i < rows ; i++ ){
        grid.push(flatArray.slice(i * cols, i * cols + cols)); 
    }
    return grid; 
}