import FaqPage from "../Components/FaqPage";
import Navbar from "@/app/Components/Navbar";
import Footer from "@/app/Components/Footer";
import { Fragment } from 'react';

export default function Faq() {
  return (
    <Fragment>
      <Navbar />
      <FaqPage />
      <Footer />
    </Fragment>

  )
}