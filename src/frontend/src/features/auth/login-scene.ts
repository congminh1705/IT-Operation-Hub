export function mountLoginScene(host: HTMLElement) {
  const page = host.querySelector<HTMLElement>(".access-page")!;
  const scene = document.createElement("div");
  scene.className = "login-scene";
  scene.setAttribute("aria-hidden", "true");
  scene.innerHTML =
    '<div class="login-scene-map"></div><div class="login-scene-light"></div><div class="login-scene-cursor"></div><div class="login-scene-route"></div>';
  const routes = [
    ["support", "4%", "27%", "25%", "-16deg", "4.7s", "-1.5s"],
    ["support", "7%", "46%", "20%", "-16deg", "3.8s", "-2.2s"],
    ["meeting", "2%", "69%", "22%", "-16deg", "5.6s", "-3.8s"],
    ["server", "73%", "20%", "23%", "-16deg", "4.2s", "-1.1s"],
    ["server", "79%", "45%", "18%", "74deg", "6.2s", "-4.5s"],
    ["server", "75%", "80%", "22%", "-16deg", "5.1s", "-2.7s"],
    ["support", "16%", "15%", "18%", "74deg", "5.3s", "-3.1s"],
    ["meeting", "3%", "88%", "24%", "-16deg", "4.5s", "-1.8s"],
    ["server", "72%", "34%", "23%", "-16deg", "5.8s", "-4.2s"],
  ];
  for (const [zone, ...values] of routes) {
    const route = document.createElement("div");
    route.className = "login-scene-route login-scene-circuit";
    route.dataset.circuit = zone;
    ["x", "y", "width", "angle", "duration", "delay"].forEach((key, index) =>
      route.style.setProperty(`--circuit-${key}`, values[index]),
    );
    scene.append(route);
  }
  page.prepend(scene);
  const controls = document.createElement("section");
  controls.className = "login-scene-controls";
  controls.innerHTML =
    '<p class="login-scene-hint">KHÔNG GIAN KẾT NỐI <span>Chạm vào một khu vực để khám phá</span></p><div class="login-scene-zones"><button type="button" class="login-scene-zone" data-zone="support" aria-pressed="false"><i></i><span>01 / IT Support</span></button><button type="button" class="login-scene-zone" data-zone="meeting" aria-pressed="false"><i></i><span>02 / Phòng họp</span></button><button type="button" class="login-scene-zone" data-zone="server" aria-pressed="false"><i></i><span>03 / Hạ tầng IT</span></button></div><p class="login-scene-caption" role="status">Một không gian, kết nối mọi phòng ban.</p><button type="button" class="login-scene-motion" aria-pressed="false">Tạm dừng hiệu ứng</button>';
  page.querySelector(".access-bottom")!.before(controls);
  const events = new AbortController(),
    options = { signal: events.signal };
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const toggle = controls.querySelector<HTMLButtonElement>(
    ".login-scene-motion",
  )!;
  let selected = "",
    frame = 0;
  const captions: Record<string, string> = {
    support: "IT Support · Nơi tiếp nhận và hỗ trợ công việc mỗi ngày.",
    meeting: "Phòng họp · Nơi các phòng ban cùng trao đổi và phối hợp.",
    server: "Hạ tầng IT · Kết nối hệ thống, thiết bị và không gian làm việc.",
  };
  const paint = (zone: string) => {
    page.dataset.sceneZone = zone;
    controls.querySelector(".login-scene-caption")!.textContent =
      captions[zone] || "Một không gian, kết nối mọi phòng ban.";
  };
  controls
    .querySelectorAll<HTMLButtonElement>("[data-zone]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          selected =
            selected === button.dataset.zone ? "" : button.dataset.zone!;
          controls
            .querySelectorAll<HTMLElement>("[data-zone]")
            .forEach((b) =>
              b.setAttribute(
                "aria-pressed",
                String(b.dataset.zone === selected),
              ),
            );
          paint(selected);
        },
        options,
      );
      for (const event of ["pointerenter", "focus"])
        button.addEventListener(
          event,
          () => paint(button.dataset.zone!),
          options,
        );
      for (const event of ["pointerleave", "blur"])
        button.addEventListener(event, () => paint(selected), options);
    });
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    page.style.setProperty("--scene-x", "0px");
    page.style.setProperty("--scene-y", "0px");
    page.style.setProperty("--cursor-opacity", "0");
  };
  const sync = () => {
    const off =
      motion.matches || toggle.getAttribute("aria-pressed") === "true";
    page.classList.toggle("scene-still", off);
    toggle.disabled = motion.matches;
    toggle.textContent = motion.matches
      ? "Đã giảm chuyển động"
      : off
        ? "Bật hiệu ứng"
        : "Tạm dừng hiệu ứng";
    if (off) {
      reset();
      scene.querySelectorAll(".login-scene-ripple").forEach((r) => {
        r.getAnimations().forEach((a) => a.cancel());
        r.remove();
      });
    }
  };
  toggle.addEventListener(
    "click",
    () => {
      toggle.setAttribute(
        "aria-pressed",
        String(toggle.getAttribute("aria-pressed") !== "true"),
      );
      sync();
    },
    options,
  );
  motion.addEventListener("change", sync, options);
  sync();
  page.addEventListener(
    "pointermove",
    (event) => {
      if (
        page.classList.contains("scene-still") ||
        event.pointerType === "touch" ||
        (event.target as Element).closest("form,button,a,input")
      )
        return;
      const rect = page.getBoundingClientRect();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        page.style.setProperty(
          "--scene-x",
          `${((event.clientX - rect.left) / rect.width - 0.5) * 48}px`,
        );
        page.style.setProperty(
          "--scene-y",
          `${((event.clientY - rect.top) / rect.height - 0.5) * 32}px`,
        );
        page.style.setProperty("--cursor-x", `${event.clientX - rect.left}px`);
        page.style.setProperty("--cursor-y", `${event.clientY - rect.top}px`);
        page.style.setProperty("--cursor-opacity", "1");
      });
    },
    options,
  );
  page.addEventListener("pointerleave", reset, options);
  page.addEventListener(
    "pointerdown",
    (event) => {
      if (
        page.classList.contains("scene-still") ||
        (event.target as Element).closest(".access-form-side,button,a,input")
      )
        return;
      const rect = page.getBoundingClientRect(),
        ripple = document.createElement("span");
      ripple.className = "login-scene-ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      scene.append(ripple);
      void ripple
        .animate(
          [
            { transform: "scale(.5)", opacity: 0.9 },
            { transform: "scale(9)", opacity: 0 },
          ],
          { duration: 850, easing: "ease-out" },
        )
        .finished.then(
          () => ripple.remove(),
          () => ripple.remove(),
        );
    },
    options,
  );
  return () => {
    events.abort();
    reset();
    scene.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    scene.remove();
    controls.remove();
  };
}
