/* Perekat: membaca alamat (hash), memilih course/webinar dari data.js, lalu
   merender sidebar + bilah atas (lewat renderShell) dan isi halaman.

   Alamat:
     #slug                 course → lesson pertama; webinar → videonya
     #slug/slug-lesson     lesson tertentu di dalam course
   Alamat kosong atau tidak dikenal jatuh ke isi pertama di data.js. */

(() => {
  const page = document.getElementById("page");

  // Tab di sidebar, satu per type. Isi tiap tab dikelompokkan per category.
  const TABS = [
    {
      type: "course",
      label: "Course",
      // buku terbuka
      icon: '<path d="M12 6.5C10.5 5.3 8.3 4.5 5.5 4.5H3v13h2.5c2.8 0 5 .8 6.5 2m0-13c1.5-1.2 3.7-2 6.5-2H21v13h-2.5c-2.8 0-5 .8-6.5 2m0-13v13" stroke-linecap="round" stroke-linejoin="round"/>',
    },
    {
      type: "webinar",
      label: "Webinar",
      // layar dengan tombol putar
      icon: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4M10.5 8.5v5l4-2.5z" stroke-linecap="round" stroke-linejoin="round"/>',
    },
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

  /* Kelompok per category; urutan kelompok mengikuti kemunculan pertamanya
     di data.js. Tanpa category masuk "Lainnya". */
  function categoriesOf(items, activeSlug) {
    const groups = new Map();
    items.forEach((item) => {
      const label = item.category || "Lainnya";
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push({
        title: item.title,
        subtitle: subtitleOf(item),
        href: `#${item.slug}`,
        active: item.slug === activeSlug,
      });
    });
    return [...groups].map(([label, items]) => ({ label, items }));
  }

  /* Tab tanpa isi tidak ditampilkan */
  function tabsFor(activeSlug) {
    return TABS.map(({ type, label, icon }) => ({
      id: type,
      label,
      icon,
      groups: categoriesOf(
        CONTENT.filter((item) => item.type === type),
        activeSlug,
      ),
    })).filter((tab) => tab.groups.length);
  }

  /* --- Potongan halaman --------------------------------------------------- */

  /* Embed YouTube. Pakai youtube-nocookie (tanpa cookie pelacak sebelum
     diputar) dan referrerpolicy bawaan YouTube — tanpa referrer, player-nya
     menolak diputar di situs lain. */
  function player(youtubeId, title) {
    const params = new URLSearchParams({
      autoplay: "1", // dimuat karena diklik, jadi langsung putar
      rel: "0", // video terkait di akhir cuma dari channel yang sama
      iv_load_policy: "3", // sembunyikan anotasi
      playsinline: "1", // iPhone: putar di halaman, bukan layar penuh
    });
    return el("iframe", {
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?${params}`,
      title,
      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      referrerpolicy: "strict-origin-when-cross-origin",
      allowfullscreen: true,
    });
  }

  /* Sebelum diputar, tampilkan thumbnail + tombol play sendiri, bukan player
     YouTube. Player bawaan selalu memajang judul, nama channel, dan avatar
     (parameter showinfo/modestbranding untuk menyembunyikannya sudah
     dihapus YouTube). Iframe baru dimuat setelah diklik — sekalian membuat
     halaman lebih ringan. Saat video dijeda, YouTube tetap bisa memunculkan
     judulnya sebentar; itu di luar kendali kita. */
  function poster(youtubeId, title) {
    const base = `https://i.ytimg.com/vi/${encodeURIComponent(youtubeId)}`;
    const img = el("img", { src: `${base}/maxresdefault.jpg`, alt: "" });
    // Video lama/beresolusi rendah tidak punya maxresdefault; YouTube lalu
    // mengirim gambar abu-abu 120x90. Turunkan ke hqdefault.
    img.addEventListener("load", () => {
      if (img.naturalWidth <= 120) img.src = `${base}/hqdefault.jpg`;
    });
    img.addEventListener("error", () => (img.src = `${base}/hqdefault.jpg`), { once: true });

    const button = el("button", { class: "video-poster", type: "button", "aria-label": `Putar video: ${title}` }, img, el("span", { class: "video-play", html: ICON_PLAY }));
    const box = el("div", { class: "video" }, button);
    button.addEventListener("click", () => box.replaceChildren(player(youtubeId, title)));
    return box;
  }

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
    return poster(youtubeId, title);
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
        el(
          "div",
          { class: "lesson-head" },
          el("h1", {}, lesson.title),
          // Lesson terakhir: tidak ada tombol Lanjut. Judul lesson berikutnya
          // ikut di title supaya tetap terbaca saat kursor diarahkan.
          next && el("a", { class: "btn btn-next", href: `#${course.slug}/${next.slug}`, title: `Berikutnya: ${next.title}` }, "Lanjut", el("span", { html: ICON_NEXT })),
        ),
        video(lesson.youtubeId, lesson.title),
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

    renderShell({ tabs: tabsFor(item.slug), headerTitle: item.title });

    if (item.type === "course") renderCourse(item, lesson);
    else renderWebinar(item);
    page.scrollTop = 0;
  }

  renderShell({
    site: "courses",
    tagline: "Kumpulan Course & Sharing",
    sidebarLabel: "Daftar course",
    searchPlaceholder: "Cari course atau webinar",
    emptyText: "Tidak ada yang cocok di tab ini.",
    tabs: tabsFor(null),
    headerTitle: "Pilih course",
    showSlideshow: false,
  });

  addEventListener("hashchange", route);
  route();
})();
