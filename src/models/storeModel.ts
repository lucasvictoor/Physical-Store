// Model para as lojas físicas
import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome da loja é obrigatório'],
    minlength: [3, 'O nome deve ter no mínimo 3 caracteres'],
  },
  address: {
    street: {
      type: String,
      required: [true, 'A rua é obrigatória'],
    },
    city: {
      type: String,
      required: [true, 'A cidade é obrigatória'],
    },
    state: {
      type: String,
      required: [true, 'O estado é obrigatório'],
    },
    postalCode: {
      type: String,
      required: [true, 'O CEP é obrigatório'],
      match: [/^\d{5}-?\d{3}$/, 'CEP inválido, deve estar no formato 00000-000'],
    },
    number: {
      type: String,
      required: [true, 'O número é obrigatório'],
    }
  }
});

const Store = mongoose.model('Store', storeSchema);
export default Store;