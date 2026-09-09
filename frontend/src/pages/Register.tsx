import { Link } from "react-router";
import Person from "@/components/icons/Person";
import Envelope from "@/components/icons/Envelope";
import ShieldSlash from "@/components/icons/ShieldSlash";
import AuthLayout from "@/components/AuthLayout";
import Input from "@/components/Input";
import Checkbox from "@/components/Checkbox";
import SubmitButton from "@/components/SubmitButton";
import { useRegister } from "@/hooks/useRegister";

const Register = () => {
  const { values, setField, error, pending, submit } = useRegister();

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Unlock all features!"
      onSubmit={submit}
      footer={<>You have an account? <Link to={"/"}>Login now</Link></>}
      illustration={{
        src: "/register_illustration.svg",
        title: "Join us!",
        subtitle: "Just go through the boring process of creating an account.",
      }}
    >
      <Input icon={<Person />} type="text" placeholder="Username" value={values.username} onChange={(e) => setField("username", e.target.value)} />
      <Input icon={<Envelope />} type="email" placeholder="Email" value={values.email} onChange={(e) => setField("email", e.target.value)} />
      <Input icon={<ShieldSlash />} type="password" placeholder="Password" value={values.password} onChange={(e) => setField("password", e.target.value)} />
      <Input icon={<ShieldSlash />} type="password" placeholder="Confirm password" value={values.confirmPassword} onChange={(e) => setField("confirmPassword", e.target.value)} />
      <Checkbox label={<p>Accept <Link to={"/"}>terms and conditions</Link>.</p>} checked={values.accept} onChange={(e) => setField("accept", e.target.checked)} />
      {error && <p role="alert">{error}</p>}
      <SubmitButton disabled={pending}>{pending ? "Creating account…" : "Sign up"}</SubmitButton>
    </AuthLayout>
  );
};

export default Register;
