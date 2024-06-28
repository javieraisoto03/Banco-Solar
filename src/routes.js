// routes.js
import { Router } from 'express';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, createTransferencia, getTransferencias } from './controllers.js';

const router = Router();

router.get('/usuarios', getUsuarios);
router.post('/usuario', createUsuario);
router.put('/usuario', updateUsuario);
router.delete('/usuario', deleteUsuario);
router.post('/transferencia', createTransferencia);
router.get('/transferencias', getTransferencias);

export default router;
