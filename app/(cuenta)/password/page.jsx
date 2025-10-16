import ResetPassword from "@/app/Components/ResetPassword";

import Navbar from "@/app/Components/Navbar";
import Footer from "@/app/Components/Footer";
import { Fragment } from 'react';

export default function password() {
  return (
    <Fragment>
      <Navbar />
      <LoginUser />
      <Footer />
    </Fragment>

  )
}