import Link from "next/link";
import type { ReactNode } from "react";
import { textLink } from "@/components/styles";
import { ContactEmail, LegalList, LegalPage, LegalSection } from "./legal/LegalPage";

const dataUses = [
  {
    title: "Conta",
    data: "Nome, e-mail, senha, CEP, endereço, cidade, estado e as coordenadas aproximadas do CEP. A senha é guardada embaralhada, em um formato que não permite descobri-la.",
    purpose: "Criar e proteger sua conta, mostrar seu perfil e gerar estatísticas por cidade.",
    basis: "Cumprir os termos de uso, que são o contrato entre você e o ODS Quiz (LGPD, art. 7º, V).",
    retention: "Enquanto sua conta existir.",
  },
  {
    title: "Respostas do quiz",
    data: "As opções que você escolhe, a pontuação total e a de cada ODS, com a data do envio. Algumas perguntas tratam de temas delicados, como renda, violência e discriminação; quase todas têm uma opção para não responder, como “Não sei responder”.",
    purpose: "Mostrar seu resultado e seu histórico no perfil e gerar estatísticas gerais, sem nomes, sobre as comunidades.",
    basis: "Seu consentimento, dado quando você envia o quiz (LGPD, art. 7º, I). Se não quiser que suas respostas fiquem guardadas, basta não enviar o quiz: o resto do site continua disponível.",
    retention: "Enquanto sua conta existir ou até você pedir a exclusão.",
  },
  {
    title: "Iniciativas",
    data: "Nome, tipo, área de atuação, número de pessoas atendidas, ODS principal, descrição, CEP, endereço, localização no mapa, e-mail, WhatsApp, Instagram, site, logomarca e fotos, além de quem criou a iniciativa e de quem faz parte dela.",
    purpose: "Divulgar a iniciativa no mapa e na página dela, para qualquer pessoa com conta no ODS Quiz. O e-mail dos membros só aparece para quem criou a iniciativa.",
    basis: "Cumprir os termos de uso (LGPD, art. 7º, V).",
    retention: "Enquanto a iniciativa estiver cadastrada.",
  },
  {
    title: "Moderação",
    data: "Suspensões de contas e de iniciativas, com o motivo, e o registro das ações dos administradores.",
    purpose: "Manter o ODS Quiz seguro e fazer valer os termos de uso.",
    basis: "Legítimo interesse em proteger o site e quem o usa (LGPD, art. 7º, IX).",
    retention: "Enquanto a conta ou a iniciativa existir.",
  },
  {
    title: "Registros técnicos",
    data: "Data e hora dos acessos, endereço acessado, endereço IP e tipo de navegador.",
    purpose: "Manter o site funcionando, investigar erros e proteger contra ataques.",
    basis: "Legítimo interesse (LGPD, art. 7º, IX).",
    retention: "Até 30 dias.",
  },
  {
    title: "Cópias de segurança",
    data: "Uma cópia de todo o banco de dados, feita sempre que o site é desligado para economizar recursos.",
    purpose: "Recuperar os dados quando o site é ligado de novo.",
    basis: "Legítimo interesse (LGPD, art. 7º, IX).",
    retention: "Cada cópia é apagada 30 dias depois de ser substituída pela seguinte. Por isso, dados excluídos ainda podem ficar nelas por algum tempo.",
  },
  {
    title: "No seu navegador",
    data: "A sessão de login e a escolha de tema claro ou escuro, guardadas no armazenamento local do navegador. O ODS Quiz não usa cookies de publicidade nem ferramentas que acompanham o que você faz no site.",
    purpose: "Manter você conectado e lembrar o tema escolhido.",
    basis: "Cumprir os termos de uso (LGPD, art. 7º, V).",
    retention: "A sessão vale por 24 horas e é apagada quando você sai da conta. O tema fica guardado até você limpar os dados do navegador.",
  },
];

