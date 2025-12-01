export function serialize1d(grid: number[]): Buffer {
    return Buffer.from(grid); 
}

export function serialize2d(grid: number[][]): Buffer {
    const flat = grid.flat();
    const floatArray = new Float64Array(flat);
    return Buffer.from(floatArray.buffer); 
}

export function deserialize2d(buffer: Buffer): number[][]{
    const rows: number = process.env.ROWS ?  parseInt(process.env.ROWS) : 100;
    const cols: number = process.env.COLS ?  parseInt(process.env.COLS) : 100;
    
    const flatArray = Array.from(buffer); 
    const grid : number[][] = []; 

    for (let i = 0; i < rows ; i++ ){
        grid.push(flatArray.slice(i * cols, i * cols + cols)); 
    }
    return grid; 
}

export function deserializeCoords2d(buffer: Buffer, rows: number, cols: number): number[][] {
  const floatArray = new Float64Array(buffer.buffer, buffer.byteOffset, buffer.length / 8);

  const result: number[][] = [];
  for (let i = 0; i < rows; i++) {
    result.push(Array.from(floatArray.slice(i * cols, i * cols + cols)));
  }

  return result;
}


export function deserialize1d(buffer: Buffer): number[]{
    const rows: number = process.env.ROWS ?  parseInt(process.env.ROWS) : 4;
    
    const flatArray = Array.from(buffer); 
    
    return flatArray; 
}