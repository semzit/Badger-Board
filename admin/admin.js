// responsible for sending new boards 
try{
    const boardInit = Array(100).fill(0).map(() => Array(100).fill(0));

    const coordInit = [
      [45.6581812088617, -94.6197712462103], 
      [45.36719016965179, -82.90951936954298], 
      [40.591149344196786, -93.84462454988244],
      [39.936286135844675, -86.78525285118228]
    ]; 

    const mess = {
        boardName : "tri sig", 
        board : {
            board  : boardInit, 
            coords :  coordInit
        }
    }

    await fetch(
        `http://localhost:8080/api/init/setBoard`, 
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json' // Tell the server we are sending JSON
            },
            body: JSON.stringify(mess)
        }
    )

} catch(e) {
    console.log(e);
}