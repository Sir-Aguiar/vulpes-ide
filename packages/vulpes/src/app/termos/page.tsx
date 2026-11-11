"use client";

import AppNavBar from "@/components/AppNavBar";
import HomeFooter from "@/components/home/HomeFooter";
import { useAppTheme } from "@/providers/ColorModeProvider";
import { Box, Link as MuiLink, Typography } from "@mui/material";
import Link from "next/link";

const UPDATED_AT = "11 de novembro de 2026";

type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] };

type Section = {
  id: string;
  title: string;
  blocks: Block[];
};

const TERMS: Section[] = [
  {
    id: "quem-oferece",
    title: "1. Quem oferece a plataforma",
    blocks: [
      {
        type: "p",
        text: "A Vulpes IDE é uma plataforma educacional para aprender e ensinar programação em Portugol. O controlador dos dados pessoais e o responsável por estes termos é o operador da Vulpes IDE. Pedidos sobre a conta, o conteúdo ou os dados pessoais são feitos pelo relato de bugs, disponível para quem já tem conta, ou por resposta aos e-mails enviados pela plataforma, com o assunto “Privacidade” ou “Termos”.",
      },
    ],
  },
  {
    id: "servico",
    title: "2. O que a plataforma faz",
    blocks: [
      {
        type: "p",
        text: "A Vulpes permite criar conta, entrar em turmas, resolver exercícios de programação, enviar código, receber correção automática e comentários do professor, e, para professores, criar tarefas, listas, prazos e acompanhar o desempenho da turma.",
      },
      {
        type: "p",
        text: "O código em Portugol é executado no próprio navegador. O resultado dessa execução (se a resposta foi considerada correta) é enviado ao servidor junto com o código. A correção automática é um apoio. A avaliação final é do professor ou de quem conduz a atividade.",
      },
    ],
  },
  {
    id: "aceite",
    title: "3. Aceite",
    blocks: [
      {
        type: "p",
        text: "Ao criar uma conta ou continuar usando a plataforma depois de uma atualização destes termos, você declara que leu e concorda com os Termos de Uso e com a Política de Privacidade. Se você não concordar, não crie conta e não use as áreas que exigem login. A navegação na página inicial pública não cria conta.",
      },
    ],
  },
  {
    id: "contas",
    title: "4. Contas e papéis",
    blocks: [
      {
        type: "p",
        text: "Há três papéis:",
      },
      {
        type: "list",
        items: [
          "Aluno: conta criada no cadastro. Pode entrar em turmas, resolver tarefas e enviar código.",
          "Professor: começa como aluno e só passa a professor depois que um administrador analisa e aprova um pedido com documento que comprove o vínculo com uma instituição de ensino. O pedido pode ser recusado.",
          "Administrador: gerencia usuários, pedidos de professor e relatos de problemas.",
        ],
      },
      {
        type: "p",
        text: "Você se compromete a informar nome e e-mail verdadeiros, a manter a senha em sigilo e a não ceder a conta. A sessão permanece válida por 7 dias no navegador em que você entrou. Em computador compartilhado, encerre a sessão ao terminar.",
      },
    ],
  },
  {
    id: "menores",
    title: "5. Menores de 18 anos",
    blocks: [
      {
        type: "p",
        text: "A plataforma pode ser usada por menores de 18 anos, em geral no contexto de uma disciplina ou de uma turma. Quem tem menos de 18 anos só pode criar conta com autorização de um dos pais ou do responsável legal. No caso de criança com menos de 12 anos, essa autorização precisa ser específica para o uso da Vulpes, nos termos do art. 14 da Lei nº 13.709/2018 (LGPD).",
      },
      {
        type: "p",
        text: "Ao criar a conta de um menor, o responsável declara que autoriza o uso e que os dados serão tratados para a atividade educacional descrita nesta página. O responsável pode pedir acesso, correção ou eliminação dos dados pelo canal indicado na seção 1. Contas de menores usadas sem essa autorização podem ser desativadas.",
      },
    ],
  },
  {
    id: "instituicoes",
    title: "6. Uso por instituições de ensino",
    blocks: [
      {
        type: "p",
        text: "Escolas, universidades e outras instituições podem orientar professores e alunos a usar a Vulpes. Nesta versão não existe contrato entre a Vulpes e a instituição: a instituição não contrata o serviço, não administra a base de dados e não recebe, de forma automática, cópia das informações da plataforma.",
      },
      {
        type: "p",
        text: "O professor que cria a turma é quem conduz a atividade. Ele vê os dados dos alunos daquela turma para fins pedagógicos e é responsável pelo conteúdo das tarefas, pelos prazos, pelos pesos e pelo teor dos comentários que escreve. Dados de alunos não devem ser usados para finalidade diferente da atividade da turma.",
      },
    ],
  },
  {
    id: "condutas",
    title: "7. Condutas não permitidas",
    blocks: [
      {
        type: "list",
        items: [
          "Manipular o resultado da correção automática, o limite de envios ou outros controles da plataforma.",
          "Enviar como seu o código de outra pessoa, quando a atividade exigir autoria própria.",
          "Enviar código feito para prejudicar o serviço, o navegador ou os dados de terceiros.",
          "Informar dados falsos ou enviar documento falso no pedido para se tornar professor.",
          "Usar a plataforma para assediar, expor ou constranger outra pessoa.",
          "Incluir, em relato de bug ou em captura de tela, dados pessoais de terceiros que não sejam necessários para descrever o problema.",
          "Tentar acessar conta, turma ou dado de outra pessoa sem autorização.",
        ],
      },
      {
        type: "p",
        text: "O descumprimento pode levar à recusa do pedido de professor, à remoção de conteúdo e à desativação da conta.",
      },
    ],
  },
  {
    id: "conteudo",
    title: "8. Conteúdo e propriedade intelectual",
    blocks: [
      {
        type: "p",
        text: "O código que você envia continua sendo seu. Você concede à Vulpes a licença necessária para armazená-lo, exibi-lo a você, ao professor da turma e aos administradores, e para registrar o resultado da correção.",
      },
      {
        type: "p",
        text: "A tarefa criada pelo professor continua sendo dele. Ele autoriza a exibição aos alunos da turma e, se marcar a tarefa como pública, a qualquer visitante da plataforma. Tarefa pública mostra o enunciado, não as submissões dos alunos.",
      },
      {
        type: "p",
        text: "Componentes de interpretação e execução de Portugol derivados do Portugol Webstudio são licenciados sob a GPL-3.0. Essa licença não se estende ao código e às tarefas criados pelos usuários.",
      },
    ],
  },
  {
    id: "visibilidade",
    title: "9. Quem vê o quê",
    blocks: [
      {
        type: "list",
        items: [
          "O professor da turma vê o nome, o e-mail, a instituição, o código enviado, o resultado e as datas de envio dos alunos da turma.",
          "Alunos da mesma turma veem o nome e o e-mail uns dos outros.",
          "Alunos veem o nome e o e-mail do professor da turma e o nome de quem criou a tarefa.",
          "Administradores veem a lista de usuários, os pedidos para se tornar professor (incluindo o documento) e os relatos de bug.",
        ],
      },
    ],
  },
  {
    id: "comunicacoes",
    title: "10. Comunicações",
    blocks: [
      {
        type: "p",
        text: "A Vulpes envia e-mail apenas para a operação da conta: redefinição de senha, confirmação de troca de e-mail, resposta ao pedido de professor e aviso de relato de bug aos administradores que ativaram esse aviso. Não enviamos mensagens de marketing.",
      },
    ],
  },
  {
    id: "disponibilidade",
    title: "11. Disponibilidade e responsabilidade",
    blocks: [
      {
        type: "p",
        text: "A plataforma é oferecida no estado em que se encontra. Pode haver interrupção, perda pontual de um envio ou erro na correção automática. Na extensão permitida pela lei brasileira, a Vulpes não responde por nota, avaliação escolar ou decisão da instituição tomada a partir do uso da plataforma, nem por dano indireto. Nada nesta seção reduz direito de consumidor que não possa ser afastado.",
      },
    ],
  },
  {
    id: "encerramento",
    title: "12. Encerramento da conta",
    blocks: [
      {
        type: "p",
        text: "Você pode desativar a própria conta na área de perfil. A desativação impede novo login e mantém os dados armazenados. A eliminação dos dados é feita mediante pedido, como descrito na Política de Privacidade. Um administrador também pode desativar uma conta em caso de uso indevido ou de determinação legal.",
      },
    ],
  },
  {
    id: "alteracoes",
    title: "13. Alterações destes termos",
    blocks: [
      {
        type: "p",
        text: "Estes termos podem ser atualizados. A data no topo da página indica a versão vigente. Mudança relevante será informada na plataforma ou por e-mail. O uso continuado depois da publicação da nova versão vale como aceite. Se você não concordar, desative a conta e peça a eliminação dos dados.",
      },
    ],
  },
  {
    id: "foro",
    title: "14. Lei e foro",
    blocks: [
      {
        type: "p",
        text: "Estes termos são regidos pelas leis da República Federativa do Brasil. Quando o usuário for consumidor, fica eleito o foro do seu domicílio, nos termos do Código de Defesa do Consumidor.",
      },
    ],
  },
];

