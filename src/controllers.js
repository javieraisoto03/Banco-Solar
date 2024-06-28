// controllers.js
import pool from './database.js';

export const getUsuarios = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createUsuario = async (req, res) => {
  const { nombre, balance } = req.body;
  try {
    const result = await pool.query('INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING *', [nombre, balance]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUsuario = async (req, res) => {
  const { id, nombre, balance } = req.body;
  try {
    const result = await pool.query('UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3 RETURNING *', [nombre, balance, id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUsuario = async (req, res) => {
  const { id } = req.query;
  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createTransferencia = async (req, res) => {
  const { emisor, receptor, monto } = req.body;
  try {
    await pool.query('BEGIN');

    const emisorResult = await pool.query('UPDATE usuarios SET balance = balance - $1 WHERE id = $2 RETURNING nombre', [monto, emisor]);
    const receptorResult = await pool.query('UPDATE usuarios SET balance = balance + $1 WHERE id = $2 RETURNING nombre', [monto, receptor]);

    if (emisorResult.rows.length === 0 || receptorResult.rows.length === 0) {
      throw new Error('Emisor o receptor no encontrado');
    }

    const emisorNombre = emisorResult.rows[0].nombre;
    const receptorNombre = receptorResult.rows[0].nombre;

    const transferenciaResult = await pool.query('INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, NOW()) RETURNING *', [emisor, receptor, monto]);

    await pool.query('COMMIT');

    const transferencia = transferenciaResult.rows[0];
    transferencia.emisorNombre = emisorNombre;
    transferencia.receptorNombre = receptorNombre;

    res.status(201).json(transferencia);
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
};

export const getTransferencias = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id, 
        t.monto, 
        t.fecha, 
        e.nombre AS emisorNombre, 
        r.nombre AS receptorNombre 
      FROM 
        transferencias t 
      JOIN 
        usuarios e ON t.emisor = e.id 
      JOIN 
        usuarios r ON t.receptor = r.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
