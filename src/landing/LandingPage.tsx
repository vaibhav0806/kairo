import { AlphaInvitation } from './AlphaInvitation';
import { CapabilityStage } from './CapabilityStage';
import { ControlMoment } from './ControlMoment';
import { FooterMark } from './FooterMark';
import { Hero } from './Hero';
import { ProductMoments } from './ProductMoments';
import { ToolPlayground } from './ToolPlayground';
import styles from './LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.wordmark} href="#top" aria-label="Kairo home">kairo</a>
        <nav aria-label="Landing page">
          <a href="#product-moments">How it helps</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#tools">Tools</a>
        </nav>
        <a className={styles.headerCta} href="#access">Request alpha access</a>
      </header>
      <main>
        <Hero />
        <ProductMoments />
        <CapabilityStage />
        <ToolPlayground />
        <ControlMoment />
        <AlphaInvitation />
      </main>
      <footer className={styles.footer}>
        <FooterMark />
      </footer>
    </div>
  );
}
