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

  test('uses friendly hero language and one neutral preview caption', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));

    expect(html).toContain('Meet Kairo');
    expect(html).toContain('>Learn <');
    expect(html).toContain('>by doing.</span>');
    expect(html).toContain('Ask. Point. Learn by doing.');
    expect(html).toContain('Join the Mac alpha');
    expect(html).toContain('See Kairo guide a lesson');
    expect(html).toContain('↗');
    expect(html).toContain('↓');
    expect(html).toContain('Watch Kairo guide a lesson');
    expect(html).not.toContain('One lesson, shown in Blender');
    expect(html).not.toContain('Blender skill active');
    expect(html).toContain('Kairo understood: cube');
    expect(html).toContain('You asked + circled');
  });

  test('keeps app examples visual and concise', () => {
    const html = renderToStaticMarkup(createElement(LandingPage)).replaceAll('&#x27;', "'");

    expect(html).toContain('Kairo can meet you where you work.');
    expect(html).toContain('aria-label="Examples of apps Kairo can guide in"');
    expect(html).toContain('Blender');
    expect(html).toContain('modelling, animation, materials, rendering');
    expect(html).toContain('Photoshop');
    expect(html).toContain('layers, masks, retouching, compositing');
    expect(html).toContain('DaVinci Resolve');
    expect(html).toContain('editing, color, audio, delivery');
    expect(html).toContain('Figma');
    expect(html).toContain('layout, components, prototyping');
    expect(html).toContain('Don’t see your app? Kairo can still help from what’s on your screen.');
  });

  test('states that learners can pause guidance', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));

    expect(html).toContain('You can pause it whenever you want.');
  });

  test('renders a visual runway in causal order', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const beats = ['Ask / Figma', 'Guide / Photoshop', 'Check / DaVinci Resolve'];
    const beatPositions = beats.map((beat) => html.indexOf(beat));

    beatPositions.forEach((position) => expect(position).toBeGreaterThan(-1));
    expect(beatPositions).toEqual([...beatPositions].sort((a, b) => a - b));
    expect(html).toContain('Your screen becomes the lesson.');
    expect(html).toContain('Circle the thing that doesn’t make sense.');
    expect(html).toContain('Kairo points to one next step.');
    expect(html).toContain('You do it. Kairo checks what changed.');
  });

  test('places the visual runway immediately after the hero', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const previewEnd = html.indexOf('</figure>') + '</figure>'.length;
    const runway = 'Your screen becomes the lesson.';
    const runwayPosition = html.indexOf(runway);
    const skillsPosition = html.indexOf('Kairo can meet you where you work.');

    expect(runwayPosition).toBeGreaterThan(previewEnd);
    expect(runwayPosition).toBeLessThan(skillsPosition);
  });

  test('removes the old process strip, fabricated app stages, principles, and trust cards', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const source = readFileSync('src/landing/LandingPage.tsx', 'utf8');

    expect(source).not.toContain('const learningLoop');
    expect(source).not.toContain('styles.learningLoop');
    expect(source).not.toContain('styles.chapter');
    expect(source).not.toContain('styles.principles');
    expect(source).not.toContain('styles.trustColumns');
    expect(html).not.toContain('Layers panel → Add layer mask');
    expect(html).not.toContain('Add to Render Queue');
    expect(html).not.toContain('Built around learning, not task completion.');
    expect(html).not.toContain('You choose when Kairo looks and listens.');
    expect(html).not.toContain('You remain the operator.');
    expect(html).not.toContain('Honest limits');
  });

  test('keeps Blender workflow steps inside the product preview', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const previewStart = html.indexOf('<figure');
    const previewEnd = html.indexOf('</figure>') + '</figure>'.length;
    const lessonStart = html.indexOf('<section id="lesson"');
    const lessonEnd = html.indexOf('<section id="skills"');
    const productPreview = html.slice(previewStart, previewEnd);
    const lesson = html.slice(lessonStart, lessonEnd);

    ['Select cube', 'Insert keyframe', 'Move to frame 40'].forEach((step) => {
      expect(productPreview).toContain(step);
      expect(lesson).not.toContain(step);
    });
  });

  test('uses the revised waitlist invitation and keeps the mock disclosure', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));

    expect(html).toContain('What do you want to learn?');
    expect(html).toContain('Join the early group and tell us which app you want help with.');
    expect(html).toContain('<button type="submit">Join the alpha</button>');
    expect(html).toContain('Preview mode. This form does not send or store your email yet.');
  });

  test('uses a high-resolution Blender source with cube-aligned overlays', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const image = readFileSync('public/kairo-blender-preview.webp');
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');
    const dimensions = image.readUInt32LE(21);

    expect(html).toContain('kairo-blender-preview.webp');
    expect(image.toString('ascii', 0, 4)).toBe('RIFF');
    expect(image.toString('ascii', 8, 16)).toBe('WEBPVP8L');
    expect((dimensions & 0x3fff) + 1).toBeGreaterThanOrEqual(1698);
    expect(((dimensions >>> 14) & 0x3fff) + 1).toBeGreaterThanOrEqual(1054);
    expect(image.byteLength).toBeLessThan(1_500_000);
    expect(html).toContain('Interface capture:');
    expect(html).not.toContain('Blender Manual');
    expect(css).toMatch(
      /\.softwareFrame\s*\{[^}]*min-height:\s*0;[^}]*aspect-ratio:\s*3560 \/ 1972;/s
    );
    expect(css).not.toMatch(
      /@media \(max-width:\s*980px\)[\s\S]*\.softwareFrame\s*\{[^}]*aspect-ratio:\s*16 \/ 11;/s
    );
    expect(css).toMatch(/\.softwareFrame > img\s*\{[^}]*opacity:\s*1;/s);
    expect(css).toMatch(
      /\.kairoTarget\s*\{[^}]*top:\s*40\.3%;[^}]*left:\s*44\.3%;[^}]*width:\s*11\.8%;[^}]*height:\s*23%;/s
    );
    expect(css).toMatch(
      /\.learnerAnnotation\s*\{[^}]*top:\s*39\.8%;[^}]*left:\s*39\.35%;[^}]*width:\s*21%;/s
    );
  });

  test('uses semantic color roles and accessible motion fallbacks', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(css).toContain('#fcfcfa');
    expect(css).toContain('#151515');
    expect(css).toContain('#ff6547');
    expect(css).toContain('#8b79ff');
    expect(css).toContain('#78caaa');
    expect(css).toContain('#3078ff');
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain("[data-motion-ready='true']");
    expect(css).not.toContain('scroll-snap');
    expect(css).not.toContain('linear-gradient');
    expect(css).not.toContain('radial-gradient');
  });

  test('uses color signal scenes to make the teaching loop visual', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    ['You ask', 'Kairo guides', 'Step checked', 'Ask / Figma', 'Guide / Photoshop', 'Check / DaVinci Resolve'].forEach((label) => {
      expect(html).toContain(label);
    });
    expect(html.match(/data-scroll="learning-scene"/g)).toHaveLength(3);
    expect(css).toMatch(/\.learningrunway\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s);
    expect(css).toContain(".learningScene[data-tone='learner']".toLowerCase());
    expect(css).toContain(".learningScene[data-tone='kairo']".toLowerCase());
    expect(css).toContain(".learningScene[data-tone='verified']".toLowerCase());
  });

  test('marks page-wide motion roles without hiding structural content', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const source = readFileSync('src/landing/LandingPage.tsx', 'utf8');
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');

    expect((html.match(/data-scroll=/g) ?? []).length).toBeGreaterThanOrEqual(12);
    expect(html).toContain('data-scroll="runway-header"');
    expect(html).toContain('data-scroll="learning-scene"');
    expect(html).toContain('data-scroll="trust"');
    expect(html).toContain('data-scroll="access-form"');
    expect(html.match(/data-scroll-index=/g) ?? []).toHaveLength(7);
    expect(html).toContain('data-scroll-index="3"');
    expect(source).toContain("page.querySelectorAll('[data-scroll]')");
    expect(source).toContain("element.setAttribute('data-scroll-visible', 'true')");
    expect(source).toContain('scrollObserver.unobserve(element)');
    expect(source).toContain("rootMargin: '0px 0px -96px 0px'");
    expect(source).toContain('requestAnimationFrame(reconcileVisibleScrollTargets)');
    expect(source).toContain("window.addEventListener('pageshow', reconcileVisibleScrollTargets)");
    expect(source).toContain("window.addEventListener('resize', reconcileVisibleScrollTargets)");
    expect(source).not.toContain('lessonStepElements.slice');
    expect(css).toContain("[data-scroll-visible='true']");
    expect(css).not.toMatch(/\[data-motion-ready='true'\] \[data-scroll\]\s*\{[^}]*opacity:\s*0;/s);
    [25, 50, 75, 100].forEach((delay, index) => {
      expect(css).toMatch(new RegExp(`\\[data-scroll-index='${index + 1}'\\]\\[data-scroll-visible='true'\\]\\s*\\{[^}]*transition-delay:\\s*${delay}ms;`, 's'));
    });
    const scrollDelays = [...css.matchAll(/transition-delay:\s*(\d+)ms;/g)].map((match) => Number(match[1]));
    expect(Math.max(...scrollDelays)).toBeLessThanOrEqual(210);
  });

  test('offers a demo control and gates every looping preview animation with its state', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const source = readFileSync('src/landing/LandingPage.tsx', 'utf8');
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');
    const runningRule = css.match(/\.landingPage\[data-motion-ready='true'\]\[data-demo-active='true'\]\[data-page-visible='true'\]\[data-demo-paused='false'\][\s\S]*?\{[^}]*animation-play-state:\s*running;[^}]*\}/s)?.[0] ?? '';

    expect(html).toContain('type="button"');
    expect(html).not.toContain('aria-pressed="false"');
    expect(html).toContain('Pause demo');
    expect(source).toContain('data-demo-paused={demoPaused}');
    expect(source).toContain("page.dataset.demoActive = String(entry.isIntersecting)");
    expect(source).toContain("page.dataset.pageVisible = String(!document.hidden)");
    ['learnerAsk', 'learnerAnnotation', 'kairoTarget', 'kairoCursor', 'notch', 'progressRail', 'verified', 'wave'].forEach((className) => {
      expect(runningRule).toContain(`.${className}`);
    });
  });

  test('renders the final lesson and preview state for reduced motion', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');
    const reducedMotion = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));

    expect(reducedMotion).toMatch(/\[data-scroll\],[\s\S]*?\[data-scroll\]::after\s*\{[^}]*opacity:\s*1 !important;[^}]*transform:\s*none !important;[^}]*transition:\s*none !important;/s);
    expect(reducedMotion).toMatch(/\.landingPage \.demoControl\s*\{[^}]*display:\s*none;/s);
    expect(reducedMotion).toMatch(/\.landingPage \.learnerAsk,[\s\S]*?\.landingPage \.progressRail \.verified\s*\{[^}]*animation:\s*none !important;[^}]*opacity:\s*1 !important;/s);
    expect(reducedMotion).toMatch(/\.landingPage \.learnerAnnotation path\s*\{[^}]*stroke-dashoffset:\s*0 !important;/s);
  });

  test('uses an asymmetric split hero that stacks below desktop', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(html).toMatch(/class="[^"]*headlineDoing[^"]*"/);
    expect(html).toMatch(/class="[^"]*headlineContrast[^"]*"/);
    expect(html).toMatch(/by doing\.<\/span> <span class="[^"]*headlineContrast[^"]*">Not watching\.<\/span>/);
    expect(css).toMatch(/@media \(min-width:\s*1180px\)[\s\S]*\.hero\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(390px,\s*0\.78fr\) minmax\(0,\s*1\.42fr\);/s);
    expect(css).toMatch(/@media \(min-width:\s*1180px\)[\s\S]*\.headlinedoing\s*\{[^}]*display:\s*block;/s);
    expect(css).toMatch(/@media \(max-width:\s*1179px\)[\s\S]*\.hero\s*\{[^}]*display:\s*block;/s);
    expect(css).toMatch(/\.softwareframe\s*\{[^}]*aspect-ratio:\s*3560 \/ 1972;/s);
  });

  test('gives the hero, skills ending, and trust section room to breathe', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(css).toMatch(/\.herocopy h1\s*\{[^}]*margin-bottom:\s*clamp\(88px,\s*7vw,\s*112px\);/s);
    expect(css).toMatch(/\.anysoftware\s*\{[^}]*margin:\s*48px 0 0;[^}]*padding:\s*28px 0 0;[^}]*border-top:/s);
    expect(css).toMatch(/\.trust\s*\{[^}]*padding:\s*88px 0 96px;/s);
  });

  test('reserves violet for Kairo product states instead of generic interactions', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(css).toMatch(/\.landingpage :focus-visible\s*\{[^}]*outline:\s*2px solid currentcolor;/s);
    expect(css).not.toMatch(/\.landingpage :focus-visible\s*\{[^}]*var\(--kairo\)/s);
    expect(css).not.toMatch(/\.header nav a:hover,[^}]*\{[^}]*color:\s*var\(--kairo(?:-ink)?\);/s);
  });

  test('styles one continuous lesson spine and connected skill layers', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(css).toMatch(/\.lessonspine\s*\{[^}]*border-left:\s*1px solid var\(--line-strong\);/s);
    expect(css).toMatch(/\.skilllayers\s*\{[^}]*grid-template-columns:/s);
    expect(css).toMatch(/\.productskilllayer\s*\{[^}]*border-left:\s*1px solid var\(--line\);/s);
    expect(css).not.toContain('.chaptervisual');
    expect(css).not.toContain('.faketoolbar');
    expect(css).not.toContain('.trustcolumns');
    expect(css).not.toContain('.principles');
  });

  test('styles waitlist messages through CSS module classes', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(css).toContain('.waitlisterror');
    expect(css).toContain('.waitlistnote');
    expect(css).not.toContain('#waitlist-error');
    expect(css).not.toContain('#waitlist-note');
  });

  test('simplifies the native-ratio preview on mobile with a compact transcript', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();
    const mobileCss = css.slice(css.indexOf('@media (max-width: 640px)'));

    expect(html).toContain('aria-label="Mobile lesson summary"');
    expect(html).toContain('Ask');
    expect(html).toContain('Step');
    expect(html).toContain('Check');
    expect(css).toMatch(/\.mobiletranscript\s*\{[^}]*display:\s*none;/s);
    expect(mobileCss).toMatch(/\.mobiletranscript\s*\{[^}]*display:\s*grid;/s);
    expect(mobileCss).toMatch(/\.softwareframe\s*\{[^}]*aspect-ratio:\s*3560 \/ 1972;/s);
    expect(mobileCss).toMatch(/\.learnerask,[\s\S]*?\.progressrail\s*\{[^}]*display:\s*none;/s);
    expect(mobileCss).toMatch(/\.skilllayers\s*\{[^}]*grid-template-columns:\s*1fr;/s);
    expect(mobileCss).toMatch(/\.productskilllayer\s*\{[^}]*border-left:\s*0;/s);
  });

  test('keeps only the hero display-sized and scales it with the viewport', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();
    const heroRule = css.match(/\.landingpage h1\s*\{([^}]*)\}/s)?.[1] ?? '';
    const viewportScale = Number(heroRule.match(/font-size:\s*clamp\([^,]+,\s*([\d.]+)vw,/)?.[1]);

    expect(css).toMatch(/\.landingpage h1\s*\{[^}]*font-size:\s*clamp\(/s);
    expect(css).toMatch(/\.sectionheader h2,[\s\S]*?\.access h2\s*\{[^}]*font-size:\s*clamp\(/s);
    expect(heroRule).toMatch(/max-width:\s*none;/);
    expect(heroRule).not.toContain('white-space: nowrap');
    expect(viewportScale).toBeLessThanOrEqual(7.4);
    expect(css).not.toContain('17cqi');
  });

});
