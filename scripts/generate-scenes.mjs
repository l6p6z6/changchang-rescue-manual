import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("assets");
fs.mkdirSync(outDir, { recursive: true });

const C = {
  paper: "#FFF9F1", cream: "#FFF0DC", ink: "#4C3F4A", muted: "#8A7680",
  skin: "#FFD7C4", skinShade: "#F1B8A8", hair: "#745348", hairLight: "#9A6D5A",
  coral: "#EF91A2", coralDark: "#D86D83", blue: "#8FD2E5", blueDeep: "#4E9DBA",
  blueDark: "#274D6D", yellow: "#FFE19A", mint: "#B9DFC9", green: "#77B69A",
  sand: "#E8C89F", black: "#37313D", white: "#FFFFFF"
};

function defs(id) {
  return `
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFF9F2"/><stop offset="0.55" stop-color="#FFF1E8"/><stop offset="1" stop-color="#EAF7FA"/>
    </linearGradient>
    <linearGradient id="water-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#DDF7FC"/><stop offset="0.48" stop-color="#8FD2E5"/><stop offset="1" stop-color="#4E9DBA"/>
    </linearGradient>
    <linearGradient id="night-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#354B6D"/><stop offset="1" stop-color="#856F89"/>
    </linearGradient>
    <linearGradient id="desert-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F8D8B5"/><stop offset="1" stop-color="#D9A978"/>
    </linearGradient>
    <filter id="soft-${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>
    <pattern id="dots-${id}" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#9D7C7D" opacity="0.12"/></pattern>
    <clipPath id="panelA-${id}"><rect x="42" y="54" width="535" height="610" rx="30"/></clipPath>
    <clipPath id="panelB-${id}"><rect x="623" y="54" width="535" height="610" rx="30"/></clipPath>
  </defs>`;
}

function frame(inner, id, bg = `url(#bg-${id})`) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img">
  ${defs(id)}
  <rect width="1200" height="720" rx="34" fill="${bg}"/>
  <rect width="1200" height="720" rx="34" fill="url(#dots-${id})"/>
  <path d="M40 113 C185 77 268 130 383 101 C545 60 622 76 753 105 C899 137 1027 76 1160 111" fill="none" stroke="#D4959F" stroke-width="3" stroke-linecap="round" opacity="0.22"/>
  <path d="M92 650 C250 618 371 669 512 637 C654 605 820 667 1100 616" fill="none" stroke="#78BCD1" stroke-width="3" stroke-linecap="round" opacity="0.24"/>
  ${inner}
  <rect x="10" y="10" width="1180" height="700" rx="31" fill="none" stroke="${C.ink}" stroke-width="5" opacity="0.64"/>
  </svg>`;
}

function drop(x, y, scale = 1, opacity = 1, color = C.blue) {
  return `<path d="M0 -28 C12 -10 24 1 24 16 C24 33 12 44 0 44 C-12 44 -24 33 -24 16 C-24 1 -12 -10 0 -28 Z" transform="translate(${x} ${y}) scale(${scale})" fill="${color}" opacity="${opacity}"/>`;
}

function sparkle(x, y, scale = 1, color = C.yellow) {
  return `<path d="M0 -18 L5 -5 L18 0 L5 5 L0 18 L-5 5 L-18 0 L-5 -5 Z" transform="translate(${x} ${y}) scale(${scale})" fill="${color}"/>`;
}

function heart(x, y, scale = 1, color = C.coral) {
  return `<path d="M0 16 C-22 1 -28 -12 -19 -23 C-10 -34 4 -26 0 -13 C4 -26 18 -34 27 -23 C36 -12 25 2 0 16 Z" transform="translate(${x} ${y}) scale(${scale})" fill="${color}"/>`;
}

function phone(x, y, scale = 1, screenColor = "#2E435C", screenContent = "") {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <rect x="-76" y="-135" width="152" height="270" rx="24" fill="${C.ink}"/>
    <rect x="-67" y="-124" width="134" height="248" rx="17" fill="${screenColor}"/>
    <rect x="-22" y="-130" width="44" height="7" rx="4" fill="#221F26"/>
    <circle cx="0" cy="113" r="5" fill="#FFFFFF" opacity="0.65"/>${screenContent}
  </g>`;
}

