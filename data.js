/*
   DATA COURSE & WEBINAR

   Ada dua tipe isi. Urutan di daftar ini = urutan di sidebar; course masuk
   kelompok "Course", webinar masuk kelompok "Sharing & Webinar".

   type: "course" — beberapa sesi, tiap sesi beberapa lesson (video)
     slug      : dipakai di alamat, contoh course.faqih.id/#dasar-payroll
     title     : judul di sidebar, breadcrumb, dan bilah atas
     sessions  : [{ title, lessons: [{ slug, title, youtubeId }] }]
                 slug lesson cukup unik di dalam course-nya sendiri; alamatnya
                 jadi #slug-course/slug-lesson. Tombol "Lanjut" mengikuti
                 urutan lesson di sini, menyeberang antar sesi.

   type: "webinar" — satu video saja
     slug, title  : sama seperti course
     description  : keterangan singkat di bawah video, boleh dikosongkan
     youtubeId    : lihat di bawah

   youtubeId : bagian setelah "v=" di alamat YouTube, contoh
               youtube.com/watch?v=INI_ID_NYA → "INI_ID_NYA".
               Alamat pendek youtu.be/INI_ID_NYA juga bisa diambil ujungnya.
               Video boleh unlisted. Kalau masih kosong, halaman menampilkan
               kotak "Video belum tersedia".
*/

const CONTENT = [
  {
    type: "course",
    slug: "dasar-payroll",
    title: "Dasar-Dasar Payroll",
    sessions: [
      {
        title: "Pengantar Payroll",
        lessons: [
          { slug: "apa-itu-payroll", title: "Apa itu Payroll?", youtubeId: "" },
          { slug: "komponen-gaji", title: "Komponen Gaji", youtubeId: "" },
        ],
      },
      {
        title: "Perhitungan Pajak",
        lessons: [
          { slug: "pph-21-dasar", title: "PPh 21 Dasar", youtubeId: "" },
          { slug: "studi-kasus", title: "Studi Kasus", youtubeId: "" },
        ],
      },
    ],
  },
  {
    type: "webinar",
    slug: "update-uu-2026",
    title: "Update UU Ketenagakerjaan 2026",
    description: "Rekaman sharing tentang perubahan Undang-Undang Ketenagakerjaan 2026 dan dampaknya pada kebijakan HR.",
    youtubeId: "",
  },
];