export default function Privacy() {
  return (
    <LegalPage
      effectiveDate="20 de novembro de 2026"
      intro="Quais dados o ODS Quiz guarda, para que usa, com quem compartilha e como você pode controlar tudo isso."
      label="Política de privacidade"
      summary={[
        "Usamos seus dados só para fazer a conta, o quiz e o mapa de iniciativas funcionarem.",
        "Não vendemos seus dados, não mostramos anúncios e não usamos seus dados para publicidade.",
        "Suas respostas do quiz não aparecem para outras pessoas. No painel administrativo, elas entram só em estatísticas gerais, sem nomes.",
        "O que você cadastra em uma iniciativa, como endereço e contatos, fica visível para quem tem conta no ODS Quiz.",
        <>
          Para pedir uma cópia, a correção ou a exclusão dos seus dados, escreva
          para <ContactEmail />.
        </>,
      ]}
      title="Como o ODS Quiz cuida dos seus dados"
    >
      <LegalSection id="controller" title="Quem cuida dos seus dados">
        <p>
          O ODS Quiz é mantido por Kauan Peçanha Lira, que decide como os dados
          são usados. Na Lei Geral de Proteção de Dados (LGPD), ele é o
          controlador e também o encarregado: a pessoa que responde às suas
          dúvidas e aos seus pedidos sobre privacidade.
        </p>
        <p>
          Contato: <ContactEmail />
        </p>
      </LegalSection>

      <LegalSection id="age" title="Quem pode usar">
        <p>
          O ODS Quiz é para pessoas com 13 anos ou mais. Se você tem menos de 18
          anos, converse com seus pais ou responsáveis sobre o uso do site.
        </p>
        <p>
          O site não tem anúncios nem bate-papo, e os dados de adolescentes são
          sempre tratados no melhor interesse deles. Se soubermos que uma conta é
          de alguém com menos de 13 anos, ela será excluída.
        </p>
        <p>
          As regras para usar o site estão nos{" "}
          <Link href="/terms" className={textLink}>
            termos de uso
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection id="data" title="Quais dados guardamos e para quê">
        <p>
          Cada tipo de dado tem uma finalidade e uma base legal, que é o motivo,
          previsto na LGPD, que permite usá-lo.
        </p>
        <div className="mt-4 grid gap-8">
          {dataUses.map((use) => (
            <div
              key={use.title}
              className="border-t border-[var(--color-header-border)] pt-5"
            >
              <h3 className="text-xl font-bold">{use.title}</h3>
              <dl className="mt-3 grid gap-x-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-y-3">
                <DataRow label="O que guardamos">{use.data}</DataRow>
                <DataRow label="Para quê">{use.purpose}</DataRow>
                <DataRow label="Base legal">{use.basis}</DataRow>
                <DataRow label="Por quanto tempo">{use.retention}</DataRow>
              </dl>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection id="sharing" title="Com quem compartilhamos">
        <p>
          Para funcionar, o ODS Quiz usa empresas que tratam os dados seguindo
          as nossas instruções:
        </p>
        <LegalList>
          <li>
            <strong>Google Cloud</strong>: guarda o banco de dados, as fotos e as
            cópias de segurança e executa os serviços do site, em servidores nos
            Estados Unidos.
          </li>
          <li>
            <strong>Cloudflare</strong>: recebe todos os acessos ao site,
            protege contra ataques e entrega as mensagens enviadas para{" "}
            <ContactEmail />.
          </li>
          <li>
            <strong>Vercel</strong>: hospeda as páginas do site.
          </li>
        </LegalList>
        <p>
          Seu navegador também se conecta diretamente a serviços públicos, que
          recebem seu endereço IP e seguem as próprias políticas de privacidade:
        </p>
        <LegalList>
          <li>
            <strong>AwesomeAPI e BrasilAPI</strong>: recebem o CEP digitado, para
            preencher o endereço.
          </li>
          <li>
            <strong>OpenStreetMap</strong>: fornece as imagens do mapa e, quando
            o CEP não traz a localização, recebe o endereço da iniciativa para
            encontrá-la no mapa.
          </li>
        </LegalList>
        <p>
          Dentro do ODS Quiz, as iniciativas aparecem para todas as pessoas com
          conta, e seu nome aparece nas iniciativas que você criou ou de que faz
          parte. Os administradores veem o nome, o e-mail, a cidade e o estado
          das contas, para moderar o site.
        </p>
        <p>
          Só entregamos dados a autoridades quando a lei ou uma ordem judicial
          exigir. Não vendemos nem alugamos seus dados.
        </p>
      </LegalSection>

      <LegalSection id="transfer" title="Dados fora do Brasil">
        <p>
          Seus dados ficam guardados nos Estados Unidos, em servidores do Google
          Cloud, e passam pelos servidores da Cloudflare e da Vercel, que ficam
          em vários países. O contrato com o Google Cloud inclui as
          cláusulas-padrão aprovadas pela Autoridade Nacional de Proteção de
          Dados (ANPD) para esse tipo de transferência.
        </p>
      </LegalSection>

      <LegalSection id="security" title="Como protegemos seus dados">
        <LegalList>
          <li>Todas as conexões com o site são criptografadas.</li>
          <li>
            As senhas são guardadas embaralhadas, em um formato que não permite
            descobri-las.
          </li>
          <li>
            Só os serviços do ODS Quiz e o responsável pelo site têm acesso ao
            banco de dados.
          </li>
          <li>Os registros técnicos não guardam senhas nem respostas do quiz.</li>
        </LegalList>
        <p>
          Se acontecer um incidente de segurança que possa causar risco ou dano
          relevante a você, avisaremos você e a ANPD.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="Seus direitos">
        <p>A LGPD garante a você o direito de:</p>
        <LegalList>
          <li>saber se tratamos seus dados e ter acesso a eles;</li>
          <li>corrigir dados incompletos, errados ou desatualizados;</li>
          <li>
            pedir a anonimização, o bloqueio ou a exclusão de dados
            desnecessários, excessivos ou tratados em desacordo com a lei;
          </li>
          <li>
            receber seus dados em um formato que permita levá-los para outro
            serviço;
          </li>
          <li>
            retirar seu consentimento e pedir a exclusão dos dados tratados com
            ele, como as respostas do quiz;
          </li>
          <li>saber com quem compartilhamos seus dados;</li>
          <li>se opor a um tratamento que descumpra a lei;</li>
          <li>reclamar à ANPD.</li>
        </LegalList>
        <p>
          Você pode corrigir nome, CEP, endereço, cidade e estado no seu perfil.
          Para os outros pedidos, como uma cópia dos seus dados ou a exclusão da
          conta, escreva para <ContactEmail /> usando o e-mail da sua conta.
          Respondemos em até 15 dias, sem custo.
        </p>
        <p>
          Se não ficar satisfeito com a resposta, você pode reclamar à ANPD em{" "}
          <a
            href="https://www.gov.br/anpd/pt-br"
            target="_blank"
            rel="noreferrer"
            className={textLink}
          >
            gov.br/anpd
            <span className="sr-only"> (abre em nova guia)</span>
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Mudanças nesta política">
        <p>
          Quando esta política mudar, a nova versão será publicada nesta página,
          com a data em que passa a valer. Mudanças importantes também serão
          avisadas no site.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

function DataRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <>
      <dt className="mt-3 text-sm font-bold text-[var(--color-muted)] sm:mt-0 sm:pt-0.5">
        {label}
      </dt>
      <dd>{children}</dd>
    </>
  );
}
