import { Link } from "react-router";
import Envelope from "@/components/icons/Envelope";
import ShieldSlash from "@/components/icons/ShieldSlash";
import AuthLayout from "@/components/AuthLayout";
import Input from "@/components/Input";
import Checkbox from "@/components/Checkbox";
import SubmitButton from "@/components/SubmitButton";
import { useLogin } from "@/hooks/useLogin";

const Login = () => {
  const { values, setField, error, pending, submit } = useLogin();

  return (
    <AuthLayout
      title="Login to your Account"
      subtitle="Welcome back!"
      onSubmit={submit}
      footer={<>Don't have an account? <Link to={"/register"}>Create an account</Link></>}
      illustration={{
        src: "/two_factor.svg",
        title: "Connect with any device.",
        subtitle: "Everything you need is an internet connection.",
      }}
    >
      <Input icon={<Envelope />} type="email" placeholder="Email" value={values.email} onChange={(e) => setField("email", e.target.value)} />
      <Input icon={<ShieldSlash />} type="password" placeholder="Password" value={values.password} onChange={(e) => setField("password", e.target.value)} />
      <Checkbox label="Remember me" checked={values.remember} onChange={(e) => setField("remember", e.target.checked)} />
      {error && <p role="alert">{error}</p>}
      <SubmitButton disabled={pending}>{pending ? "Logging in…" : "Log in"}</SubmitButton>
    </AuthLayout>
  );
};

export default Login;
