import { AuthForm } from "./AuthForm";
import { AuthPage } from "./auth/AuthPage";

export default function Login() {
  return (
    <AuthPage
      label="Que bom ter você aqui"
      title="Entrar"
      intro="Entre para enviar suas respostas do quiz, guardar sua pontuação e encontrar no mapa quem já faz a diferença perto de você."
    >
      <AuthForm mode="login" />
    </AuthPage>
  );
}
