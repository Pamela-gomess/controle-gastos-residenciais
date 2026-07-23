# Controle de Gastos Residenciais 

Aplicação web desenvolvida para o gerenciamento de despesas e receitas familiares, com regras de negócio específicas para o controle financeiro por pessoa e restrições por faixa etária.

## Tecnologias Utilizadas

Este projeto foi construído utilizando uma arquitetura separada (Backend e Frontend):
* **Backend:** C# (.NET / ASP.NET Core Web API)
* **Frontend:** React com TypeScript e Axios
* **Estilização:** CSS Modular / Inline

## Regras de Negócio Implementadas

1. **Cadastro de Pessoas:** Gerenciamento de moradores da residência informando nome e idade.
2. **Restrição por Idade:** Pessoas **menores de 18 anos** são bloqueadas automaticamente de cadastrar transações do tipo *Receita*, permitindo apenas o registro de *Despesas*.
3. **Cálculo de Totais em Tempo Real:** O painel de resumo calcula instantaneamente o total de receitas, despesas e o saldo líquido por pessoa e de forma geral na residência, sem necessidade de atualizar a página.
4. **Persistência de Dados:** Integração completa entre o Front-end em React e a API REST em C#.

## Como Executar o Projeto Localmente

### 1. Clonar o Repositório
```bash
git clone [https://github.com/Pamela-gomess/controle-gastos-residenciais.git](https://github.com/Pamela-gomess/controle-gastos-residenciais.git)]