function bottle(x, y, scale = 1, fill = 0.72, rotate = -5) {
  const waterY = 64 - 120 * fill;
  return `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})">
    <rect x="-19" y="-74" width="38" height="18" rx="7" fill="${C.coral}"/>
    <path d="M-15 -55 L-15 -37 L-34 -17 L-34 70 Q-34 88 -16 88 L16 88 Q34 88 34 70 L34 -17 L15 -37 L15 -55 Z" fill="#FFFFFF" stroke="${C.ink}" stroke-width="4"/>
    <clipPath id="bottleClip-${Math.round(x)}-${Math.round(y)}"><path d="M-15 -42 L-15 -31 L-30 -13 L-30 68 Q-30 84 -14 84 L14 84 Q30 84 30 68 L30 -13 L15 -31 L15 -42 Z"/></clipPath>
    <g clip-path="url(#bottleClip-${Math.round(x)}-${Math.round(y)})"><rect x="-34" y="${waterY}" width="68" height="170" fill="#8FD2E5"/><path d="M-36 ${waterY} Q-22 ${waterY - 9} -7 ${waterY} T23 ${waterY} T52 ${waterY}" fill="none" stroke="#EAFBFF" stroke-width="6" opacity="0.72"/></g>
    <path d="M-7 2 Q0 8 7 2" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="-10" cy="-3" r="2.4" fill="${C.ink}"/><circle cx="10" cy="-3" r="2.4" fill="${C.ink}"/>
    <rect x="-25" y="-9" width="8" height="39" rx="4" fill="#FFFFFF" opacity="0.35"/>
  </g>`;
}

function screenLine(x, y, w, color = "#FFFFFF", opacity = 0.8, h = 10) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${color}" opacity="${opacity}"/>`;
}

function changchang(x = 0, y = 0, scale = 1, opts = {}) {
  const flip = opts.flip ? -1 : 1;
  return `<g transform="translate(${x} ${y}) scale(${scale * flip} ${scale})">
    <ellipse cx="0" cy="137" rx="82" ry="19" fill="${C.ink}" opacity="0.12"/>
    <path d="M-39 57 L-58 129" stroke="${C.skinShade}" stroke-width="22" stroke-linecap="round"/>
    <path d="M34 57 L55 130" stroke="${C.skinShade}" stroke-width="22" stroke-linecap="round"/>
    <path d="M-58 129 Q-53 146 -37 145 L-24 145 L-29 119 Z" fill="${C.coralDark}"/>
    <path d="M55 130 Q54 148 35 147 L21 147 L29 119 Z" fill="${C.coralDark}"/>
    <path d="M-50 21 Q0 -4 49 20 L61 80 Q35 103 0 94 Q-34 104 -62 79 Z" fill="#F8C96D" stroke="${C.ink}" stroke-width="4"/>
    <path d="M-42 76 Q0 98 43 76 L53 108 Q0 126 -51 107 Z" fill="#E98C96" stroke="${C.ink}" stroke-width="4"/>
    <path d="${opts.armRaised ? "M-42 31 C-77 13 -87 -20 -73 -47" : "M-42 30 C-71 42 -77 69 -67 91"}" fill="none" stroke="${C.skinShade}" stroke-width="21" stroke-linecap="round"/>
    <path d="${opts.armRaised ? "M43 29 C70 21 79 0 76 -16" : "M43 29 C71 40 78 65 68 90"}" fill="none" stroke="${C.skinShade}" stroke-width="21" stroke-linecap="round"/>
    <circle cx="0" cy="-34" r="57" fill="${C.skin}" stroke="${C.ink}" stroke-width="4"/>
    <path d="M-57 -37 Q-59 -97 -6 -105 Q54 -108 59 -41 Q38 -64 12 -65 Q-30 -60 -57 -37 Z" fill="${C.hair}"/>
    <path d="M-53 -32 Q-58 -3 -42 19 Q-52 -7 -33 -38 Z" fill="${C.hair}"/>
    <path d="M53 -32 Q60 -4 43 19 Q52 -8 33 -38 Z" fill="${C.hair}"/>
    <path d="M-46 -47 Q-20 -69 7 -53 Q31 -71 51 -43 Q39 -22 8 -27 Q-6 -13 -27 -25 Q-42 -17 -46 -47 Z" fill="${C.hairLight}" opacity="0.78"/>
    <path d="M-27 -29 Q-20 -35 -13 -29" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
    <path d="M13 -29 Q20 -35 27 -29" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="-37" cy="-12" r="9" fill="#F6A6AE" opacity="0.55"/><circle cx="37" cy="-12" r="9" fill="#F6A6AE" opacity="0.55"/>
    <path d="M-8 -5 Q0 5 9 -4" fill="none" stroke="${C.ink}" stroke-width="3.4" stroke-linecap="round"/>
    ${opts.bottle ? bottle(0, 55, 0.58, 0.72, -5) : ""}
    ${opts.phone ? phone(72, 31, 0.28) : ""}
  </g>`;
}

