// Rotas relacionadas às lojas físicas
import { Router } from 'express';
import { createStore, getStores, deleteStore, getStoreById, buscarLojasProximas } from '../controllers/storeController';

const router = Router();

// Rota criação loja
router.post('/', createStore);
// Rota listar all lojas
router.get('/', getStores);
// Rota para deletar uma loja por ID
router.delete('/:id', deleteStore);
// Rota para obter uma loja por ID
router.get('/:id', getStoreById);
// Rota para buscar lojas próximas
router.post('/stores/buscar-lojas', buscarLojasProximas);

export default router;