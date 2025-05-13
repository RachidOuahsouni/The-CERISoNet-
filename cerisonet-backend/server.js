const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { sessionOptions } = require('./services/session');
const authRoutes = require('./routes/auth.routes');
const messagesRoutes = require('./routes/messages.routes');
const pool = require('./services/db.pg'); // Import de la connexion PostgreSQL
const connectedUsers = new Map(); // socket.id -> { id, pseudo }

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(session(sessionOptions));
app.use(authRoutes);
app.use(messagesRoutes);

// Ajouter une route pour obtenir les utilisateurs connectés
app.get('/users/online', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, pseudo, avatar, nom, prenom FROM fredouil.compte WHERE statut_connexion = 1'
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur PostgreSQL:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// SSL
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
const HTTPS_PORT = 3140;
const httpsServer = https.createServer(options, app);

// Ajout de Socket.io
const { Server } = require('socket.io');
const io = new Server(httpsServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
  console.log('Client connecté :', socket.id);

  socket.on('userConnected', async (user) => {
    // Mettre à jour le statut de connexion dans PostgreSQL
    await pool.query(
      'UPDATE fredouil.compte SET statut_connexion = 1 WHERE id = $1',
      [user.id]
    );
    
    // Récupérer les infos complètes de l'utilisateur
    const { rows } = await pool.query(
      'SELECT id, pseudo, avatar, nom, prenom FROM fredouil.compte WHERE id = $1',
      [user.id]
    );
    
    if (rows.length > 0) {
      const fullUser = rows[0];
      connectedUsers.set(socket.id, fullUser);
      
      // Notifier tout le monde qu'un utilisateur s'est connecté
      io.emit('notification', { type: 'login', user: fullUser });
      
      // Envoyer la liste mise à jour des utilisateurs connectés
      broadcastOnlineUsers();
    }
  });

  socket.on('userDisconnected', async (user) => {
    // Mettre à jour le statut de connexion dans PostgreSQL
    await pool.query(
      'UPDATE fredouil.compte SET statut_connexion = 0 WHERE id = $1',
      [user.id]
    );
    
    connectedUsers.delete(socket.id);
    
    // Notifier tout le monde qu'un utilisateur s'est déconnecté
    io.emit('notification', { type: 'logout', user });
    
    // Envoyer la liste mise à jour des utilisateurs connectés
    broadcastOnlineUsers();
  });

  socket.on('disconnect', async () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      // Mettre à jour le statut de connexion dans PostgreSQL
      await pool.query(
        'UPDATE fredouil.compte SET statut_connexion = 0 WHERE id = $1',
        [user.id]
      );
      
      connectedUsers.delete(socket.id);
      
      // Notifier tout le monde qu'un utilisateur s'est déconnecté
      io.emit('notification', { type: 'logout', user });
      
      // Envoyer la liste mise à jour des utilisateurs connectés
      broadcastOnlineUsers();
    }
    console.log('Client déconnecté :', socket.id);
  });
});

// Fonction pour diffuser la liste des utilisateurs connectés
async function broadcastOnlineUsers() {
  try {
    const { rows } = await pool.query(
      'SELECT id, pseudo, avatar, nom, prenom FROM fredouil.compte WHERE statut_connexion = 1'
    );
    io.emit('usersOnline', rows);
  } catch (err) {
    console.error('Erreur PostgreSQL:', err);
  }
}

httpsServer.listen(HTTPS_PORT, () => {
  console.log(`Serveur HTTPS en écoute sur le port ${HTTPS_PORT}`);
});