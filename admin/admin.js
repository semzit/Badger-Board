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
        boardName : "morg", 
        password : "1234",
        board : {
            drawing  : boardInit, 
            coords :  coordInit
        }
    }; 

    const dell = {
        password : "1234", 
        boardName : "morg"
    }; 

    // await fetch(
    //     `http://localhost:8080/api/init/deleteBoard`, 
    //     {
    //         method: "POST",
    //         headers: {
    //             'Content-Type': 'application/json' // Tell the server we are sending JSON
    //         },
    //         body: JSON.stringify(dell)
    //     }
    // )

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