function boyfriend(x = 0, y = 0, scale = 1, opts = {}) {
  const flip = opts.flip ? -1 : 1;
  return `<g transform="translate(${x} ${y}) scale(${scale * flip} ${scale})">
    <ellipse cx="0" cy="130" rx="72" ry="17" fill="${C.ink}" opacity="0.12"/>
    <path d="M-35 54 L-48 125" stroke="#61788B" stroke-width="22" stroke-linecap="round"/>
    <path d="M32 54 L49 126" stroke="#61788B" stroke-width="22" stroke-linecap="round"/>
    <path d="M-50 125 L-27 125 M27 126 L53 126" stroke="${C.ink}" stroke-width="12" stroke-linecap="round"/>
    <path d="M-55 18 Q0 -8 55 19 L51 86 Q0 104 -52 84 Z" fill="#EEF3F4" stroke="${C.ink}" stroke-width="4"/>
    <path d="M-32 -4 Q0 13 32 -4 L25 18 Q0 31 -25 18 Z" fill="#D9E5E8"/>
    <path d="M-49 30 L-79 69 M48 30 L78 69" stroke="#EEF3F4" stroke-width="21" stroke-linecap="round"/>
    <circle cx="-80" cy="70" r="11" fill="${C.skin}"/><circle cx="79" cy="70" r="11" fill="${C.skin}"/>
    <circle cx="0" cy="-42" r="53" fill="${C.skin}" stroke="${C.ink}" stroke-width="4"/>
    <path d="M-51 -43 Q-56 -98 -5 -101 Q55 -99 55 -41 Q33 -62 2 -57 Q-28 -69 -51 -43 Z" fill="#48515B"/>
    <path d="M-39 -62 Q-19 -86 2 -61 Q21 -83 45 -55 Q28 -48 9 -52 Q-10 -42 -34 -52 Z" fill="#66737C" opacity="0.72"/>
    <path d="M-27 -33 Q-20 -39 -13 -33 M13 -33 Q20 -39 27 -33" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
    <path d="M-8 -8 Q0 2 9 -7" fill="none" stroke="${C.ink}" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="-36" cy="-12" r="7" fill="#F2AFA4" opacity="0.42"/><circle cx="36" cy="-12" r="7" fill="#F2AFA4" opacity="0.42"/>
    ${opts.phone ? phone(0, 35, 0.34, "#2D435C", opts.screen || "") : ""}
    ${opts.ramen ? `<g transform="translate(0 53)"><path d="M-40 -23 L40 -23 L30 35 L-32 35 Z" fill="#FFF2DC" stroke="${C.ink}" stroke-width="4"/><path d="M-35 -20 Q0 -33 36 -20" fill="none" stroke="#E0A46D" stroke-width="8"/><path d="M-25 -43 Q-15 -75 2 -51 T32 -68" fill="none" stroke="#E8E8E8" stroke-width="7" stroke-linecap="round"/></g>` : ""}
  </g>`;
}

function beast(x = 0, y = 0, scale = 1, opts = {}) {
  const flip = opts.flip ? -1 : 1;
  const awake = opts.awake !== false;
  return `<g transform="translate(${x} ${y}) scale(${scale * flip} ${scale})">
    <ellipse cx="0" cy="111" rx="111" ry="24" fill="${C.ink}" opacity="0.18"/>
    <path d="M73 31 C142 4 165 -50 138 -79 C124 -95 99 -89 91 -67 C83 -45 105 -30 119 -43" fill="none" stroke="${C.black}" stroke-width="22" stroke-linecap="round"/>
    <path d="M-60 53 Q-85 115 -54 149 M55 53 Q82 116 51 149" fill="none" stroke="${C.black}" stroke-width="25" stroke-linecap="round"/>
    <ellipse cx="0" cy="36" rx="88" ry="79" fill="${C.black}"/>
    <ellipse cx="0" cy="-33" rx="73" ry="65" fill="${C.black}"/>
    <path d="M-59 -70 L-57 -121 L-17 -83 Z M58 -70 L57 -121 L17 -83 Z" fill="${C.black}"/>
    <path d="M-51 -77 L-50 -105 L-27 -83 Z M50 -77 L49 -105 L27 -83 Z" fill="#D994A3"/>
    <ellipse cx="-29" cy="-40" rx="25" ry="32" fill="#FFE598"/><ellipse cx="29" cy="-40" rx="25" ry="32" fill="#FFE598"/>
    ${awake ? `<ellipse cx="-29" cy="-42" rx="11" ry="20" fill="${C.ink}"/><ellipse cx="29" cy="-42" rx="11" ry="20" fill="${C.ink}"/><circle cx="-24" cy="-53" r="5" fill="#FFF" opacity="0.75"/><circle cx="34" cy="-53" r="5" fill="#FFF" opacity="0.75"/>` : `<path d="M-48 -43 Q-29 -32 -10 -43 M10 -43 Q29 -32 48 -43" fill="none" stroke="#8A6B47" stroke-width="6" stroke-linecap="round"/>`}
    <path d="M-12 -8 L0 4 L12 -8" fill="#D994A3"/>
    <path d="M0 4 Q-14 24 -28 7 M0 4 Q14 24 28 7" fill="none" stroke="#C07D87" stroke-width="4" stroke-linecap="round"/>
    <path d="M-87 -20 L-142 -30 M-135 -30 L-153 -17 M-135 -30 L-151 -45" stroke="${C.muted}" stroke-width="3" stroke-linecap="round"/>
    <path d="M87 -20 L142 -30 M135 -30 L153 -17 M135 -30 L151 -45" stroke="${C.muted}" stroke-width="3" stroke-linecap="round"/>
    ${opts.tongue ? `<path d="M0 15 Q0 53 17 57 Q30 47 20 23 Z" fill="#F7A1AD"/>` : ""}
    ${opts.collar ? `<path d="M-42 28 Q0 53 42 28 L39 49 Q0 68 -39 49 Z" fill="#77B69A"/>` : ""}
  </g>`;
}