const PRIVACY: Section[] = [
  {
    id: "controlador",
    title: "1. Controlador",
    blocks: [
      {
        type: "p",
        text: "O controlador dos dados pessoais é o operador da Vulpes IDE, alcançado pelo canal descrito na seção 1 dos Termos de Uso. Como as instituições não contratam o serviço, elas não atuam como controladoras desta base. O professor trata, dentro da plataforma, os dados da própria turma para a finalidade pedagógica.",
      },
    ],
  },
  {
    id: "dados",
    title: "2. Dados que coletamos",
    blocks: [
      {
        type: "p",
        text: "Você informa:",
      },
      {
        type: "list",
        items: [
          "No cadastro: nome, e-mail, senha e, se quiser, a instituição.",
          "No pedido para se tornar professor: nome, e-mail pessoal, e-mail institucional, instituição e um documento comprobatório (PDF, DOC, DOCX, JPG ou PNG, até 5 MB).",
          "Nas atividades: código-fonte enviado, mensagens ao pedir entrada numa turma e comentários que o professor escreve sobre um envio.",
          "No perfil: novo nome, novo e-mail e nova senha, quando você pede a alteração.",
          "No relato de bug: página, descrição, comportamento esperado, comportamento observado, passos para reproduzir e até cinco capturas de tela.",
          "Nas preferências: tema da interface, tamanho da fonte, quebra de linha, tema do editor e, para administradores, se desejam receber aviso de novos relatos.",
        ],
      },
      {
        type: "p",
        text: "A plataforma registra sozinha:",
      },
      {
        type: "list",
        items: [
          "Papel da conta (aluno, professor ou administrador), datas de criação e atualização, e se a conta está desativada.",
          "Se o envio foi marcado como correto, data e hora do envio e a qual tarefa, turma ou lista ele pertence.",
          "No relato de bug, o sistema operacional e o navegador, lidos do identificador do navegador apenas para classificar o ambiente. Não guardamos o identificador completo.",
          "Trilha de auditoria de algumas ações: troca de e-mail, mudança de papel, desativação, entrada e saída de turma, decisão do pedido de professor, visibilidade ou exclusão de tarefa e atualização de comentário do professor. A trilha guarda quem fez, o papel, a ação e o valor anterior e o novo. Não guarda senha nem o código enviado.",
          "Um identificador aleatório de cada requisição de login, cadastro ou senha, mantido por cerca de 60 segundos para impedir que a mesma requisição seja reenviada.",
        ],
      },
      {
        type: "p",
        text: "A senha é armazenada somente como hash. A Vulpes não consegue ler a senha original. Não pedimos documento de identidade no cadastro comum, não coletamos dados de pagamento e não usamos ferramentas de análise de audiência nem cookies de publicidade.",
      },
    ],
  },
  {
    id: "finalidades",
    title: "3. Para que usamos os dados e a base legal",
    blocks: [
      {
        type: "list",
        items: [
          "Criar e manter a conta, autenticar e permitir trocar senha e e-mail. Base: execução do serviço que você pediu ao se cadastrar (art. 7º, V, da LGPD).",
          "Operar turmas, tarefas, envios, correção e comentários do professor. Base: execução do serviço.",
          "Calcular, para o professor, situação por tarefa, quantidade de envios, nota ponderada pelos pesos da lista e indicadores da turma. Base: execução do serviço educacional.",
          "Analisar o pedido para se tornar professor. Base: execução do procedimento solicitado e legítimo interesse em confirmar o vínculo informado (art. 7º, IX).",
          "Atender relatos de bug e avisar os administradores que optaram por esse aviso. Base: execução do suporte e legítimo interesse em corrigir falhas.",
          "Guardar a trilha de auditoria e proteger o login. Base: legítimo interesse em segurança e em apurar uso indevido, além de eventual obrigação legal (art. 7º, II e IX).",
          "Lembrar tema e preferências do editor. Base: execução do serviço.",
          "Tratar dados de menores de 18 anos. Base: a descrita em cada item acima, condicionada à autorização do responsável, e, para menores de 12 anos, o consentimento específico do responsável (art. 14).",
        ],
      },
    ],
  },
  {
    id: "menores-privacidade",
    title: "4. Crianças e adolescentes",
    blocks: [
      {
        type: "p",
        text: "Dados de menores são usados para a atividade educacional: conta, turma, envio de código e acompanhamento pelo professor. Não são usados para publicidade, perfil comercial ou repasse a terceiros para outras finalidades.",
      },
      {
        type: "p",
        text: "O pai, a mãe ou o responsável pode exercer os direitos da seção 12 em nome do menor. Se tomarmos conhecimento de uma conta de criança sem a autorização exigida, a conta pode ser desativada e os dados, eliminados mediante pedido.",
      },
    ],
  },
  {
    id: "decisao",
    title: "5. Acompanhamento escolar e correção automática",
    blocks: [
      {
        type: "p",
        text: "Os painéis do professor mostram, por aluno, se houve envio, se o resultado foi marcado como correto, a nota calculada com os pesos da lista, a quantidade de envios e a data do último envio, além de totais da turma. Esse tratamento existe para a condução da atividade e fica visível ao professor da turma e aos administradores.",
      },
      {
        type: "p",
        text: "A marcação de certo ou errado é produzida pela execução dos testes no seu navegador e gravada no servidor. Ela não decide sozinha aprovação em disciplina. Você pode pedir revisão ao professor da turma e, quanto a decisões automatizadas que afetem os seus interesses, a revisão prevista no art. 20 da LGPD, pelo canal da seção 1 dos Termos.",
      },
    ],
  },
  {
    id: "compartilhamento",
    title: "6. Com quem os dados são compartilhados",
    blocks: [
      {
        type: "p",
        text: "Dentro da plataforma, o acesso segue a seção 9 dos Termos: professor da turma, colegas de turma, autor da tarefa e administradores, cada um nos limites descritos ali.",
      },
      {
        type: "p",
        text: "Fora da plataforma, os dados são tratados pelos operadores abaixo, somente para prestar o serviço. Não vendemos dados e não os compartilhamos para publicidade.",
      },
      {
        type: "list",
        items: [
          "Vercel: hospedagem da aplicação e da API, banco PostgreSQL, Redis e armazenamento dos arquivos enviados (documentos de professor e capturas de relato).",
          "Google (Gmail): envio dos e-mails transacionais. O destinatário recebe o conteúdo daquela mensagem, que pode incluir nome, e-mail e, no aviso de bug, a descrição do relato e os endereços das capturas.",
        ],
      },
    ],
  },
  {
    id: "transferencia",
    title: "7. Transferência internacional",
    blocks: [
      {
        type: "p",
        text: "Vercel e Google podem processar dados fora do Brasil, inclusive nos Estados Unidos. A transferência ocorre porque é necessária para executar o serviço que você solicitou (art. 33, VIII, da LGPD) e conforme as garantias contratuais desses operadores. Não há outra transferência internacional.",
      },
    ],
  },
  {
    id: "dispositivo",
    title: "8. O que fica no seu navegador",
    blocks: [
      {
        type: "p",
        text: "No armazenamento local do navegador ficam o token da sessão, uma cópia das preferências e o tema da interface. O token contém identificador, nome, e-mail, papel e preferências, e pode ser lido por quem tiver acesso àquele navegador. Não usamos cookies de rastreamento. As fontes são entregues pela própria Vulpes, sem consulta a serviço de fontes de terceiros durante o uso.",
      },
    ],
  },
  {
    id: "arquivos",
    title: "9. Documentos e capturas de tela",
    blocks: [
      {
        type: "p",
        text: "O documento do pedido de professor e as capturas de um relato ficam em armazenamento de objetos da Vercel. Cada arquivo recebe um endereço próprio. Quem tiver esse endereço consegue abri-lo, então trate o link como confidencial e envie só o que for necessário para comprovar o vínculo ou para explicar o problema. Os arquivos são exibidos aos administradores. No relato de bug, o aviso por e-mail também leva os links das capturas aos administradores que ativaram a notificação.",
      },
    ],
  },
  {
    id: "retencao",
    title: "10. Por quanto tempo guardamos",
    blocks: [
      {
        type: "p",
        text: "Os dados da conta, das turmas, dos envios, dos pedidos de professor, dos relatos e dos arquivos são mantidos enquanto a conta estiver em uso e, após a desativação, até que você peça a eliminação ou até que o prazo abaixo se encerre.",
      },
      {
        type: "list",
        items: [
          "Conta desativada, envios, tarefas e arquivos associados: eliminados ou anonimizados em até 90 dias depois do pedido de exclusão. Sem pedido, podem permanecer enquanto forem necessários à turma ainda em andamento ou à defesa de direitos.",
          "Pedido de redefinição de senha: o link deixa de valer após 30 minutos. O registro é apagado quando a senha é trocada e, se não for usado, é eliminado junto com a conta quando houver pedido de exclusão.",
          "Identificadores de requisição no Redis: cerca de 60 segundos.",
          "Trilha de auditoria: mantida mesmo se a conta for removida, pelo prazo necessário à segurança e à defesa de direitos, porque o registro não depende da conta para continuar existindo.",
        ],
      },
    ],
  },
  {
    id: "seguranca",
    title: "11. Segurança",
    blocks: [
      {
        type: "p",
        text: "As medidas atuais incluem senha armazenada com hash, conexão protegida por HTTPS, cifragem do conteúdo das requisições de login, cadastro, redefinição e troca de senha, controle de acesso por papel e trilha de auditoria das ações listadas na seção 2. Links de redefinição de senha e de confirmação de e-mail valem 30 minutos. Nenhum método é infalível. Use uma senha exclusiva e encerre a sessão em computadores compartilhados.",
      },
    ],
  },
  {
    id: "direitos",
    title: "12. Seus direitos",
    blocks: [
      {
        type: "p",
        text: "Você, ou o responsável por um menor, pode pedir confirmação do tratamento, acesso, correção, anonimização, portabilidade, eliminação dos dados desnecessários ou tratados com consentimento, informação sobre com quem os dados foram compartilhados e revogação do consentimento, nos termos do art. 18 da LGPD.",
      },
      {
        type: "p",
        text: "Nome e e-mail podem ser corrigidos no perfil. A troca de e-mail só se conclui pelo link enviado ao novo endereço. A desativação da conta está no perfil e não apaga os dados. Exclusão, exportação e os demais pedidos são atendidos pelo canal da seção 1 dos Termos. A resposta completa sai em até 15 dias, contados do pedido (art. 19 da LGPD). Podemos pedir informações para confirmar que o pedido é do titular ou do responsável.",
      },
      {
        type: "p",
        text: "A eliminação não alcança o que precisarmos guardar para cumprir obrigação legal, exercer direitos em processo ou manter a trilha de auditoria descrita na seção 10. Nesses casos, os dados deixam de ser usados para a atividade educacional.",
      },
    ],
  },
  {
    id: "incidentes",
    title: "13. Incidentes de segurança",
    blocks: [
      {
        type: "p",
        text: "Se ocorrer um incidente que possa acarretar risco ou dano relevante, comunicaremos a Autoridade Nacional de Proteção de Dados e os titulares afetados, com as informações previstas no art. 48 da LGPD.",
      },
    ],
  },
  {
    id: "alteracoes-privacidade",
    title: "14. Alterações desta política",
    blocks: [
      {
        type: "p",
        text: "Esta política pode ser atualizada para refletir mudança na plataforma ou na lei. A data no topo da página é a da versão vigente. Mudança relevante será informada na plataforma ou por e-mail.",
      },
    ],
  },
];

