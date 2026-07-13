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

  test('uses the field-guide hero language and text actions', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));

    expect(html).toContain('Kairo / a tutor inside your software');
    expect(html).toContain('Talk or circle what you mean. Kairo answers aloud with one next step');
    expect(html).toContain('Join the Mac alpha');
    expect(html).toContain('See one complete lesson');
    expect(html).toContain('↗');
    expect(html).toContain('↓');
    expect(html).toContain('One lesson, shown in Blender');
    expect(html).toContain('Blender skill active');
    expect(html).toContain('Kairo understood: cube');
    expect(html).toContain('You asked + circled');
  });

  test('presents the base tutor and product skills as distinct layers', () => {
    const html = renderToStaticMarkup(createElement(LandingPage)).replaceAll('&#x27;', "'");

    expect(html).toContain('Works anywhere. Gets deeper with product skills.');
    expect(html).toContain("Kairo can guide from the screen alone. Add a product skill for lessons that know the software's tools, language, and workflows.");
    expect(html).toContain('In any desktop app');
    ['Sees the current screen', 'Hears the question', 'Understands the annotation', 'Points to the next control', 'Checks the visible result'].forEach((capability) => {
      expect(html).toContain(capability);
    });
    expect(html).toContain('With a product skill');
    ['Knows app terminology', 'Teaches complete workflows', 'Anticipates common mistakes', 'Loads structured lesson recipes'].forEach((capability) => {
      expect(html).toContain(capability);
    });
    expect(html).toContain('Blender');
    expect(html).toContain('modelling, animation, materials, rendering');
    expect(html).toContain('Photoshop');
    expect(html).toContain('layers, masks, retouching, compositing');
    expect(html).toContain('DaVinci Resolve');
    expect(html).toContain('editing, color, audio, delivery');
    expect(html).toContain('Figma');
    expect(html).toContain('layout, components, prototyping');
    expect(html).toContain('And any other desktop software, even without a dedicated skill.');
  });

  test('states that learners can pause guidance', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));

    expect(html).toContain('Pause it anytime.');
  });

  test('renders one complete lesson in causal order', () => {
    const html = renderToStaticMarkup(createElement(LandingPage)).replaceAll('&#x27;', "'");
    const beats = ['You ask or point', 'Kairo understands', 'One next step', 'You do it', 'Kairo checks'];
    const beatPositions = beats.map((beat) => html.indexOf(beat));

    beatPositions.forEach((position) => expect(position).toBeGreaterThan(-1));
    expect(beatPositions).toEqual([...beatPositions].sort((a, b) => a - b));
    expect(html).toContain('A lesson moves only when you do.');
    expect(html).toContain("Why won't these cards resize with the frame?");
    expect(html).toContain('Cards / horizontal resizing');
    expect(html).toContain('Set horizontal resizing to Fill container.');
    expect(html).toContain('aria-label="Kairo spoken response"');
    expect(html).toContain('Kairo answers aloud');
    expect(html).toContain('Changed to Fill container.');
    expect(html).toContain('Cards resize with the frame. Next step ready.');
  });

  test('places the learning distinction immediately after the hero', () => {
    const html = renderToStaticMarkup(createElement(LandingPage)).replaceAll('&#x27;', "'");
    const previewEnd = html.indexOf('</figure>') + '</figure>'.length;
    const distinction = 'Tutorials make you leave the work. Agents take over the work. Kairo teaches you inside it.';
    const distinctionPosition = html.indexOf(distinction);
    const lessonPosition = html.indexOf('A lesson moves only when you do.');

    expect(distinctionPosition).toBeGreaterThan(previewEnd);
    expect(distinctionPosition).toBeLessThan(lessonPosition);
    expect(html).toContain('It starts from your screen, gives one move, waits while you try it, and checks before continuing.');
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

    expect(html).toContain('Bring the software you want to learn.');
    expect(html).not.toContain('What software do you want to learn?');
    expect(html).toContain('Join the Mac alpha and bring the software you already use.');
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

  test('marks page-wide motion roles and reveals each one with a shared observer', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const source = readFileSync('src/landing/LandingPage.tsx', 'utf8');
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');

    expect((html.match(/data-scroll=/g) ?? []).length).toBeGreaterThanOrEqual(14);
    expect(html).toContain('data-scroll="distinction-heading"');
    expect(html).toContain('data-scroll="lesson-step"');
    expect(html).toContain('data-scroll="skill-layer-base"');
    expect(html).toContain('data-scroll="skill-layer-product"');
    expect(html).toContain('data-scroll="trust"');
    expect(html).toContain('data-scroll="access-form"');
    expect(source).toContain("page.querySelectorAll('[data-scroll]')");
    expect(source).toContain("element.setAttribute('data-scroll-visible', 'true')");
    expect(source).toContain('scrollObserver.unobserve(element)');
    expect(source).not.toContain('lessonStepElements.slice');
    expect(css).toContain("[data-scroll-visible='true']");
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
    expect(css).toMatch(/\.productskilllayer\s*\{[^}]*border-left:\s*1px solid var\(--line-strong\);/s);
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