function sceneCover() {
  return `<g>
    <circle cx="1030" cy="120" r="160" fill="#BFE8F0" opacity="0.3"/><circle cx="84" cy="600" r="130" fill="#FFD3CC" opacity="0.34"/>
    ${changchang(250, 350, 1.12, { bottle: true, phone: true })}
    <g transform="translate(792 332) rotate(4)">
      <rect x="-182" y="-236" width="364" height="472" rx="52" fill="${C.ink}"/><rect x="-166" y="-218" width="332" height="436" rx="38" fill="#354B6D"/>
      <circle cx="0" cy="-226" r="8" fill="#2B2730"/><circle cx="0" cy="0" r="92" fill="#FFF8F1" opacity="0.93"/>
      ${boyfriend(0, 34, 0.65)}
      <path d="M-118 -124 Q-75 -152 -34 -125 L-34 -104 Q-77 -129 -118 -105 Z" fill="#FFD3D8"/>${screenLine(-98, -117, 48, "#D66E82", 0.75, 10)}
      <path d="M40 -75 Q78 -103 119 -77 L119 -56 Q79 -81 40 -58 Z" fill="#BFE8F0"/>${screenLine(58, -69, 43, "#4E9DBA", 0.72, 10)}
    </g>
    ${heart(596, 178, 1.2)}${heart(1050, 100, 0.62)}${sparkle(1050, 258, 0.9)}${drop(647, 596, 0.72, 0.82)}${drop(1092, 460, 0.5, 0.6)}
  </g>`;
}

function scenePhone() {
  return `<g>
    <rect x="40" y="50" width="1120" height="620" rx="34" fill="#4A5678" opacity="0.35"/><circle cx="1020" cy="134" r="77" fill="#FFF1CC" opacity="0.75"/>
    <path d="M0 542 L235 441 L430 533 L624 426 L843 524 L1036 425 L1200 490 L1200 720 L0 720 Z" fill="#2E3D5A" opacity="0.58"/>
    <rect x="795" y="259" width="227" height="243" rx="14" fill="#303E5A" stroke="${C.ink}" stroke-width="8"/>
    <rect x="833" y="300" width="58" height="58" rx="9" fill="#FFE7A4"/><rect x="923" y="300" width="58" height="58" rx="9" fill="#FFE7A4"/><rect x="833" y="382" width="58" height="58" rx="9" fill="#FFE7A4"/><rect x="923" y="382" width="58" height="58" rx="9" fill="#FFE7A4"/>
    ${changchang(255, 370, 1.25, { phone: true })}
    <g transform="translate(780 152) rotate(5)"><rect x="-127" y="-86" width="254" height="172" rx="30" fill="#FFF9F0" stroke="${C.ink}" stroke-width="4"/>${screenLine(-91, -46, 135, C.blue, 0.75, 13)}${screenLine(-91, -16, 184, "#D4E8EA", 1, 11)}${screenLine(-91, 14, 152, "#D4E8EA", 1, 11)}<path d="M-111 72 L-83 34 L-55 72 Z" fill="#FFF9F0" stroke="${C.ink}" stroke-width="4"/></g>
    ${heart(993, 535, 1.15)}${sparkle(126, 555, 0.8)}
  </g>`;
}

