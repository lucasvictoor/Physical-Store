// Rotas relacionadas às lojas físicas
import { Router } from 'express';
import { createStore, getStores, deleteStore, getStoreById } from '../controllers/storeController';

const router = Router();

// Rota criação loja
router.post('/', createStore);
// Rota listar all lojas
router.get('/', getStores);
// Rota para deletar uma loja por ID
router.delete('/:id', deleteStore);
// Rota para obter uma loja por ID
router.get('/:id', getStoreById);

export default router;