import Nav from '../components/Nav';
import Hero from '../components/Hero';
import Ticker from '../components/Ticker';
import Bestsellers from '../components/Bestsellers';
import Gallery from '../components/Gallery';
import Occasions from '../components/Occasions';
import Tv5 from '../components/Tv5';
import Showroom from '../components/Showroom';
import Testimonials from '../components/Testimonials';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Bestsellers />
        <Gallery />
        <Occasions />
        <Tv5 />
        <Showroom />
        <Testimonials />
        <About />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
