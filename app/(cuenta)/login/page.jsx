import LoginUser from "@/app/Components/LoginUser";
import Navbar from "@/app/Components/Navbar";
import Footer from "@/app/Components/Footer";
import { Fragment } from 'react';

export default function Login() {
  return (
    <Fragment>
      <Navbar />
      <LoginUser />
      <Footer />
    </Fragment>

  )
}