// Utilitário para a chamada da ViaCEP, onde vamos poder chamar essa função em qualquer outro arquivo
import axios from 'axios';

export const buscarEnderecoPorCep = async (cep: string) => {
  try {
    // Chama a API ViaCEP com o CEP fornecido
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

    const { logradouro, bairro, localidade, uf, cep: postalCode, erro } = response.data;

    // Verifica se a API retornou um erro (CEP inválido)
    if (erro) {
      throw new Error('CEP inválido ou não encontrado.');
    }

    // Retorna os dados do endereço
    return {
      street: logradouro,
      neighborhood: bairro,
      city: localidade,
      state: uf,
      postalCode,
    };
  } catch (error: any) {
    throw new Error(`Erro ao buscar endereço: ${error.message}`);
  }
};