function sceneTask() {
  return `<g>
    ${changchang(245, 368, 1.17, { armRaised: true })}
    <g transform="translate(777 338) rotate(-3)">
      <rect x="-196" y="-270" width="392" height="540" rx="56" fill="${C.ink}"/><rect x="-178" y="-250" width="356" height="500" rx="40" fill="#EFFBFD"/>
      <circle cx="0" cy="-184" r="72" fill="#C9EFF5"/>${drop(0, -184, 1.56, 0.9, C.blueDeep)}
      ${screenLine(-119, -64, 238, C.blueDeep, 0.78, 13)}${screenLine(-119, -30, 197, "#84C1D3", 0.7, 11)}${screenLine(-119, 2, 220, "#84C1D3", 0.72, 11)}
      <rect x="-119" y="63" width="238" height="68" rx="24" fill="#FFF0F2"/><path d="M-32 86 H39 M3 71 V124" stroke="${C.coralDark}" stroke-width="9" stroke-linecap="round"/>
      <rect x="-112" y="169" width="224" height="13" rx="6" fill="${C.coral}" opacity="0.72"/><rect x="-112" y="195" width="178" height="11" rx="5" fill="${C.blue}" opacity="0.58"/>
    </g>
    ${drop(568, 172, 0.8, 0.72)}${drop(1050, 125, 0.55, 0.6, C.coral)}${sparkle(1010, 523, 0.82)}
  </g>`;
}

function sceneDay1() {
  return `<g>
    ${changchang(250, 340, 1.12, { bottle: true })}
    <rect x="488" y="101" width="632" height="492" rx="36" fill="#FFFFFF" opacity="0.77" stroke="${C.ink}" stroke-width="4"/><path d="M540 262 H1062" stroke="#E9DCD6" stroke-width="5" stroke-linecap="round" stroke-dasharray="12 16"/>
    ${[46,46,58,46,38].map((size, i) => {
      const x = 565 + i * 112, color = i < 4 ? C.blue : C.coral;
      return `<g transform="translate(${x} 0)"><rect x="-31" y="265" width="62" height="${size}" rx="10" fill="${i === 2 ? C.blueDeep : color}" opacity="0.84"/><path d="M-40 265 Q0 244 40 265" fill="none" stroke="${C.ink}" stroke-width="4"/><circle cx="0" cy="215" r="8" fill="${i < 4 ? C.mint : C.coral}"/><path d="M0 223 L0 242" stroke="${C.ink}" stroke-width="3" opacity="0.45"/></g>`;
    }).join("")}
    <g transform="translate(803 489)"><rect x="-196" y="-48" width="392" height="96" rx="34" fill="#FFF4E4"/><circle cx="-145" cy="0" r="27" fill="${C.coral}"/><path d="M-153 0 L-137 13 L-126 -14" fill="none" stroke="#FFF" stroke-width="7" stroke-linecap="round"/><text x="-78" y="10" fill="${C.ink}" font-size="28" font-family="Microsoft YaHei, sans-serif" font-weight="700">今日 1000 ml 完成</text></g>
    ${sparkle(1040, 160, 0.8)}${heart(1050, 530, 0.95)}
  </g>`;
}

function scenePact() {
  return `<g>
    <rect x="367" y="82" width="466" height="552" rx="38" fill="#FFFDF9" stroke="${C.ink}" stroke-width="5"/>
    <path d="M430 214 Q600 138 770 214" fill="none" stroke="${C.coral}" stroke-width="7" opacity="0.5"/><path d="M430 222 Q600 151 770 222" fill="none" stroke="${C.blue}" stroke-width="7" opacity="0.55"/>
    ${changchang(245, 388, 0.93, { bottle: true })}${boyfriend(954, 390, 0.93)}
    <path d="M341 368 C472 468 730 471 858 370" fill="none" stroke="${C.coral}" stroke-width="7" stroke-linecap="round" stroke-dasharray="4 18"/><path d="M341 381 C472 482 730 485 858 383" fill="none" stroke="${C.blue}" stroke-width="7" stroke-linecap="round" stroke-dasharray="4 18"/>
    ${drop(602, 365, 1.35, 0.92)}${heart(602, 235, 1.25)}${sparkle(515, 209, 0.8)}${sparkle(694, 208, 0.8)}
    <g transform="translate(600 523)"><rect x="-168" y="-42" width="336" height="84" rx="28" fill="#F2FBFD" stroke="${C.blueDeep}" stroke-width="4"/>${screenLine(-119, -13, 238, C.blueDeep, 0.78, 12)}${screenLine(-119, 19, 181, "#84C1D3", 0.7, 10)}</g>
  </g>`;
}

