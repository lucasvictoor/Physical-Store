// Rotas relacionadas às lojas físicas
import { Router } from 'express';
import { createStore } from '../controllers/storeController';

const router = Router();

// Rota para criar uma loja
router.post('/', createStore);

export default router;