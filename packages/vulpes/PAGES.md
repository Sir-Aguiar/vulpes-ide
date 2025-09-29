# Definições do arquivo

Neste arquivo estarão definidas as páginas/telas da aplicação e as funcionalidades de cada uma. Seguiremos o padrão de:

- `Caminho`: O caminho da página. Deve ser único e é usado para acessar a página.
- `Objetivo`: O objetivo da página. Deve ser uma descrição clara do que a página deve fazer.
- `Detalhes`: Detalhes adicionais sobre a página. Pode incluir informações sobre o layout, componentes, etc.

## Home page
- `Caminho`: /
- `Objetivo`: Tela inicial da aplicação, onde o usuário será apresentado à uma visão do sistema e suas principais funcionalidades. Sendo o principal ponto de entrada e de aprendizado sobre como o sistema funciona

## Cadastro de atividade
- `Caminho`: /new-task
- `Objetivo`: Tela para professores cadastrarem suas atividades. Nesta tela será feita a inserção de detalhes da tarefa, códigos e etc...
- `Detalhes`: Esta página possuirá um formulário de passos, onde primeiro serão inseridas as informações bases da atividade: Título e Descrição. No próximo passo já será inserida a definição da função em Portugol, isto é importante para que possam ser extraídas informações dos tipos e parâmetros. No último passo do formulário será a definição dos testes da atividade. Para que uma atividade passe como correta serão executados testes no código produzido pelo aluno, e estes testes devem ser definidos de antemão. O professor precisa específicar quais parâmetros devem entrar na função, e com base nesses parâmetros esperar uma saída.
- `Proposta de atualização`:
  - Adicionar detecção de padrões e não tipos e retornos específicos, assim poderão ser feitos testes mais randômicos e esperar saídas que são mais dinâmicas em nos imutáveis.
  - Análise dos tipos de atividades e se o algoritmo de execução é capaz de lidar com todos os tipos que serão inseridos e esperados.

