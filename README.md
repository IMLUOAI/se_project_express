# WTWR (What to Wear?): Back End / postman text process 2nd.

In this Project 13, we still keeping a test work with the Postman based on the foundation of the project 12. The most core part in this stage is to center the three key steps in the entire APIs. Like the Identification, authentication, and authorization. We must to familiar know how each of the steps play a role between user and us(engineers) in the back-end. According to the specific error status code which was refelcted from the Postman. Our back-end engineer will be able to ensure the users' signup, singin, like, dislike, and delete the unlike items successfuly and smoothly. In which the validator plays a very important role.

In my code, I create an independent folder for the handleError, which will be more efficiency and consistenly for diagonose the various erros in actual APIs work.

## The three key security steps:

`Identification`

`authentication`

`authorization`

## Three entities matters: these are the key things to limit the range for searching or validating during the singup process of API.

`1. special characters: / Quantifiers{ *, +, ?, | }; \w\W, \d\D, \s\S, ^, $ /`
`2. flags: i, m, u, y, s`
`3. Regex Methods: string.match() or ReGex.test()`

## Running the Project

`npm run lint`

`npm run start` — to launch the server

`npm run dev` — to launch the server with the hot reload feature

### Error Handling Testing Tool

postman

### Main Coding Tools

Express.js Postman, MongooseDB

### Localhost

http://localhost:3001;
