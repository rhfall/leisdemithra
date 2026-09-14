/* ============================================================
   As Leis de Mithra — comportamento do site
   ============================================================ */

/* ────────────────────────────────────────────────────────────
   CONFIGURAÇÃO DA LISTA DE ESPERA  ← EDITE AQUI

   Cole abaixo o endpoint do serviço que vai receber os e-mails.
   Funciona com Formspree, Getform, Basin, Buttondown, etc.
   Exemplo (Formspree):  "https://formspree.io/f/xdkoqwer"

   Enquanto estiver com o valor "", o formulário abre o app de
   e-mail do visitante com a inscrição já escrita (plano B, para
   o site nunca perder um cadastro). Veja o LEIA-ME.md.
   ──────────────────────────────────────────────────────────── */
const FORM_ENDPOINT = "";
const EMAIL_FALLBACK = "rafaelhfallgatter@gmail.com";

/* ── ano no rodapé ─────────────────────────────────────────── */
document.getElementById("ano").textContent = new Date().getFullYear();

/* ── navegação fixa ────────────────────────────────────────── */
const nav = document.querySelector(".nav");
const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 40);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ── revelação dos blocos ao rolar ─────────────────────────── */
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      // pequeno escalonamento entre irmãos que entram juntos
      entry.target.style.transitionDelay = `${Math.min(i, 5) * 80}ms`;
      entry.target.classList.add("is-visible");
      io.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

/* ── campo de estrelas ─────────────────────────────────────── */
(function starfield() {
  const canvas = document.getElementById("stars");
  if (!canvas) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");

  let stars = [];
  let w = 0, h = 0, dpr = 1;

  function build() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round((w * h) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.15 + 0.25,
      a: Math.random() * 0.55 + 0.15,
      // estrelas maiores piscam um pouco mais devagar
      speed: Math.random() * 0.0011 + 0.0003,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.14 ? "180,230,255" : (Math.random() < 0.1 ? "190,175,255" : "255,255,255"),
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const twinkle = reduced ? 1 : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.hue},${(s.a * twinkle).toFixed(3)})`;
      ctx.fill();
    }
    if (!reduced) requestAnimationFrame(draw);
  }

  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { build(); if (reduced) draw(0); }, 180);
  });

  build();
  reduced ? draw(0) : requestAnimationFrame(draw);
})();

/* ── formulário da lista de espera ─────────────────────────── */
(function waitlist() {
  const form = document.getElementById("waitlist");
  if (!form) return;

  const status = form.querySelector(".form__status");
  const button = form.querySelector("button[type=submit]");

  const say = (msg, isError = false) => {
    status.textContent = msg;
    status.classList.toggle("is-error", isError);
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = form.email.value.trim();
    const nome = form.nome.value.trim();

    // honeypot: preenchido = robô. Fingimos sucesso e não enviamos nada.
    if (form.empresa.value) {
      form.classList.add("is-done");
      say("Obrigado! Você está na lista.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      say("Digite um e-mail válido para continuar.", true);
      form.email.focus();
      return;
    }

    // Sem endpoint configurado: abre o app de e-mail do visitante.
    if (!FORM_ENDPOINT) {
      const assunto = encodeURIComponent("Lista de espera — As Leis de Mithra");
      const corpo = encodeURIComponent(
        `Quero ser avisado do lançamento de As Leis de Mithra.\n\nNome: ${nome || "(não informado)"}\nE-mail: ${email}`
      );
      location.href = `mailto:${EMAIL_FALLBACK}?subject=${assunto}&body=${corpo}`;
      say("Abrimos seu aplicativo de e-mail — basta enviar a mensagem para confirmar.");
      return;
    }

    button.disabled = true;
    const rotulo = button.textContent;
    button.textContent = "Enviando…";
    say("");

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, nome, origem: "site — As Leis de Mithra" }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      form.classList.add("is-done");
      say("Obrigado! Você está na lista — avisaremos assim que o livro sair.");
    } catch (err) {
      button.disabled = false;
      button.textContent = rotulo;
      say("Não conseguimos registrar agora. Tente novamente em instantes.", true);
      console.error("[lista de espera]", err);
    }
  });
})();