function sceneBeast() {
  return `<g>
    <rect x="35" y="45" width="1130" height="630" rx="32" fill="#E8C89F"/><circle cx="1015" cy="155" r="76" fill="#EFCFA4" opacity="0.78"/>
    <path d="M0 458 Q178 361 355 471 T715 452 T1200 432 L1200 720 L0 720 Z" fill="#E1BE91" opacity="0.7"/>
    <path d="M630 118 L840 285 L707 285 L707 538 L552 538 L552 285 L420 285 Z" fill="#4A4151" opacity="0.8"/><path d="M455 286 L601 154 L599 312 Z M809 286 L654 158 L665 313 Z" fill="#4A4151"/><rect x="590" y="373" width="82" height="165" rx="12" fill="#312A38"/>
    ${beast(890, 385, 1.02)}${boyfriend(635, 437, 0.74)}${changchang(245, 402, 1.03, { bottle: true })}
    ${drop(386, 342, 0.75, 0.74)}${sparkle(1070, 522, 0.74)}
  </g>`;
}

function sceneDay4() {
  return `<g>
    <rect x="42" y="54" width="535" height="610" rx="30" fill="#F3FAFB"/><rect x="623" y="54" width="535" height="610" rx="30" fill="#FFF2E9"/>
    ${changchang(270, 421, 1.02, { phone: true })}${boyfriend(890, 432, 0.98, { ramen: true })}${beast(1082, 360, 0.53, { flip: true, collar: true })}
    <g transform="translate(698 218) rotate(-4)"><rect x="-92" y="-70" width="184" height="140" rx="27" fill="#FFFDF9" stroke="${C.ink}" stroke-width="4"/>${screenLine(-60, -38, 110, C.coral, 0.62, 12)}${screenLine(-60, -8, 136, "#BFD8DE", 0.75, 10)}${screenLine(-60, 18, 90, "#BFD8DE", 0.75, 10)}<path d="M-18 70 L4 41 L27 70 Z" fill="#FFFDF9" stroke="${C.ink}" stroke-width="4"/></g>
    <path d="M601 54 V664" stroke="${C.ink}" stroke-width="5" stroke-dasharray="13 16" opacity="0.4"/>${heart(1018, 192, 0.8)}${sparkle(536, 146, 0.65)}
  </g>`;
}

function sceneDay5() {
  return `<g>
    <rect x="46" y="70" width="704" height="560" rx="34" fill="#FFF6F3"/><path d="M99 154 H691" stroke="#EACAC6" stroke-width="4" opacity="0.55"/>
    ${changchang(283, 405, 1.05, { bottle: true, armRaised: true })}
    <g transform="translate(590 423)"><circle cx="0" cy="0" r="87" fill="${C.skin}" stroke="${C.ink}" stroke-width="4"/><path d="M-72 -35 Q0 -111 72 -35 Q48 -63 0 -57 Q-49 -64 -72 -35 Z" fill="#59443E"/><path d="M-36 -7 Q-29 -14 -21 -7 M21 -7 Q29 -14 36 -7" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/><path d="M-10 23 Q0 33 11 22" fill="none" stroke="${C.ink}" stroke-width="3.3" stroke-linecap="round"/><circle cx="-50" cy="15" r="9" fill="#F4A4AE" opacity="0.5"/><circle cx="50" cy="15" r="9" fill="#F4A4AE" opacity="0.5"/></g>
    <g transform="translate(935 360)"><path d="M-245 42 Q0 -82 245 42 L218 290 Q0 352 -218 290 Z" fill="#DBECEA" stroke="${C.ink}" stroke-width="5"/>${beast(0, 145, 0.79, { collar: true })}<path d="M-150 139 L-75 68 L-70 161 Z M149 139 L74 68 L69 161 Z" fill="#4A4151"/></g>
    ${heart(900, 182, 1)}${sparkle(1111, 520, 0.75)}
  </g>`;
}

