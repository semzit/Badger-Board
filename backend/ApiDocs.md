REST API 


client will send a post '/auth 'to server containing its coordinates, the server will send back an alias contains: 
    id : uuid(), 


    this uuid will be stored with its respective building on the server, in a hashmap that is reset every 10 minutes. 
/board 
    this returns the current board data needed on init





websocket : 

    client sends : 
        /paint 
            id : number; 
            x : ,
            y : , 
            color : number, 

    client will either get success : nothing changes 
    error : 


mad-hacks-fall-2025.vercel.app
