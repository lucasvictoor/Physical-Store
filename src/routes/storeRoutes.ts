// Rotas relacionadas às lojas físicas
import { Router } from 'express';
import { createStore, getStores } from '../controllers/storeController';

const router = Router();

// Rota criação loja
router.post('/', createStore);
// Rota listar all lojas
router.get('/', getStores);

export default router;