function SectionBody({ section }: { section: Section }) {
  const theme = useAppTheme();

  return (
    <Box component="section" id={section.id} sx={{ scrollMarginTop: 96 }}>
      <Typography
        component="h2"
        variant="h6"
        sx={{ color: theme.text, fontWeight: 700, mt: 4, mb: 1.5 }}
      >
        {section.title}
      </Typography>
      {section.blocks.map((block, index) =>
        block.type === "p" ? (
          <Typography
            key={index}
            variant="body1"
            sx={{ color: theme.textSecondary, lineHeight: 1.75, mb: 1.5 }}
          >
            {block.text}
          </Typography>
        ) : (
          <Box
            key={index}
            component="ul"
            sx={{
              m: 0,
              mb: 1.5,
              pl: 2.5,
              color: theme.textSecondary,
              "& li": { mb: 0.75, lineHeight: 1.7 },
            }}
          >
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </Box>
        ),
      )}
    </Box>
  );
}

export default function TermosPage() {
  const theme = useAppTheme();

  return (
    <>
      <AppNavBar position="sticky" />
      <Box
        component="main"
        sx={{
          width: "100%",
          minHeight: "100vh",
          bgcolor: theme.bg,
          color: theme.text,
          transition: "background-color 0.2s ease, color 0.2s ease",
        }}
      >
        <Box sx={{ maxWidth: 760, mx: "auto", px: { xs: 3, md: 4 }, py: { xs: 5, md: 8 } }}>
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: -0.4, mb: 1 }}
          >
            Termos de Uso e Privacidade
          </Typography>
          <Typography variant="body2" sx={{ color: theme.textMuted, mb: 3 }}>
            Versão de {UPDATED_AT}.
          </Typography>
          <Typography variant="body1" sx={{ color: theme.textSecondary, lineHeight: 1.75, mb: 3 }}>
            Esta página explica as regras de uso da Vulpes IDE e como os dados
            pessoais são tratados. Os termos valem para alunos, professores,
            administradores e responsáveis de menores que usem a plataforma.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              pb: 2,
              borderBottom: "1px solid",
              borderColor: theme.border,
            }}
          >
            <MuiLink href="#termos" underline="hover" color={theme.brand}>
              Termos de Uso
            </MuiLink>
            <MuiLink href="#privacidade" underline="hover" color={theme.brand}>
              Política de Privacidade
            </MuiLink>
          </Box>

          <Typography
            component="h2"
            id="termos"
            variant="h5"
            sx={{ fontWeight: 800, mt: 5, mb: 1, scrollMarginTop: 96 }}
          >
            Termos de Uso
          </Typography>
          {TERMS.map((section) => (
            <SectionBody key={section.id} section={section} />
          ))}

          <Typography
            component="h2"
            id="privacidade"
            variant="h5"
            sx={{ fontWeight: 800, mt: 6, mb: 1, scrollMarginTop: 96 }}
          >
            Política de Privacidade
          </Typography>
          <Typography variant="body1" sx={{ color: theme.textSecondary, lineHeight: 1.75 }}>
            Esta política descreve o tratamento de dados pessoais na Vulpes IDE,
            em conformidade com a Lei nº 13.709/2018 (LGPD).
          </Typography>
          {PRIVACY.map((section) => (
            <SectionBody key={section.id} section={section} />
          ))}

          <Typography variant="body2" sx={{ color: theme.textMuted, mt: 6 }}>
            Dúvidas sobre estes termos podem ser enviadas pelo relato de bugs
            ou em resposta aos e-mails da plataforma. Você também pode reler
            esta página a qualquer momento em{" "}
            <MuiLink component={Link} href="/termos" underline="hover" color={theme.brand}>
              /termos
            </MuiLink>
            .
          </Typography>
        </Box>
        <HomeFooter />
      </Box>
    </>
  );
}
