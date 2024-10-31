# Physical Store

## :octocat: Integrantes

- [Lucas Victor](https://github.com/lucasvictoor)

## :page_with_curl: Sobre o projeto

Este projeto foi desenvolvido como parte do estágio na CompassUOL para avaliar habilidades técnicas de backend, focado na criação de um sistema de Physical Store. A aplicação representa uma rede física de lojas para uma eCommerce, onde os usuários podem localizar as unidades mais próximas com base no CEP fornecido.

O sistema integra-se com a API do ViaCEP para obter dados de endereço e utiliza uma API de geocodificação para calcular a proximidade entre as lojas e o CEP de consulta. Como o foco do projeto é o desenvolvimento backend, a aplicação funciona exclusivamente via terminal, sem interface gráfica.

## :round_pushpin: Objetivos

- Criar um sistema backend para gerenciar lojas físicas associadas a uma loja eCommerce.
- Permitir a busca de lojas físicas dentro de um raio de 100km a partir de um CEP fornecido pelo usuário.
- Retornar a loja mais próxima ao usuário, com base em cálculos de distância geográfica.
- Exibir mensagens informativas caso nenhuma loja esteja dentro do raio especificado.
- Manter uma estrutura de código organizada e modular, com boas práticas de desenvolvimento.
- Implementar logs informativos e de erros para monitorar a aplicação.


## :hammer_and_wrench: Tecnologias usadas

#### TypeScript
* Para tipagem estática e maior segurança no desenvolvimento.

#### Node.Js
* Com Express para o servidor backend e roteamento de APIs.

#### API Externas
* ViaCEP para consulta de informações de endereço a partir de um CEP.
* Google Geocoding API para conversão de CEPs em coordenadas geográficas (latitude e longitude).

#### Banco de Dados
* MongoDB para armazenar dados das lojas físicas, com a biblioteca Mongoose para modelagem de dados.

#### Bibliotecas Adicionais
* Axios para chamadas HTTP às APIs externas.
* Winston para geração e gerenciamento de logs da aplicação.

## :construction: Status do Projeto
Concluído