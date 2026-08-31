import { useState, type SubmitEvent } from "react";
import { Link } from "react-router";
import Envelope from "@/components/icons/Envelope";
import ShieldSlash from "@/components/icons/ShieldSlash";
import AuthLayout from "@/components/AuthLayout";
import Input from "@/components/Input";
import Checkbox from "@/components/Checkbox";
import SubmitButton from "@/components/SubmitButton";
import api from "@/config/api";

const Login = () => {
const [login, setLogin] = useState({ email: '', password: '', remember: false })

const submitLogin = async (event: SubmitEvent<HTMLFormElement>) => {
  event.preventDefault();

  const loginFetch = await api.post("auth/login", login)
  console.log(loginFetch)
}

return (
     <AuthLayout
      title="Login to your Account"
      subtitle="Welcome back!"
      onSubmit={submitLogin}
      footer={<>Don't have an account? <Link to={'/register'}>Create an account</Link></>}
      illustration={{
        src: "/two_factor.svg",
        title: "Connect with any device.",
        subtitle: "Everything you need is an internet connection.",
      }}
    >
      <Input icon={<Envelope />} type="email" placeholder="Email" value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })}/>
      <Input icon={<ShieldSlash />} type="password" placeholder="Password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} />
      <Checkbox label="Remember me" checked={login.remember} onChange={(event) => setLogin({ ...login, remember: event.target.checked})} />
      <SubmitButton>Log in</SubmitButton>
    </AuthLayout>
)
}

export default Login
