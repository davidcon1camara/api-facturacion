const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const app = express();
const port = 3000;
const cors = require('cors');

require('dotenv').config();

app.use(cors({
  origin: 'http://localhost:4200',  // permite solo desde Angular
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Conexión a MongoDB Atlas
const uri = 'mongodb+srv://comohagoapps:IAAXlrTv8L0MzFJD@cluster0.hfwdrn0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión:', err));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

const Usuario = require('./models/Usuario');

// Crear usuario
app.post('/usuarios', async (req, res) => {
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    res.status(201).send(usuario);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Listar usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.send(usuarios);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Login Usuarios
app.post('/login', async (req, res) => {
  const { email, contraseña } = req.body;
  const usuario = await Usuario.findOne({ email });
  if (!usuario) return res.status(401).send('Usuario no encontrado');

  const esValido = await bcrypt.compare(contraseña, usuario.contraseña);
  if (!esValido) return res.status(401).send('Contraseña incorrecta');

  const token = jwt.sign({ id: usuario._id, email: usuario.email }, 'miBtmJkrRhd764!', { expiresIn: '1h' });
  res.json({ token });
});

//Borrar el usuario
app.delete('/usuarios/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(id);

    if (!usuarioEliminado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario eliminado correctamente', usuario: usuarioEliminado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario' });
  }
});

// Listar clientes
let clientes = [];
let idActual = 1;

// Obtener todos los clientes
app.get('/api/clientes', (req, res) => {
  res.json(clientes);
});

// Obtener cliente por id
app.get('/api/clientes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cliente = clientes.find(c => c.id === id);
  if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
  res.json(cliente);
});

// Crear cliente
app.post('/api/clientes', (req, res) => {
  const cliente = { id: idActual++, ...req.body };
  clientes.push(cliente);
  res.status(201).json(cliente);
});

// Actualizar cliente
app.put('/api/clientes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = clientes.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ message: 'Cliente no encontrado' });
  clientes[index] = { id, ...req.body };
  res.json(clientes[index]);
});

// Eliminar cliente
app.delete('/api/clientes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = clientes.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ message: 'Cliente no encontrado' });
  clientes.splice(index, 1);
  res.status(204).send();
});




