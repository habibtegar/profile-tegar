# TODO: Fix Hamburger Button Responsive

## Problem
- Tombol hamburger (responsive) memiliki background hitam di beberapa browser karena `background: none;` tidak cukup efektif pada elemen `<button>`.
- Posisi tombol terasa "jauh" karena padding navbar dan padding tombul yang besar, serta gap antar garis terlalu renggang.
- `skill.css` tidak memiliki styling hamburger menu sama sekali.

## Plan
- [x] Update `style.css` — perbaiki .hamburger styling
- [x] Update `about.css` — perbaiki .hamburger styling
- [x] Update `contact.css` — perbaiki .hamburger styling
- [x] Update `projek.css` — perbaiki .hamburger styling
- [x] Update `skill.css` — tambahkan hamburger & mobile nav styling

## Changes Detail
1. `.hamburger`: ubah `background: none;` → `background: transparent; background-color: transparent;`
2. `.hamburger`: hapus `padding: 5px;` (jadi `padding: 0;`)
3. `.hamburger`: kecilkan `gap: 5px;` → `gap: 4px;`
4. Navbar mobile: padding `5%` → `4%`
5. `skill.css`: tambahkan seluruh `.hamburger` styling & media query mobile nav

