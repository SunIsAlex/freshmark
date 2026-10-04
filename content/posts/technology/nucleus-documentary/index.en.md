---
title: "NUCLEUS: A Six-Minute History of Nuclear Energy, Built Entirely from Code"
date: "2026-10-03"
summary: "A bilingual documentary short about nuclear energy, from Becquerel's photographic plate to fusion, made without a camera, a video model or a GPU: shaders, archival scans, a synthesized score, three 3Blue1Brown-style explainers, and a lot of automated checking."
lang: "en"
translationKey: "nucleus-documentary"
alternate: "/posts/technology/nucleus-documentary/"
tags:
  - Documentary
  - Nuclear Physics
  - Video Production
  - AI
  - GLSL
categories:
  - Technology
  - Physics
featured: false
---

![The cover of NUCLEUS: a uranium nucleus splitting, with the bilingual title](cover.jpg "NUCLEUS · 原子核 — A Brief History of Nuclear Energy")

<!-- Embed the video here once it is uploaded, for example:
<iframe src="https://player.bilibili.com/player.html?bvid=BV..." width="100%" height="480" frameborder="0" allowfullscreen></iframe>
-->

**NUCLEUS** is a 5-minute-48-second documentary short about nuclear energy. It starts with a photographic plate that fogged in a drawer in Paris in 1896 and ends with machines that are trying to build a small star on Earth. It has bilingual subtitles (Simplified Chinese above, English below), an original score, and three animated explainers written for high-school students.

It was also made without a camera, a video-generation model or a graphics card. Every frame was computed by code: GLSL shaders, cairo vector graphics and Python, rendered on the CPU of an Android phone in a Termux shell. Claude Opus 5.5, working in Claude Code, wrote the code, sourced and checked the facts and archival images, composed the music, and ran the quality checks. I directed: I set the brief, approved the storyboard, and asked for each round of additions.

This article covers both halves: what the film shows, and how it was made.

## The film

The story runs in chronological order, with three pauses to explain the science behind it.

| Time | Chapter |
|---|---|
| 0:00 | Opening: everything is made of atoms |
| 0:12 | **Explainer:** natural radioactivity (Becquerel 1896, the Curies 1898, α/β/γ, half-life) |
| 0:48 | Rutherford's gold-foil experiment (1909) and the nucleus (1911) |
| 1:12 | Chadwick's neutron (1932) and fission in Berlin (1938) |
| 1:33 | The chain reaction and Einstein's letter (1939) |
| 1:48 | Chicago Pile-1 (1942) and the Manhattan Project |
| 2:03 | Trinity, the first nuclear test (16 July 1945) |
| 2:15 | Hiroshima and Nagasaki (August 1945) |
| 2:36 | The first nuclear electricity: EBR-I (1951), Obninsk (1954), Calder Hall (1956) |
| 2:54 | **Explainer:** how a reactor stays in control (a Markov chain) |
| 3:30 | Chernobyl (1986), Pripyat, and Fukushima Daiichi (2011) |
| 3:54 | Fusion: the Sun, NIF ignition (2022), ITER |
| 4:18 | **Explainer:** how a tokamak holds a plasma (in the style of 3Blue1Brown) |
| 4:54 | Finale and credits: 58 pioneers of nuclear science |

