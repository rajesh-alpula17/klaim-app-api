# klaim-app-api
# JSONServer + JWT Auth

REST API using json-server with JWT authentication. 



## Install

```bash
$ npm install
$ npm run start-auth
```

Might need to run
```
npm audit fix
```

## How to login?

You can login by sending a POST request to

```
POST http://localhost:8000/login

```
with the following data 

```
{
  "email": "alexey@klaim.ai",
   "password": "lkJlkn8hj"
}
```

You should receive an access token with the following format 

```
{
   "access_token": "<ACCESS_TOKEN>"
}
```