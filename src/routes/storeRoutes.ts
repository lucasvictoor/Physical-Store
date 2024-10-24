// Rotas relacionadas às lojas físicas
import { Router } from 'express';
import { createStore, getStores, deleteStore } from '../controllers/storeController';

const router = Router();

// Rota criação loja
router.post('/', createStore);
// Rota listar all lojas
router.get('/', getStores);
// Rota para deletar uma loja por ID
router.delete('/:id', deleteStore);

export default router;