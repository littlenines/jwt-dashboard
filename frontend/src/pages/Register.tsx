import { useState, type SubmitEvent } from "react";
import api from "@/config/api";

const Register = () => {
  const [register, setRegister] = useState({ username: '', email: '', password: '', confirmPassword: '' })

  const submitRegister = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const registerFetch = await api.post("auth/register", register)
    console.log(registerFetch)
  }
  return (
    <main>
      <section className="register">
        <div className="register-wrapper">

        <h1>Create your account</h1>
        <p>Unlock all features!</p>
        <form className="register_form" onSubmit={submitRegister}>
          <input type="text" placeholder="Username" value={register.username} onChange={(event) => setRegister({ ...register, username: event.target.value })} />
          <input type="email" placeholder="Email" value={register.email} onChange={(event) => setRegister({ ...register, email: event.target.value })}/>
          <input type="password" placeholder="password" value={register.password} onChange={(event) => setRegister({ ...register, password: event.target.value })} />
          <input type="password" placeholder="Confirm password" value={register.confirmPassword} onChange={(event) => setRegister({ ...register, confirmPassword: event.target.value })}/>
          <button type="submit">Sign up</button>
      </form>
        </div>
      </section>
    </main>
  )
}

export default Register;
