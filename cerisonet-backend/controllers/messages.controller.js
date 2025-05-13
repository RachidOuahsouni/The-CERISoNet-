const { MongoClient, ObjectId, mongoUrl, dbName } = require("../services/db.mongo");
const pool = require("../services/db.pg");

exports.getMessages = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const client = await MongoClient.connect(mongoUrl);
    const db = client.db(dbName);
    const messages = await db.collection("CERISoNet").find().skip(skip).limit(limit).toArray();

    // Récupérer les IDs des utilisateurs (créateurs et commentateurs)
    const userIds = new Set();
    messages.forEach((msg) => {
      if (!isNaN(msg.createdBy)) userIds.add(msg.createdBy);
      msg.comments.forEach((comment) => {
        if (!isNaN(comment.commentedBy)) userIds.add(comment.commentedBy);
      });
    });

    // Récupérer les pseudos des utilisateurs depuis PostgreSQL
    const query = 'SELECT id, pseudo,avatar FROM fredouil.compte WHERE id = ANY($1::int[])';
    const result = await pool.query(query, [Array.from(userIds)]);
    const users = result.rows.reduce((acc, user) => {
      acc[user.id] = { pseudo: user.pseudo, avatar: user.avatar };
      return acc;
    }, {});

    // Enrichir les messages
    const enrichedMessages = messages.map((msg) => ({
      ...msg,
      createdByName: users[msg.createdBy]?.pseudo || "Utilisateur inconnu",
      avatar: users[msg.createdBy]?.avatar || null,
      comments: msg.comments.map((comment) => ({
        ...comment,
        commentedByName: users[comment.commentedBy]?.pseudo || "Utilisateur inconnu",
        commentedByAvatar: users[comment.commentedBy]?.avatar || null,
      })),
    }));

    res.json(enrichedMessages);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.addComment = async (req, res) => {
  const messageId = parseInt(req.params.id);
  const { text, commentedBy } = req.body;
  if (!text || !commentedBy) {
    return res.status(400).json({ message: "Texte du commentaire et ID de l'utilisateur requis" });
  }
  try {
    const client = await MongoClient.connect(mongoUrl);
    const db = client.db(dbName);
    const commentId = new ObjectId().toString();
    const result = await db.collection("CERISoNet").updateOne(
      { _id: messageId },
      {
        $push: {
          comments: {
            _id: commentId,
            text: text,
            commentedBy: commentedBy,
            date: new Date().toISOString().split('T')[0],
            hour: new Date().toISOString().split('T')[1].split('.')[0],
          },
        },
      }
    );
    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "Commentaire ajouté avec succès." });
    } else {
      res.status(404).json({ message: "Message non trouvé." });
    }
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};