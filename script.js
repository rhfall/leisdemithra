/* As Leis de Mithra — lista de espera */

/* Endpoint que recebe os cadastros. Trocar aqui se mudar de serviço. */
const FORM_ENDPOINT  = "https://formspree.io/f/xrpgnraw";
const EMAIL_FALLBACK = "rafaelhfallgatter@gmail.com";

document.getElementById("ano").textContent = new Date().getFullYear();

(function waitlist(){
  const form   = document.getElementById("waitlist");
  const status = document.getElementById("form-status");
  const button = form.querySelector("button");

  const say = (msg, erro = false) => {
    status.textContent = msg;
    status.classList.toggle("is-error", erro);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();

    // honeypot: preenchido = robô. Fingimos sucesso e não enviamos nada.
    if (form.empresa.value) {
      form.classList.add("is-done");
      say("Obrigado! Você está na lista.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      say("Digite um e-mail válido.", true);
      form.email.focus();
      return;
    }

    // Sem endpoint: abre o app de e-mail do visitante (rede de segurança).
    if (!FORM_ENDPOINT) {
      const assunto = encodeURIComponent("Lista de espera — As Leis de Mithra");
      const corpo   = encodeURIComponent(`Quero ser avisado do lançamento.\n\nE-mail: ${email}`);
      location.href = `mailto:${EMAIL_FALLBACK}?subject=${assunto}&body=${corpo}`;
      say("Abrimos seu aplicativo de e-mail — basta enviar a mensagem.");
      return;
    }

    button.disabled = true;
    const rotulo = button.textContent;
    button.textContent = "Enviando…";
    say("");

    try {
      const r = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, origem: "leisdemithra.com" }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);

      form.classList.add("is-done");
      say("Obrigado! Avisaremos assim que o livro sair.");
    } catch (err) {
      button.disabled = false;
      button.textContent = rotulo;
      say("Não conseguimos registrar agora. Tente novamente em instantes.", true);
      console.error("[lista de espera]", err);
    }
  });
})();
