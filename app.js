/* Perekat: membaca alamat (hash), memilih course/webinar dari data.js, lalu
   merender sidebar + bilah atas (lewat renderShell) dan isi halaman.

   Alamat:
     #slug                 course → lesson pertama; webinar → videonya
     #slug/slug-lesson     lesson tertentu di dalam course
   Alamat kosong atau tidak dikenal jatuh ke isi pertama di data.js. */

(() => {
  const page = document.getElementById("page");

  const GROUPS = [
    { type: "course", label: "Course" },
    { type: "webinar", label: "Webinar" },
  ];

  const ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" stroke-linejoin="round"/></svg>';
  const ICON_NEXT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_VIDEO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9.5v5l4.5-2.5z" stroke-linejoin="round"/></svg>';

  /* Buat elemen: el("a", { href: "#x", class: "y" }, "teks", anakLain).
     Teks selalu lewat textContent, jadi judul dari data.js aman. */
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === false || value == null) return;
      if (key === "html") node.innerHTML = value;
      else node.setAttribute(key, value === true ? "" : value);
    });
    node.append(...children.filter((child) => child != null && child !== false));
    return node;
  }

  const lessonsOf = (course) => course.sessions.flatMap((session) => session.lessons);

  function subtitleOf(item) {
    return item.type === "course" ? `${item.sessions.length} sesi` : "1 video";
  }

  /* --- Sidebar ------------------------------------------------------------ */

  function groupsFor(activeSlug) {
    return GROUPS.map(({ type, label }) => ({
      label,
      items: CONTENT.filter((item) => item.type === type).map((item) => ({
        title: item.title,
        subtitle: subtitleOf(item),
        href: `#${item.slug}`,
        active: item.slug === activeSlug,
      })),
    })).filter((group) => group.items.length);
  }

  /* --- Potongan halaman --------------------------------------------------- */

  /* Embed YouTube. Pakai youtube-nocookie (tanpa cookie pelacak sebelum
     diputar) dan referrerpolicy bawaan YouTube — tanpa referrer, player-nya
     menolak diputar di situs lain. */
  function video(youtubeId, title) {
    if (!youtubeId) {
      return el("div", { class: "video video-empty" }, el("div", { html: ICON_VIDEO }), el("p", {}, "Video belum tersedia."));
    }
    // Halaman yang dibuka langsung dari file tidak mengirim referrer, dan
    // YouTube menolaknya (Error 153). Jelaskan saja daripada player rusak.
    if (location.protocol === "file:") {
      return el(
        "div",
        { class: "video video-empty" },
        el("div", { html: ICON_VIDEO }),
        el("p", {}, "Video YouTube tidak bisa diputar dari file lokal."),
        el("p", {}, "Buka lewat server lokal (misalnya Live Server) atau situs yang sudah online."),
      );
    }
    return el(
      "div",
      { class: "video" },
      el("iframe", {
        src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?rel=0`,
        title,
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        referrerpolicy: "strict-origin-when-cross-origin",
        allowfullscreen: true,
      }),
    );
  }

  /* Panel kanan: semua sesi + lesson, lesson yang sedang dibuka disorot */
  function outline(course, active) {
    const total = lessonsOf(course).length;
    const panel = el(
      "aside",
      { class: "outline", "aria-label": "Daftar lesson" },
      el("div", { class: "outline-head" }, el("h2", {}, course.title), el("p", {}, `${course.sessions.length} sesi · ${total} video`)),
      el("p", { class: "outline-label" }, "All Section"),
    );

    course.sessions.forEach((session, i) => {
      const list = el("ul");
      session.lessons.forEach((lesson) => {
        list.append(
          el(
            "li",
            {},
            el(
              "a",
              {
                class: "outline-item",
                href: `#${course.slug}/${lesson.slug}`,
                "aria-current": lesson === active && "page",
                html: ICON_PLAY,
              },
              el("span", {}, lesson.title),
            ),
          ),
        );
      });
      panel.append(el("section", { class: "outline-session" }, el("h3", {}, el("span", {}, `Sesi ${i + 1}`), ` ${session.title}`), list));
    });
    return panel;
  }

  /* --- Halaman per tipe --------------------------------------------------- */

  function renderCourse(course, lesson) {
    const lessons = lessonsOf(course);
    const next = lessons[lessons.indexOf(lesson) + 1];

    const body = el(
      "article",
      { class: "lesson" },
      el(
        "div",
        { class: "lesson-body" },
        el("div", { class: "lesson-head" }, el("h1", {}, lesson.title)),
        video(lesson.youtubeId, lesson.title),
        // Lesson terakhir: tidak ada tombol Lanjut
        next && el("div", { class: "next" }, el("span", {}, "Berikutnya: ", el("strong", {}, next.title)), el("a", { class: "btn btn-next", href: `#${course.slug}/${next.slug}` }, "Lanjut", el("span", { html: ICON_NEXT }))),
      ),
    );

    page.className = "page page-course";
    page.replaceChildren(body, outline(course, lesson));
    document.title = `${lesson.title} · ${course.title} — Faqih Nur Fahmi`;
  }

  function renderWebinar(webinar) {
    const body = el(
      "article",
      { class: "lesson" },
      el("div", { class: "lesson-body" }, el("div", { class: "lesson-head" }, el("h1", {}, webinar.title)), video(webinar.youtubeId, webinar.title), webinar.description && el("p", { class: "description" }, webinar.description)),
    );

    page.className = "page page-webinar";
    page.replaceChildren(body);
    document.title = `${webinar.title} — Faqih Nur Fahmi`;
  }

  /* --- Routing ------------------------------------------------------------ */

  function route() {
    const [slug, lessonSlug] = decodeURIComponent(location.hash.slice(1)).split("/");
    const item = CONTENT.find((entry) => entry.slug === slug) || CONTENT[0];
    if (!item) return;

    let lesson = null;
    if (item.type === "course") {
      const lessons = lessonsOf(item);
      lesson = lessons.find((entry) => entry.slug === lessonSlug) || lessons[0];
    }

    // Rapikan alamat yang tidak dikenal. #course tanpa lesson tetap
    // dibiarkan pendek, sesuai tautan di sidebar.
    const known = lessonSlug && lesson && lesson.slug === lessonSlug;
    const canonical = known ? `#${item.slug}/${lesson.slug}` : `#${item.slug}`;
    if (location.hash !== canonical) history.replaceState(null, "", canonical);

    renderShell({ groups: groupsFor(item.slug), headerTitle: item.title });

    if (item.type === "course") renderCourse(item, lesson);
    else renderWebinar(item);
    page.scrollTop = 0;
  }

  renderShell({
    tagline: "Kumpulan Course & Sharing",
    sidebarLabel: "Daftar course",
    searchPlaceholder: "Cari course atau webinar",
    emptyText: "Tidak ada course atau webinar yang cocok dengan pencarian itu.",
    groups: groupsFor(null),
    headerTitle: "Pilih course",
    showSlideshow: false,
  });

  addEventListener("hashchange", route);
  route();
})();
