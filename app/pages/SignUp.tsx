import { AuthForm } from "./AuthForm";
import { AuthPage } from "./auth/AuthPage";

export default function SignUp() {
  return (
    <AuthPage
      label="Primeira vez por aqui?"
      title="Crie sua conta"
      intro="Com uma conta, você guarda o resultado do quiz e coloca no mapa as iniciativas que já fazem a diferença no seu bairro."
    >
      <AuthForm mode="signup" />
    </AuthPage>
  );
}
