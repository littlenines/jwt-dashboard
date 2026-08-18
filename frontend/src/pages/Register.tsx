import { useState, type SubmitEvent } from "react";
import { Link } from "react-router";
import SubmitButton from "@/components/SubmitButton";
import api from "@/config/api";

const Register = () => {
  const [register, setRegister] = useState({ username: '', email: '', password: '', confirmPassword: '' })

  const submitRegister = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    await api.post("auth/register", register)
  }

  return (
    <main className="landing">
      <section className="register">
        <div className="register_wrapper">

        <h1 className="register_title">Create your account</h1>
        <p className="register_subtitle">Unlock all features!</p>
        <form className="register_form" onSubmit={submitRegister}>
          <input type="text" placeholder="Username" value={register.username} onChange={(event) => setRegister({ ...register, username: event.target.value })} />
          <input type="email" placeholder="Email" value={register.email} onChange={(event) => setRegister({ ...register, email: event.target.value })}/>
          <input type="password" placeholder="Password" value={register.password} onChange={(event) => setRegister({ ...register, password: event.target.value })} />
          <input type="password" placeholder="Confirm password" value={register.confirmPassword} onChange={(event) => setRegister({ ...register, confirmPassword: event.target.value })}/>
          <SubmitButton>Sign up</SubmitButton>
          </form>
          <p className="register_has_account">You have an account? <Link to={'/'}>Login now</Link></p>
        </div>
      </section>
      <aside className="side_illustration">
        <img src="/register_illustration.svg" />
        <div className="doughnut" />
        <div className="side_illustration_info">
          <p className="side_illustration_title">Join us!</p>
          <p className="side_illustration_subtitle">Just go through the boring process of creating an account.</p>
        </div>
      </aside>
    </main>
  )
}

export default Register;