function sceneDay6() {
  return `<g>
    <rect x="42" y="54" width="535" height="610" rx="30" fill="#F1FAFC"/><rect x="623" y="54" width="535" height="610" rx="30" fill="#3F3A4C"/>
    ${changchang(286, 419, 1.05, { phone: true })}${boyfriend(872, 445, 0.91)}${beast(1066, 396, 0.62, { flip: true })}
    <rect x="698" y="176" width="210" height="144" rx="16" fill="#C9EFF5" stroke="${C.ink}" stroke-width="8"/><path d="M729 286 L770 237 L801 270 L838 221 L873 265" fill="none" stroke="#506F82" stroke-width="8" stroke-linecap="round"/><circle cx="746" cy="211" r="15" fill="#FFE39A"/>
    <path d="M637 54 V664" stroke="${C.ink}" stroke-width="5" stroke-dasharray="13 16" opacity="0.5"/>
    <g transform="translate(703 508)"><rect x="-82" y="-40" width="164" height="80" rx="22" fill="#FFF7E8"/><circle cx="-38" cy="0" r="19" fill="#FFD3D8"/><path d="M12 -17 L35 0 L12 17 Z" fill="#FFD3D8"/><path d="M-52 -6 L-25 -6 M-52 8 L-31 8" stroke="#6E5C5A" stroke-width="4" stroke-linecap="round"/></g>
    ${heart(552, 126, 0.75)}${sparkle(1110, 144, 0.7)}
  </g>`;
}

function sceneDay7() {
  return `<g>
    <rect x="48" y="66" width="1104" height="552" rx="34" fill="#FFF8ED"/>
    <rect x="92" y="111" width="681" height="306" rx="17" fill="#CBE5E8" stroke="${C.ink}" stroke-width="5"/><path d="M122 372 L271 229 L375 323 L503 181 L741 375" fill="none" stroke="#7FAFB9" stroke-width="7" opacity="0.68"/>
    <rect x="754" y="141" width="336" height="165" rx="24" fill="#594855" opacity="0.92"/><circle cx="929" cy="223" r="52" fill="#F5C4B3"/><path d="M874 208 Q929 144 984 208 Q962 174 930 181 Q896 175 874 208 Z" fill="#493A3D"/><path d="M910 219 Q916 225 923 219 M947 219 Q954 225 960 219" fill="none" stroke="${C.ink}" stroke-width="4"/>
    ${changchang(557, 506, 0.87)}${bottle(733, 502, 0.72, 0.82, 7)}
    <rect x="836" y="491" width="291" height="111" rx="25" fill="#D7E8EA" stroke="${C.ink}" stroke-width="4"/>${beast(964, 535, 0.41, { collar: true })}
    ${drop(1040, 116, 0.54, 0.7)}${sparkle(1091, 446, 0.75)}
  </g>`;
}

function sceneDay8() {
  return `<g>
    <rect width="1200" height="720" fill="#443B4B"/><rect x="58" y="61" width="1084" height="598" rx="35" fill="#665B6C"/><path d="M0 492 H1200 V720 H0 Z" fill="#302A38"/>
    <path d="M156 87 L371 380 H106 L156 87 Z M1050 88 L844 380 H1103 L1050 88 Z" fill="#342E3C"/>
    <rect x="465" y="109" width="270" height="338" rx="23" fill="#9DC8D1" opacity="0.72"/><path d="M496 407 L600 197 L697 407" fill="none" stroke="#FFF2CC" stroke-width="7" opacity="0.65"/><circle cx="611" cy="186" r="45" fill="#FFE198" opacity="0.78"/>
    ${changchang(464, 497, 0.98, { bottle: true, armRaised: true })}${boyfriend(741, 505, 0.94)}${beast(1010, 528, 0.62, { flip: true, collar: true })}
    ${heart(610, 222, 1.1)}${drop(476, 283, 0.64, 0.8)}
  </g>`;
}

function sceneDoor() {
  return `<g>
    <rect width="1200" height="720" rx="34" fill="#354B6D"/><path d="M0 525 H1200 V720 H0 Z" fill="#292C45" opacity="0.78"/>
    <rect x="769" y="94" width="272" height="500" rx="20" fill="#4DBCD6" opacity="0.32"/><rect x="795" y="111" width="220" height="482" rx="14" fill="#6ED2E8" stroke="#D6F8FF" stroke-width="9"/><path d="M910 111 V593 M795 352 H1015" stroke="#D6F8FF" stroke-width="5" opacity="0.62"/><circle cx="976" cy="351" r="9" fill="#FFF4CA"/>
    ${changchang(451, 447, 1.13, { phone: true })}${drop(698, 323, 1.05, 0.88)}${drop(1086, 225, 0.66, 0.6)}${sparkle(724, 525, 0.88)}
    <g transform="translate(1015 207)"><path d="M-48 -23 Q0 -62 48 -23 L41 40 Q0 64 -41 40 Z" fill="#FFF8F1" opacity="0.9"/><path d="M-38 53 L-4 24 L20 55 Z" fill="#FFF8F1" opacity="0.9"/></g>
  </g>`;
}