![Becquerel's 1896 plate on a lamp-lit desk](becquerel-plate.jpg "Becquerel's own plate (public domain). His note reads “Papier noir. Croix de cuivre mince.”")

The historical scenes mix generated 3D shots with real material: Becquerel's plate, the Curies in their laboratory, the 1911 page of Rutherford's paper, the Trinity fireball, the Calder Hall power station, Chernobyl's Unit 4, the Pripyat Ferris wheel, a satellite image of Fukushima, and an aerial photograph of ITER. Each archival image is credited on screen while it is visible.

![A neutron splits a uranium nucleus; the reaction equation appears term by term](fission.jpg "Fission, with its balanced reaction equation")

Three nuclear reactions appear as equations, revealed term by term and checked for balanced mass and charge: Chadwick's neutron reaction, uranium fission and deuterium–tritium fusion.

### Three explainers for high-school students

The explainers slow the film down to show *why*, not only *what*.

**Natural radioactivity.** After Becquerel and the Curies, an unstable nucleus emits three kinds of radiation. Paper stops alpha, aluminium stops beta, and gamma takes thick lead or concrete. Then 128 simulated nuclei decay at random. Each decay is a flash on screen and a Geiger click in the soundtrack, and the count halves at every half-life:

$$N(t) = N_0 \left(\tfrac{1}{2}\right)^{t/T_{1/2}}$$

![Alpha, beta and gamma radiation and the materials that stop them](alpha-beta-gamma.jpg "Paper, aluminium and lead")

![128 nuclei decaying at random beside a live N(t) graph](half-life.jpg "The count lands on 64, 32, 16 and 8 at each half-life; real half-lives below")

**How a reactor stays in control.** We follow one neutron. Its fate is a chain of chances: it may split a uranium-235 nucleus, be captured, be absorbed by a control rod, or escape. The next step depends only on its current state, which is what makes this a Markov chain. A "dice bar" picks each step on the beat. Each fission frees about 2.4 neutrons, so the average number of new neutrons per neutron is

$$k = \nu \, P_{\text{fission}} \approx 2.4 \times 0.42 \approx 1.0$$

With $k < 1$ the reaction dies out, and with $k > 1$ it grows. Pushing control rods of boron or cadmium in raises the chance of absorption and lowers $k$. The segment ends on the detail that makes reactors controllable: about 0.65% of the neutrons from uranium-235 come out seconds late, from fission fragments. The probabilities are labelled as illustrative values; ν ≈ 2.4 and the 0.65% are the real uranium-235 numbers.

![One neutron's fate as a Markov chain](markov-chain.jpg "Fission, captured, control rod or escape, each with its probability")

![Control rods in a reactor core, with k and the power output](control-rods.jpg "Rods out: k = 1.10. Rods in: k = 0.90. Balanced: k = 1.00")

**How a tokamak holds a plasma.** No material can touch a 150-million-degree plasma, so a tokamak holds it with magnetic fields. In a uniform field a charged particle spirals around a field line, pushed by the Lorentz force $\mathbf{F} = q\,\mathbf{v}\times\mathbf{B}$. Bend the field into a ring and it becomes stronger on the inside ($B \propto 1/R$), so ions drift one way and electrons the other, into the wall. A current in the plasma adds a second field and twists the lines into helices. Riding the twist, each particle spends as long above the midplane as below it, and the drift cancels. In the cross-section inset, the guiding centre follows

$$\frac{d\mathbf{r}}{dt} = \Omega\,\hat{\mathbf{z}}\times\mathbf{r} - v_d\,\hat{\mathbf{y}}$$

whose solution is a closed, slightly shifted circle instead of a path into the wall.

![A charged particle spiralling around magnetic field lines](gyration.jpg "One gyration per beat of the music")

![Twisted field lines on a torus, with a cross-section showing a closed orbit](twisted-field.jpg "With the twist, the orbit closes")

![The whole tokamak: field coils, central solenoid and plasma](tokamak.jpg "Tokamak: Russian for “toroidal chamber with magnetic coils”")

## How it was made

### A timeline in bars, not seconds

The film is built on one file, `timeline.py`. The music runs at 80 BPM in 4/4, so one bar lasts exactly three seconds, and every scene, cut, subtitle, on-screen dateline and sync point is defined in bars and beats. The renderer, the score and the subtitle generator all read the same file. Synchronization is therefore by construction: the Chernobyl explosion, the fusion flash and the fission split land on a downbeat because they are *defined* as downbeats.

The same choice made the film easy to extend. The three explainers were added after a finished four-minute version existed. Each one is a twelve-bar insert, so everything after it shifted by a whole number of bars. Only the new material and its transitions (2,772 frames) had to be rendered and spliced in, instead of all 8,352.

### Pictures from shaders

The 3D shots are ray-marched in GLSL fragment shaders through a headless OpenGL context on Mesa's CPU renderer (llvmpipe): gold foil, nuclei, the chain-reaction cascade, Chicago Pile-1, the pocket watch at Hiroshima, the paper lanterns. Every scene goes through one shared post-processing chain: bloom, anamorphic streaks, halation, depth of field, a filmic tone curve, colour grade, film grain and a 2.39:1 letterbox. That shared chain makes 26 very different scenes look like one film.

A typical frame took 1.7–3 seconds. The film was rendered in four-second chunks to a near-lossless intermediate, so a crash or an interrupted session cost one chunk, never the whole render.

### Real paper, real photographs

Historical material comes from Wikimedia Commons and the Internet Archive, with the licence checked for every file. Photographs get slow camera moves and a film treatment, and papers are laid on a lamp-lit desk with a highlighter sweep over the key sentence. Rutherford's 1911 page is the real scan. The 1932 and 1939 papers are still under copyright, so they appear as typeset recreations of verified sentences and are labelled as such on screen.

### Explainers in the style of 3Blue1Brown

The explainers needed a different look: clean vector graphics, LaTeX-style mathematics, and smooth 3D on a dark background. They were drawn with a small module written for the project, using cairo for shapes, Pillow for text (including Chinese), and a 3D camera that draws curves and surfaces back to front. The palette borrows Manim's default colours, and the mathematics is set in Computer Modern. The diagrams pass through the same post-processing chain as the rest of the film with a "clean" grade, so they dissolve into and out of the cinematic scenes without a visible seam.

### A score made from scratch

There are no samples in the music. Every instrument is synthesized in Python: felt piano, strings, plucks, celesta, bells, choir, taiko, sub-bass impacts, risers and Geiger-counter clicks. The score is mixed with synthetic reverbs and mastered to −16 LUFS. Visual and musical events come from the same data, so every Geiger click you hear is a flash you see. In the explainers, each fate of the neutron has its own sound, the $k = 0.9$, $1.1$ and $1.0$ curves fall, rise and hold a note, and the particle completes one gyration per beat.

### Every fact checked

Every date, number and quotation on screen is listed in a fact sheet with its sources. This caught real errors. The word "radioactivity" was introduced in a joint paper by both Curies, so the subtitle credits both of them. The first draft of the tokamak explainer had the drift direction backwards, and it was corrected before rendering.

### Automated quality control

Most of the problems that would have embarrassed us were found by scripts, not by eye:

- **A/V sync.** A script measures the audio onset and the picture change at every scripted event. It found one flash two frames (83 ms) late; now every hard hit lands on its exact frame.
- **Framing.** Three archival camera moves briefly showed black edges beyond the photograph. A script now checks that every move stays inside its image.
- **Colour.** The intermediates used ffmpeg's default BT.601 colour matrix, while players assume BT.709 for HD video. The deliverables are converted and tagged correctly.
- **Subtitles.** A frame is checked at every cue for collisions with on-screen text, and the burned and clean versions are verified separately.
- **Seams.** Where new footage meets reused footage, a script compares frame differences. It caught a plasma flicker that depended on absolute time.

![The scrolling credits list of 58 pioneers of nuclear science](pioneers.jpg "The end credits: 58 pioneers, from Becquerel to the present, each with a contribution")

## By the numbers

| | |
|---|---|
| Runtime | 5:48 (8,352 frames at 24 fps) |
| Scenes | 23 historical scenes and 3 explainers |
| Subtitle cues | 64, in Chinese and English |
| Pioneers in the credits | 58 |
| Rendering speed | 1.7–3 s per cinematic frame, 0.5–1 s per explainer frame, on a phone CPU |
| Versions | 3:15, then 4:00 (papers, equations, credits), then 5:48 (explainers) |

## What we learned

- **Decide the scope first.** Almost all the rework came from features added after a version was finished.
- **Make time musical.** A bar-based timeline made sync automatic and late insertions cheap.
- **Approve stills before motion.** A storyboard with one still per scene is the cheapest place to change direction.
- **Trust measurements over impressions.** Each automated check found a real defect that looked fine in passing.

## Credits and licence

The score, animation, typography and visual effects were made for this film. The archival images are public domain, OGL, CC BY or CC BY-SA. Because four CC BY-SA photographs (Obninsk, Chernobyl, Pripyat and Fukushima) appear in modified form, the film is shared under CC BY-SA 4.0. The explainers are inspired by 3Blue1Brown; they are not affiliated with or made by 3Blue1Brown.
