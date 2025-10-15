import Image from "next/image";
import Link from "next/link";
import PageHome from "./Components/PageHome"
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import { Fragment } from 'react';


export default function Home() {
  return (
    <Fragment>
      <Navbar />
      <PageHome />
      <Footer />
    </Fragment>

  )


}




