const path = require('path');
const logger = require('../logger');

const express = require('express');
const xss = require('xss');
const NamesService = require('./names-service');

const namesRouter = express.Router();
const jsonBodyParser = express.json();

const serializeName = name => ({
    id: name.id,
    name: xss(name.name),
    password: xss(name.password)
  });
  
namesRouter.use(jsonBodyParser)

namesRouter
.route('/')
.get((req, res, next) => {
    NamesService.getAllNames(req.app.get('db'))
      .then((names) => {
        res.json(names.map(serializeName));
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { password, name } = req.body;

    for (const field of ['name', 'password'])
        if (!req.body[field])
            return res.status(400).json({
            error: `Missing '${field}' in request body`,
            });

        const passwordError = NamesService.validatePassword(password);
    
        if (passwordError)
            return res.status(400).json({ error: passwordError });

        NamesService.hasUserWithUserName(
            req.app.get('db'),name)
            .then(hasUserWithUserName => {
            if (hasUserWithUserName)
                return res.status(400).json({ error: `Name already taken` });

                return NamesService.hashPassword(password)
                    .then((hashedPassword) => {
                        const newName = {
                            name,
                            password: hashedPassword,
                            };
                
                    return NamesService.insertUser(
                    req.app.get('db'),
                    newName
                    )
                    .then(name => {
                        res
                        .status(201)
                        .location(path.posix.join(req.originalUrl, `/${name.id}`))
                        .json(NamesService.serializeName(name));
                    });
                });

    
  })
  .catch(next);
})

.delete((req, res, next) => {
  // console.log(name_id)
  // console.log('Hello')
  const { name } = req.body
  NamesService.deleteName(
    req.app.get('db'),
    name
  )
    .then((numRowsAffected) => {
      logger.info(`Name with id ${name} deleted.`);
      res.status(204).end();
    })
    .catch(next);
})

namesRouter
  .route('/:name_id')
  .all((req, res, next) => {
    const { name_id } = req.params;
    NamesService.getById(req.app.get('db'), name_id)
      .then((name) => {
        if (!name) {
          logger.error(`Name with id ${name_id} not found.`);
          return res.status(404).json({
            error: { message: `Name Not Found` },
          });
        }
        res.name = name;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeName(res.name));
    // res.json(serializeName(res.password))
  })
  .patch(jsonBodyParser, (req,res, next) => {
    const { name, password} = req.body
    const newpassword = password
    const { name_id } = req.params;
    NamesService.changePassword(
      req.app.get('db'),
      password,
      newpassword,
      name_id,
    )
    .then(() => {
      res.sendStatus(204)
    })
     .catch(next)
});

  
  module.exports = namesRouter;