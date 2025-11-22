async function authenticate() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        const res = await fetch(tokenEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude, longitude })
        });

        /*
            data = {
                building: "morg",
                token: "abcdefg12345", 
                initialState: { ... }
            }
        */
        const data = await res.json();
        if (data.allowed) {
          resolve(data.token);
        } else {
          reject("Not inside building");
        }
      } catch (err) {
        reject(err);
      }
    }, reject);
  });
}
export { authenticate };