import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { LandingPage, validateWaitlistEmail } from '../src/landing/LandingPage';

describe('landing page', () => {
  test('validates the local preview email field', () => {
    expect(validateWaitlistEmail('')).toBe('Enter your email address.');
    expect(validateWaitlistEmail('learner@')).toBe('Enter a valid email address.');
    expect(validateWaitlistEmail(' learner@example.com ')).toBeNull();
  });

  test('renders an accessible request-access form without an empty live region', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();
    expect(html).toContain('<label for="waitlist-email">Email address</label>');
    expect(html).toContain('type="email"');
    expect(html).toContain('autoComplete="email"');
    expect(html).not.toContain('<p aria-live="polite"');
    expect(css).not.toContain('.sronly');
  });

  test('styles preview completion as neutral status copy', () => {
    const source = readFileSync('src/landing/LandingPage.tsx', 'utf8');
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(source).toContain('<strong>Preview complete.</strong>');
    expect(css).toMatch(/\.waitlistsuccess > strong\s*\{[^}]*color:\s*var\(--ink\);/);
    expect(css).not.toMatch(/\.waitlistsuccess > strong\s*\{[^}]*color:\s*var\(--verified\);/);
  });

  test('uses the approved secondary CTA wording', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));

    expect(html).toContain('Watch Kairo teach');
  });

  test('presents equal compatibility across desktop software', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));

    expect(html).toContain('Blender');
    expect(html).toContain('Photoshop');
    expect(html).toContain('DaVinci Resolve');
    expect(html).toContain('Figma');
    expect(html).toContain('Any desktop software');
  });

  test('states that learners can pause guidance', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));

    expect(html).toContain('You can pause guidance at any time.');
  });

  test('renders the approved learner-first narrative', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));

    expect(html).toContain('Learn software by doing.');
    expect(html).toContain('Not watching.');
    expect(html).toContain('Example lesson / Blender');
    expect(html).toContain('Tutorials show their screen. Kairo starts from yours.');
    expect(html).toContain('Talk to Kairo.');
    expect(html).toContain('Circle “this.”');
    expect(html).toContain('The AI points. You act.');
    expect(html).toContain('Kairo checks before moving on.');
    expect(html).toContain('Photoshop');
    expect(html).toContain('DaVinci Resolve');
    expect(html).toContain('AI can make mistakes.');
  });

  test('positions Kairo as a tutor for any desktop software', () => {
    const html = renderToStaticMarkup(createElement(LandingPage)).replaceAll('&#x27;', "'");

    expect(html).toContain('AI tutor for any desktop software / Mac alpha');
    expect(html).toContain('whatever software you\'re learning');
    expect(html).toContain('Example lesson / Blender');
    expect(html).toContain('Why won\'t these cards resize with the frame?');
    expect(html).toContain('Layers panel → Add layer mask');
    expect(html).toContain('Add to Render Queue');
    expect(html).toContain('Any desktop software');
    expect(html).toContain('anything else on your screen');
    expect(html).not.toContain('First live skill / Blender');
    expect(html).not.toContain('Active / alpha');
    expect(html).not.toContain('Kairo is beginning with Blender learners');
    expect(html).not.toContain('Blender first.');
  });

  test('keeps Blender workflow steps inside the product preview', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const previewStart = html.indexOf('<figure');
    const previewEnd = html.indexOf('</figure>') + '</figure>'.length;
    const chaptersStart = html.indexOf('<section id="how"');
    const chaptersEnd = html.indexOf('<section id="skills"');
    const productPreview = html.slice(previewStart, previewEnd);
    const scrollChapters = html.slice(chaptersStart, chaptersEnd);

    ['Select cube', 'Insert keyframe', 'Move to frame 40'].forEach((step) => {
      expect(productPreview).toContain(step);
      expect(scrollChapters).not.toContain(step);
    });
  });

  test('uses semantic color roles and accessible motion fallbacks', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(css).toContain('#f5f4ef');
    expect(css).toContain('#151515');
    expect(css).toContain('#ff6547');
    expect(css).toContain('#8b79ff');
    expect(css).toContain('#78caaa');
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain("[data-motion-ready='true']");
    expect(css).not.toContain('scroll-snap');
    expect(css).not.toContain('linear-gradient');
    expect(css).not.toContain('radial-gradient');
  });

  test('gives verification states responsive inner spacing', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');

    expect(css).toMatch(/\.checkRow\s*\{[^}]*padding:\s*22px 24px;/s);
    expect(css).toMatch(/@media \(max-width:\s*640px\)[\s\S]*\.checkRow\s*\{[^}]*padding:\s*18px 16px;/);
  });

  test('keeps chapter visual details visible when reduced motion is enabled', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();
    const reducedMotionCss = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));

    expect(reducedMotionCss).toMatch(
      /\.landingpage\s+\[data-reveal\]\s+\.chaptervisual\s*>\s*\*\s*\{[^}]*opacity:\s*1\s*!important;[^}]*transform:\s*none\s*!important;[^}]*transition:\s*none\s*!important;[^}]*\}/
    );
  });

  test('styles waitlist messages through CSS module classes', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(css).toContain('.waitlisterror');
    expect(css).toContain('.waitlistnote');
    expect(css).not.toContain('#waitlist-error');
    expect(css).not.toContain('#waitlist-note');
  });

  test('keeps mobile product-preview labels readable', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();
    const mobileCss = css.slice(css.indexOf('@media (max-width: 760px)'));

    expect(mobileCss).toMatch(/\.learnerask b\s*\{[^}]*font-size:\s*0\.55rem;/);
    expect(mobileCss).toMatch(/\.progressrail\s*\{[^}]*font-size:\s*0\.55rem;/);
    expect(mobileCss).toMatch(/\.kairotarget span\s*\{[^}]*font-size:\s*0\.55rem;/);
    expect(mobileCss).toMatch(/\.guidenotch\s*\{[^}]*top:\s*54px;/);
    expect(mobileCss).toMatch(/\.voiceresponse\s*\{[^}]*bottom:\s*116px;/);
  });

  test('keeps the desktop hero responsive to its column and viewport height', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(css).toMatch(/\.herocopy\s*\{[^}]*container-type:\s*inline-size;/);
    expect(css).toMatch(/\.landingpage h1\s*\{[^}]*font-size:\s*clamp\(3\.5rem,\s*17cqi,\s*7rem\);/);
    expect(css).toMatch(/\.softwareframe\s*\{[^}]*min-height:\s*clamp\(480px,\s*calc\(100svh - 240px\),\s*640px\);/);
  });

  test('defines semantic product and scroll motion choreography', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(html).toContain('data-motion="conversation"');
    expect(html).toContain('data-motion="annotation"');
    expect(html).toContain('data-motion="guidance"');
    expect(html).toContain('data-motion="verification"');
    expect(html).toContain('data-motion="skills"');
    expect(html).toContain('<svg');
    expect(css).toContain('@keyframes herodraw');
    expect(css).toContain('@keyframes herotarget');
    expect(css).toContain('@keyframes herocursor');
    expect(css).toContain('@keyframes conversationin');
    expect(css).toContain('@keyframes annotationdraw');
    expect(css).toContain('@keyframes guidenotchin');
    expect(css).toContain('@keyframes cursortravel');
    expect(css).toContain('@keyframes verifyrow');
    expect(css).toContain('@keyframes skillin');
    expect(css).toContain("[data-demo-active='true'][data-page-visible='true']");
  });

  test('sequences conversation through learner action and final verification', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();
    const beats = ['question', 'response', 'action', 'verification'];
    const beatPositions = beats.map((beat) => html.indexOf(`data-conversation-beat="${beat}"`));

    beatPositions.forEach((position) => expect(position).toBeGreaterThan(-1));
    expect(beatPositions).toEqual([...beatPositions].sort((a, b) => a - b));
    expect(html).toContain('Learner action / resize');
    expect(html).toContain('Resize verified');
    expect(css).toContain('@keyframes conversationquestion');
    expect(css).toContain('@keyframes conversationresponse');
    expect(css).toContain('@keyframes conversationaction');
    expect(css).toContain('@keyframes conversationverify');
    expect(css).toMatch(/\.conversationquestion\s*\{[^}]*animation:\s*conversationquestion 420ms 100ms/);
    expect(css).toMatch(/\.conversationresponse\s*\{[^}]*animation:\s*conversationresponse 420ms 560ms/);
    expect(css).toMatch(/\.conversationaction\s*\{[^}]*animation:\s*conversationaction 420ms 1040ms/);
    expect(css).toMatch(/\.conversationverified\s*\{[^}]*animation:\s*conversationverify 420ms 1520ms/);
  });

  test('finishes annotation drawing before resolving its answer', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(css).toMatch(/\.drawncircle path\s*\{[^}]*animation:\s*annotationdraw 700ms 160ms/);
    expect(css).toMatch(/\.annotationlabel\s*\{[^}]*animation:\s*annotationresolve 420ms 900ms/);
    expect(css).toMatch(/\.groundedanswer\s*\{[^}]*animation:\s*annotationresolve 480ms 1080ms/);
    expect(css).toMatch(/\.visualverification\s*\{[^}]*animation:\s*annotationresolve 420ms 1600ms/);
  });

  test('runs chapter wave bars only as finite visible entrances', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(css).not.toMatch(/\.wave i,\s*\.miniwave i\s*\{[^}]*animation:[^}]*infinite/);
    expect(css).toContain('@keyframes chaptervoicebar');
    expect(css).toMatch(/\[data-motion='conversation'\]\[data-visible='true'\] \.conversationresponse \.miniwave i\s*\{[^}]*animation:\s*chaptervoicebar [^;}]* 2 alternate both/);
    expect(css).toMatch(/\[data-motion='guidance'\]\[data-visible='true'\] \.guidenotch \.miniwave i\s*\{[^}]*animation:\s*chaptervoicebar [^;}]* 2 alternate both/);
  });
});
