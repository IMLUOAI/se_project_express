# WTWR (What to Wear?): Google cloud deployment and advance middleware

Along with the end of the Sprint 15, this project WTWR has set up it's deployment on the Google cloud successfully by far. The three domains' URL are listed below, users are able to click them to visit our web app globally now. Currently, I have the VM activated in the local machine, and has the PM2 installed to keep the app run stablly. Plus, in the remote server, I also have the backend and fronted code stored there. Back to the backend code, I have the validation.js, JOi, and celebrate were set up in the middleware directory to ensure all of the potential errors could be centralized for better managing in the entire activity of the interaction. Other than this, I also have the implemented logger for both request and errors using the winston package in the backend code, where you can find it from the middleware directory as well.

//_In this Project 13, we still keeping a test work with the Postman based on the foundation of the project 12. The most core part in this stage is to center the three key steps in the entire APIs. Like the Identification, authentication, and authorization. We must to familicar know how each of the steps play a role between user and us(engineers) in the back-end. According to the specific error status code which was refelcted from the Postman. Our back-end engineer will be able to ensure the users' signup, singin, like, dislike, and delete the unlike items successfuly and smoothly. In which the validator plays a very important role._//

//_In my code, I create an independent folder for the handleError, which will be more efficiency and consistenly for diagonose the various erros in actual APIs work._//

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

### Main development Tools

Express.js Postman, MongooseDB

### Localhost

http://localhost:3001;

## Link for se_project_express:

[github](https://github.com/IMLUOAI/se_project_express.git)

## Link of the domain:

https://wtwr.ugo.si;
https://www.wtwr.ugo.si;
https://api.wtwr.ugo.si;
