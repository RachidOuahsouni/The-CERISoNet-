const pool = require("../services/db.pg");
const { hashPassword } = require("../utils/hash");

exports.login = async (req, res) => {
  const email = req.body.login;
  const password = req.body.password;
  try {
    const hashedPassword = hashPassword(password);
    const query = 'SELECT * FROM fredouil.compte WHERE mail = $1 AND motpasse = $2';
    const result = await pool.query(query, [email, hashedPassword]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      req.session.user = { id: user.id, pseudo: user.pseudo, email: user.mail };
      
      // Mettre à jour le statut de connexion
      await pool.query(
        'UPDATE fredouil.compte SET statut_connexion = 1 WHERE id = $1',
        [user.id]
      );
      
      res.json({
        message: `Bienvenue ${user.pseudo}`,
        user: {
          id: user.id,
          pseudo: user.pseudo,
          email: user.mail,
          avatar: user.avatar,
          nom: user.nom,
          prenom: user.prenom
        }
      });
    } else {
      res.status(401).json({ message: "Identifiants incorrects" });
    }
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.logout = async (req, res) => {
  if (req.session.user) {
    try {
      // Mettre à jour le statut de connexion
      await pool.query(
        'UPDATE fredouil.compte SET statut_connexion = 0 WHERE id = $1',
        [req.session.user.id]
      );
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut de connexion:', err);
    }
  }
  
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Erreur serveur");
    res.send("Déconnexion réussie. Vous avez été déconnecté.");
  });
};