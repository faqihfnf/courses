/*
   DATA COURSE & WEBINAR

   Ada dua tipe isi, masing-masing jadi satu tab di sidebar: "Course" dan
   "Webinar". Di dalam tab, isi dikelompokkan per category (bisa dibuka-
   tutup). Urutan di daftar ini = urutan di sidebar; urutan kelompok
   mengikuti kemunculan pertama category-nya.

   Semua tipe punya:
     type      : "course" atau "webinar"
     category  : kelompok di sidebar, contoh "HR" atau "Data". Tidak perlu
                 didaftarkan di tempat lain. Nama yang sama boleh dipakai di
                 course dan webinar; tiap tab punya kelompoknya sendiri.
                 Kalau dikosongkan, masuk kelompok "Lainnya".
     slug      : dipakai di alamat, contoh course.faqih.id/#dasar-payroll.
                 Harus unik di seluruh daftar, course maupun webinar.
     title     : judul di sidebar, halaman, dan bilah atas

   type: "course" — beberapa sesi, tiap sesi beberapa lesson (video)
     sessions  : [{ title, lessons: [{ slug, title, youtubeId }] }]
                 slug lesson cukup unik di dalam course-nya sendiri; alamatnya
                 jadi #slug-course/slug-lesson. Tombol "Lanjut" mengikuti
                 urutan lesson di sini, menyeberang antar sesi.

   type: "webinar" — satu video saja
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
    category: "HR",
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
    category: "HR",
    slug: "basic-payroll-process",
    title: "Basic Payroll Process",
    description: "Rekaman sharing tentang siklus payroll dari absen sampai gaji.",
    youtubeId: "jkXrvXnojZI",
  },
];
