# BkCrypto-Server Document
# Deploy Guide

## Prerequire
- Docker
- Node
- Git

## Dependencides
```
$ sudo apt install build-essential
$ sudo apt-get install libgmp-dev
$ sudo apt-get install libsodium-dev
$ sudo apt-get install nasm
```


## Setup Enviroment

### Clone responsitory and setup environment
```
$ git clone git@github.com:BkCrypt0/BkCrypto-Server.git
$ cd BkCrypto-Server
$ npm install --save-dev
```

### Install Submodule
```
$ git submodule init
$ git submodule update
$ cd rapidsnark && git checkout main
$ npm install
$ git submodule init
$ git submodule update
$ npx task createFieldSources
$ npx task buildProver
$ cd ..

```
### Config url and ENVIRONMENT_VARIABLE in .env
- Copy and update from file .env_example

### Deploy Database
```
$ docker-compose up --build -d 
```

### Add admin roles for server
```
$ make adminRoles
```

### Add zkey and verifykey of circuit
- Copy *.wasm, *.zkey, generate_witness.js, witness_calculator.js  from BkCrypt0-Resources/KYC_circuit/claims/claim_${version} to ./circuits/claim/
- Copy *.wasm, *.zkey, generate_witness.js, witness_calculator.js from BkCrypt0-Resources/KYC_circuit/revokes/revoke_${version} to ./circuits/revoke/
- Copy *.wasm, *.zkey ,generate_witness.js, witness_calculator.js from BkCrypt0-Resources/KYC_circuit/unrevoke to ./circuits/unrevoke/

### Run server
```
$ npm start
```

## API

Link Swagger : https://app.swaggerhub.com/apis-docs/rikikudohust/BkCrypto/1.0.0#/
