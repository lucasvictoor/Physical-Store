import mongoose, { Schema, Document } from 'mongoose';

// Interface para loja
export interface IStore extends Document {
  name: string;
  address:{
    street: string;
    city: string;
    state: string;
    postalCode: string;
    number: string;
    latitude: number;
    longitude: number;
  };
}

// Função para validar string não vazias
const isNotEmpty = (value: string) => value.trim().length > 0;

// Esquema da loja
const addressSchema = new Schema({
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
    validate: {
      validator: isNotEmpty,
      message: 'O número não pode ser uma string vazia.',
    },
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
});

const storeSchema = new Schema<IStore>({
  name: {
    type: String,
    required: [true, 'O nome da loja é obrigatório'],
    minlength: [3, 'O nome deve ter no mínimo 3 caracteres'],
  },
  address: {
    type: addressSchema,
    required: true,
  },
});

// Configuração para remover o campo __v na resposta JSON
storeSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const Store = mongoose.model<IStore>('Store', storeSchema);
export default Store;