import Link from "next/link";
import { textLink } from "@/components/styles";
import { MINIMUM_AGE } from "@/lib/legal";
import { ContactEmail, LegalList, LegalPage, LegalSection } from "./legal/LegalPage";

export default function Terms() {
  return (
    <LegalPage
      intro="Ao criar uma conta ou usar o ODS Quiz, você concorda com estas regras. Elas existem para manter o site útil e seguro para todo mundo."
      label="Termos de uso"
      summary={[
        `O ODS Quiz é gratuito, não tem fins comerciais e é para pessoas com ${MINIMUM_AGE} anos ou mais.`,
        "Use dados verdadeiros e mantenha sua senha em segredo.",
        "Cadastre só iniciativas reais e publique contatos e fotos apenas com autorização.",
        "Conteúdo falso, ofensivo ou ilegal pode ser removido, e a conta, suspensa.",
      ]}
      title="Regras para usar o ODS Quiz"
    >
      <LegalSection id="about" title="O que é o ODS Quiz">
        <p>
          O ODS Quiz é uma plataforma gratuita e sem fins comerciais que ajuda
          você a relacionar a realidade da sua comunidade com os 17 Objetivos de
          Desenvolvimento Sustentável (ODS) da ONU e a encontrar iniciativas
          locais. Ele é mantido por Kauan Peçanha Lira.
        </p>
      </LegalSection>

      <LegalSection id="who" title="Quem pode usar">
        <LegalList>
          <li>
            Pessoas com {MINIMUM_AGE} anos ou mais. Ao criar a conta, você
            declara ter essa idade. Se você tem menos de 18 anos, converse com
            seus pais ou responsáveis sobre o uso do site.
          </li>
          <li>Cada pessoa pode ter uma única conta, com dados verdadeiros.</li>
        </LegalList>
      </LegalSection>

      <LegalSection id="account" title="Sua conta">
        <LegalList>
          <li>Mantenha sua senha em segredo e não compartilhe sua conta.</li>
          <li>Você responde pelo que for publicado com a sua conta.</li>
          <li>
            Se suspeitar que outra pessoa usou sua conta, avise pelo e-mail{" "}
            <ContactEmail />.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="quiz" title="O quiz">
        <p>
          O quiz é educativo. O resultado mostra como suas respostas se
          relacionam com cada ODS e não é uma avaliação oficial nem um julgamento
          sobre você ou sua comunidade. Não existe resposta certa ou errada.
        </p>
      </LegalSection>

      <LegalSection id="initiatives" title="Iniciativas">
        <p>Ao cadastrar ou editar uma iniciativa, você garante que:</p>
        <LegalList>
          <li>ela existe e as informações são verdadeiras;</li>
          <li>
            os contatos são da própria iniciativa e já são públicos, ou você
            tem autorização de quem a organiza para divulgá-los;
          </li>
          <li>
            tem o direito de usar a logomarca e as fotos, e as pessoas que
            aparecem nelas autorizaram a publicação. No caso de crianças e
            adolescentes, a autorização deve ser dos pais ou responsáveis.
          </li>
        </LegalList>
        <p>
          As informações da iniciativa, inclusive o endereço, a localização no
          mapa e os contatos, ficam visíveis para qualquer pessoa com conta no
          ODS Quiz. Prefira contatos da própria iniciativa aos pessoais.
        </p>
        <p>
          O conteúdo continua sendo de quem o publicou. Ao publicá-lo, você
          autoriza o ODS Quiz a exibi-lo no site, sem custo, enquanto a
          iniciativa estiver cadastrada.
        </p>
        <p>
          O ODS Quiz não organiza as iniciativas cadastradas e não responde
          pelas atividades delas. Antes de participar, confirme as informações
          diretamente com a iniciativa.
        </p>
      </LegalSection>

      <LegalSection id="rules" title="O que não é permitido">
        <LegalList>
          <li>publicar informações falsas ou enganosas;</li>
          <li>
            publicar conteúdo ofensivo, discriminatório, violento, sexual ou
            ilegal;
          </li>
          <li>publicar dados pessoais de outras pessoas sem autorização;</li>
          <li>usar o site para spam ou propaganda sem relação com os ODS;</li>
          <li>se passar por outra pessoa ou instituição;</li>
          <li>
            tentar invadir, sobrecarregar ou burlar a segurança do site, ou
            copiar dados dele de forma automatizada.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="moderation" title="Moderação">
        <p>
          Os administradores do ODS Quiz podem suspender contas e iniciativas
          que descumpram estes termos ou a lei. Se você discordar de uma
          suspensão, escreva para <ContactEmail /> explicando o motivo.
        </p>
      </LegalSection>

      <LegalSection id="availability" title="Funcionamento do site">
        <p>
          O ODS Quiz é oferecido de graça, do jeito que está. O site pode ficar
          fora do ar para manutenção, por falhas ou quando é desligado para
          economizar recursos, e suas funções podem mudar ou ser encerradas.
        </p>
      </LegalSection>

      <LegalSection id="leaving" title="Sair do ODS Quiz">
        <p>
          Você pode parar de usar o ODS Quiz quando quiser. Para excluir sua
          conta ou uma iniciativa que você criou, escreva para <ContactEmail />{" "}
          usando o e-mail da sua conta.
        </p>
        <p>
          O uso dos seus dados está explicado na{" "}
          <Link href="/privacy" className={textLink}>
            política de privacidade
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Mudanças nestes termos">
        <p>
          Quando estes termos mudarem, a nova versão será publicada nesta
          página, com a data em que passa a valer. Mudanças importantes também
          serão avisadas no site.
        </p>
        <p>
          Estes termos seguem as leis do Brasil. Em caso de dúvida, escreva para{" "}
          <ContactEmail />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
