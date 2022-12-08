# BkCrypto-Server Document
# Deploy Guide

## Prerequire
- Docker
- Node
- Git

### Clone responsitory and setup environment
```
$ git clone git@github.com:BkCrypt0/BkCrypto-Server.git
$ cd BkCrypto-Server
$ npm install --save-dev
```

### Dependencides
```
$ sudo apt install build-essential
$ sudo apt-get install libgmp-dev
$ sudo apt-get install libsodium-dev
$ sudo apt-get install nasm
```

### Table Content
1. Overview
2. Setup Environment
3. API Document

## Overview

Backend Server for Self Sovereign Identity

## Setup Environment

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

[Swagger](https://app.swaggerhub.com/apis-docs/rikikudohust/BkCrypto/1.0.0#/)

### API Document

1. Get Roles of users

    two roles:

    - admin
    - user

```
GET /authen?publicKeyX={value1}&publicKeyY={value2}

reponse: 
 - 201:
    application/json: 
    {
        roles: 0
    }
```

2. Get user information

- Description: Fetch user information and user identity status
```
GET /users?authen?publicKeyX={value1}&publicKeyY={value2}


response:
 - 201: 
    application/json:
    {
        "issuer": [
            "1891156797631087029347893674931101305929404954783323547727418062433377377293",
            "14780632341277755899330141855966417738975199657954509255716508264496764475094"
        ],
        "claimer": [
            "1891156797631087029347893674931101305929404954783323547727418062433377377293",
            "14780632341277755899330141855966417738975199657954509255716508264496764475094"
        ],
        "CCCD": "012345678910",
        "firstName": "Nguyen Trung",
        "lastName": "Hieu",
        "sex": 0,
        "DoBdata": 20010102,
        "BirthPlace": 38,
        "claimAt": 0,
        "status": 0,
        "issueAt": "1669617519295"
    }
```

3. Get user proof path

- Description: Fetch user proof path in merkle tree

```
GET /users/proof?authen?publicKeyX={value1}&publicKeyY={value2}

response:
 - 201:
    {
        "rootRevoke": "0",
        "siblingsRevoke": [...],
        "oldKeyRevoke": "0",
        "oldValueRevoke": "0",
        "isOld0Revoke": 1,
        "rootClaims": "1403719690521673616444529525301835627213199",
        "siblingsClaims": [...],
        "key": 0,
        "value": "1089512809285548084453919308754051473802178826418"
    }

```

4. Issue new claim (identity)

- Decription: Issue new identity card for holder which will be claimed that identity card

```
POST /issue

request-body:

 application/json:
    {
    "issuer": [
        "1891156797631087029347893674931101305929404954783323547727418062433377377293",
        "14780632341277755899330141855966417738975199657954509255716508264496764475094"
    ],
    "CCCD": "0123456789",
    "firstName": "Nguyen",
    "lastName": "Hieu",
    "sex": 0,
    "DoBdate": 20010201,
    "BirthPlace": 38
    }
```
5. Get all issue information

- Description: Get all issue information to track and update their status

```
GET /issue

response:
 - 201:
    application/json:
        [
            {issue_object_1},
            {issue_object_2}
        ]
```

6. Build claim data to publish root to smart contract

- Description: Use roll up to build claim data and generate proof to update smart contract

```
GET /published/data

response:
 - 201:
    application/json:
        {
            "proof": {
            "pi_a": [
                "9772250495159288569269355123660234155713338416405143305885373854548892415945",
               "21717280272544389304121909541525432613868091159251782849916774560268652811535"
            ],
            "pi_b": [
                [
                "1098010472920637962857156031036400361186461244933970985121493243175533754384",
                "17407082705508861032254858614165730023936522387447269078073542735181839268626"
                ],
                [
                "13054702725764418222458526307806209657077912682581272166375508256175208748638",
                "10107155799016604097319129141009550416225979800861705497128506089131101753013"
                ]
            ],
            "pi_c": [
              "10503333490723643155796524702334367318223933976232410608887454665274554082504",
              "16655828958787895288612108236721609777388904716784981438225026323204786362672"
            ]
          },
          "publicSignals": [
            "7072390497904193087706094913913077993327483174409842970135480297416638120664",
            "8458905536596503408276018648109539020952906771675717820760252279679922929942",
            "10988358289926121885898219922266172100008607201619000884992880906680582934528",
            "10183031133209489092520886599753535346035282770895759210360124748756570180147"
          ]
}
```

7. Publish root to smart contract

- Description: update data to smart contract

```
POST /published

request-body:
    application/json:
        {
            "root": "21319a3d3ef"
        }
```

8. Generate Proof to revoke indentity card

- Description: Generate zk Proof to verify revoke action

```
POST /revoke/data

request-body:
    application/json:
        {
            CCCDs: [
                1, 2, 3
            ]
        }

response: 
 - 201: 
    application/json:
    {
        "proof": {
            "pi_a": [...],
            "pi_b": [[...],[...] ],
            "pi_c": [...]
        },
        "publicSignals": [...]
    }
```

9. Revoke Identity Card

- Description: Revoke Identity Cards

```
POST /revoke

request-body:
    application/json:
        {
            "root": "123d123e12a4f",
            "CCCDs": [1,2,3]
        }
```

10. Generate zk Proof to unrevoke an identity card

- Description: Generate zk Proof to verify unrevoke action

```
POST /unrevoke/data
request-body:
    application/json:
        {
            CCCDs: 3
        }

response: 
 - 201: 
    application/json:
    {
        "proof": {
            "pi_a": [...],
            "pi_b": [[...],[...] ],
            "pi_c": [...]
        },
        "publicSignals": [...]
    }
```

11. Unrevoke Identity Card

- Description: Unrevoke Identity Cards

```
POST /unrevoke

request-body:
    application/json:
        {
            "root": "123d123e12a4f",
            "CCCDs": 1 
        }
```







