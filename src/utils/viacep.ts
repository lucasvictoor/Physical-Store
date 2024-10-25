// Utilitário para a chamada da ViaCEP, onde vamos poder chamar essa função em qualquer outro arquivo;
import axios from 'axios';

export const buscarEnderecoPorCep = async (cep: string) => {
  try {
    // Chama a API ViaCEP com o CEP fornecido
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

    // Verifica se a API retornou um erro (CEP inválido)
    if (response.data.erro) {
      throw new Error('CEP inválido ou não encontrado.');
    }

    // Retorna os dados do endereço
    return {
      street: response.data.logradouro,
      neighborhood: response.data.bairro,
      city: response.data.localidade,
      state: response.data.uf,
      postalCode: response.data.cep,
    };
  } catch (error: any) {
    throw new Error(`Erro ao buscar endereço: ${error.message}`);
  }
};