import { Image as t, createCanvas as e, loadImage as o, registerFont as l } from 'canvas';
import r from 'compression';
import a from 'cors';
import i from 'dotenv';
import n from 'express';
import { getDownloadURL as f, ref as p, uploadBytes as m } from 'firebase/storage';
import s from 'imagemin';
import g from 'imagemin-mozjpeg';
import $ from 'jimp';
import d, { memoryStorage as c } from 'multer';
import { storage as u } from '../firebase.js';
i.config();
let app = n(),
  upload = d({ dest: 'upload/', storage: c() });
function drawText(t, e, o, l, r, a) {
  let i = e.split(' '),
    n = '',
    f = 1.6 * t.measureText('M').width,
    p = [];
  for (let m = 0; m < i.length; m++) {
    let s = '' === i[m].trim() ? '' : i[m].trim() + ' ',
      g = n + s;
    t.measureText(g).width > r ? (p.push(n), (n = i[m] + ' ')) : (n = g);
  }
  p.push(n);
  for (let $ = 0; $ < p.length; $++) {
    let d = l + $ * f;
    if (d > a) break;
    t.fillText(p[$], o, d);
  }
}
l('./storage/roboto/roboto-viet-hoa_095802/Roboto-Bold.ttf', { family: 'RobotoBold', weight: 700 }),
  app.use(a({ origin: '*' })),
  app.use(r()),
  app.post('/api/upload', upload.single('avatar'), async (l, r) => {
    let a = await o('./storage/background.png'),
      i = e(a.width, a.height),
      n = i.getContext('2d'),
      d = new t(),
      c = { sm: '30px "RobotoBold"', md: '40px "RobotoBold"', lg: '50px "RobotoBold"' },
      b = l.body.text || 'Th\xf4ng điệp của bạn...',
      h = l.body.full_name || 'T\xean của bạn...',
      x = l.body.role || 'Vai tr\xf2 của bạn...',
      _ = b.length <= 300 ? c.lg : c.md,
      w = h.length <= 14 ? c.lg : h.length <= 18 ? c.md : c.sm,
      y = h.length <= 14 ? c.lg : h.length <= 18 ? c.md : c.sm,
      T = null;
    try {
      (T = await $.read(l.file.buffer)).cover(463, 463), T.circle(1e4), T.crop(0, 0, 463, 427);
    } catch (B) {
      console.log(B);
    }
    n.drawImage(a, 0, 0),
      T && ((d.src = await T.getBufferAsync($.MIME_PNG)), n.drawImage(d, 165, 407)),
      (n.fillStyle = '#121f75'),
      (n.font = _),
      drawText(n, b, 840, 480, 980, 920),
      (n.fillStyle = 'transparent'),
      n.fillRect(177, 910, 442, 71),
      (n.font = w),
      (n.fillStyle = '#ffffff'),
      (n.textAlign = 'center'),
      (n.textBaseline = 'center'),
      n.fillText(h, 398, 910),
      (n.fillStyle = 'transparent'),
      n.fillRect(139, 980, 527, 56),
      (n.font = y),
      (n.fillStyle = '#121f75'),
      (n.textAlign = 'center'),
      (n.textBaseline = 'center'),
      n.fillText(x, 402.5, 980);
    let v = p(u, 'images/' + l.file.originalname + '.jpg'),
      R = await s.buffer(i.toBuffer(), {
        plugins: [g({ quality: 60, progressive: !0, fastCrush: !0 })],
      });
    await m(v, R, { contentType: 'image/jpeg' });
    let S = await f(v);
    r.json({ message: 'Successfully', url: S });
  }),
  app.listen(9090, () => console.log('Server running on port 9090'));
export default app;
