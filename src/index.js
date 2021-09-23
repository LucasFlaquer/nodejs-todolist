const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];
function findUserByUsername(username) {
  return users.find(user => user.username === username)
}

function checksExistsUserAccount(request, response, next) {
  const {username } = request.headers
  const user = findUserByUsername(username)
  if(user) {
    request.user = user
    next()
  }
  return response.status(400).json({error: 'user not found'})
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  if(findUserByUsername(username)) return response.status(400).json({error: 'user already exists'})
  const user = {
    id: uuidv4(),
    name, 
    username,
    todos: []
  }
  users.push(user)
  return response.json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const createdTodo = {
    id: uuidv4(),
	  title,
	  done: false, 
	  deadline: new Date(deadline), 
	  created_at: new Date(),
  }
  user.todos.push(createdTodo)
  
  return response.status(201).json(createdTodo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params
  const todo = user.todos.find(todo => todo.id === id)
  if(!todo) return response.status(404).json({error: 'Not Found'})
  todo.title = title,
  todo.deadline = new Date(deadline)
  return response.json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const todo = user.todos.find(todo => todo.id === id)
  if(!todo) return response.status(404).json({error: 'Not Found'})
  todo.done = true
  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const todo = user.todos.find(todo => todo.id === id)
  if(!todo) return response.status(404).json({error: 'Not Found'})
  user.todos.splice(todo, 1)
  return response.status(204).send()
});

module.exports = app;