import { useState, type SubmitEvent } from "react";
import { Link } from "react-router";
import Person from "@/components/icons/Person";
import Envelope from "@/components/icons/Envelope";
import ShieldSlash from "@/components/icons/ShieldSlash";
import AuthLayout from "@/components/AuthLayout";
import Input from "@/components/Input";
import Checkbox from "@/components/Checkbox";
import SubmitButton from "@/components/SubmitButton";
import api from "@/config/api";

const Register = () => {
  const [register, setRegister] = useState({ username: '', email: '', password: '', confirmPassword: '', remember: false })

  const submitRegister = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    await api.post("auth/register", register)
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Unlock all features!"
      onSubmit={submitRegister}
      footer={<>You have an account? <Link to={'/'}>Login now</Link></>}
      illustration={{
        src: "/register_illustration.svg",
        title: "Join us!",
        subtitle: "Just go through the boring process of creating an account.",
      }}
    >
      <Input icon={<Person />} type="text" placeholder="Username" value={register.username} onChange={(event) => setRegister({ ...register, username: event.target.value })} />
      <Input icon={<Envelope />} type="email" placeholder="Email" value={register.email} onChange={(event) => setRegister({ ...register, email: event.target.value })}/>
      <Input icon={<ShieldSlash />} type="password" placeholder="Password" value={register.password} onChange={(event) => setRegister({ ...register, password: event.target.value })} />
      <Input icon={<ShieldSlash />} type="password" placeholder="Confirm password" value={register.confirmPassword} onChange={(event) => setRegister({ ...register, confirmPassword: event.target.value })}/>
      <Checkbox label={<p>Accept <Link to={'/'}>terms and conditions</Link>.</p>} checked={register.remember} onChange={(event) => setRegister({ ...register, remember: event.target.checked})} />
      <SubmitButton>Sign up</SubmitButton>
    </AuthLayout>
  )
}

export default Register;