function sceneFinale() {
  return `<g>
    <rect x="42" y="54" width="535" height="610" rx="30" fill="#927D8D"/><rect x="623" y="54" width="535" height="610" rx="30" fill="#BFE9F0"/>
    ${Array.from({ length: 42 }, (_, i) => `<path d="M${66 + (i * 83) % 490} ${86 + (i * 47) % 520} l-4 18" stroke="#DDFAFF" stroke-width="4" stroke-linecap="round" opacity="0.72"/>`).join("")}
    <path d="M42 464 Q180 413 316 474 T577 445 V664 H42 Z" fill="#86B99A" opacity="0.78"/>${beast(280, 416, 0.68, { tongue: true, collar: true, awake: false })}${bottle(405, 489, 0.52, 0.2, -24)}
    <path d="M623 507 Q747 468 859 513 T1158 486 V664 H623 Z" fill="#93CFC3" opacity="0.68"/><path d="M670 504 Q773 456 881 507 T1127 461 V664 H670 Z" fill="#E9C49A"/>
    <rect x="715" y="331" width="84" height="173" rx="8" fill="#A6CCD1"/><rect x="827" y="286" width="104" height="218" rx="8" fill="#D6AF8F"/><rect x="957" y="358" width="92" height="146" rx="8" fill="#A6CCD1"/>
    <rect x="744" y="364" width="23" height="32" rx="5" fill="#FFE8A0"/><rect x="782" y="364" width="23" height="32" rx="5" fill="#FFE8A0"/><rect x="853" y="321" width="24" height="34" rx="5" fill="#FFE8A0"/><rect x="894" y="321" width="24" height="34" rx="5" fill="#FFE8A0"/>
    ${changchang(791, 508, 0.84)}${boyfriend(898, 504, 0.84)}<path d="M823 432 Q853 395 889 430" fill="none" stroke="#E58A9B" stroke-width="14" stroke-linecap="round"/>${heart(857, 359, 0.95)}${heart(973, 188, 0.68)}${sparkle(1105, 200, 0.78)}
  </g>`;
}

const scenes = new Map([
  ["scene-cover.svg", sceneCover()], ["scene-01-phone.svg", scenePhone()], ["scene-02-task.svg", sceneTask()],
  ["scene-03-day1.svg", sceneDay1()], ["scene-04-pact.svg", scenePact()], ["scene-05-beast.svg", sceneBeast()],
  ["scene-06-day4.svg", sceneDay4()], ["scene-07-day5.svg", sceneDay5()], ["scene-08-day6.svg", sceneDay6()],
  ["scene-09-day7.svg", sceneDay7()], ["scene-10-day8.svg", sceneDay8()], ["scene-11-door.svg", sceneDoor()],
  ["scene-12-finale.svg", sceneFinale()]
]);

for (const [name, body] of scenes) {
  fs.writeFileSync(path.join(outDir, name), frame(body, path.basename(name, ".svg")), "utf8");
}

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFF3E9"/><stop offset="1" stop-color="#DDF5F8"/></linearGradient><linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#9FE1EE"/><stop offset="1" stop-color="#51A9C5"/></linearGradient></defs>
  <rect width="512" height="512" rx="124" fill="url(#bg)"/><circle cx="105" cy="111" r="25" fill="#FFF" opacity=".68"/><circle cx="420" cy="120" r="38" fill="#FFF" opacity=".55"/>
  <path d="M256 72 C304 145 358 202 358 283 C358 361 313 413 256 413 C199 413 154 361 154 283 C154 202 208 145 256 72 Z" fill="#FFF" stroke="#4C3F4A" stroke-width="16"/>
  <path d="M175 290 C215 276 298 276 338 290 L338 399 C338 410 329 413 319 413 H193 C183 413 175 410 175 399 Z" fill="url(#water)"/>
  <path d="M256 330 C221 307 211 286 226 269 C239 253 260 266 256 282 C252 266 273 253 286 269 C301 286 291 307 256 330 Z" fill="#EF91A2"/>
  <circle cx="228" cy="224" r="9" fill="#4C3F4A"/><circle cx="284" cy="224" r="9" fill="#4C3F4A"/><path d="M235 247 Q256 264 278 246" fill="none" stroke="#4C3F4A" stroke-width="9" stroke-linecap="round"/>
</svg>`;
fs.writeFileSync(path.join(outDir, "icon.svg"), icon, "utf8");
console.log(`Generated ${scenes.size + 1} SVG assets in ${outDir}`);
