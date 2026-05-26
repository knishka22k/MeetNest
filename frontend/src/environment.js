let IS_PROD = true;

const server = IS_PROD ?
      "https://meetnestbackend-0e2e.onrender.com" :
      "http://localhost:8000"
    

export default server;