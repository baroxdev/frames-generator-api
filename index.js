import { Image, createCanvas, loadImage, registerFont } from 'canvas';
import express from 'express';
import Jimp from 'jimp';
import multer, { memoryStorage } from 'multer';
import compression from 'compression';
import { storage, storageRef } from './firebase.js';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import imagemin from 'imagemin';
import imageminOptipng from 'imagemin-optipng';
import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';
const app = express();
const upload = multer({ dest: 'upload/', storage: memoryStorage() });
registerFont('./storage/roboto/roboto-viet-hoa_095802/Roboto-Bold.ttf', {
  family: 'RobotoBold',
  weight: 700,
});

app.use(compression());

app.post('/upload', upload.single('avatar'), async (req, res) => {
  // Configure
  const avatarX = 165;
  const avatarY = 407;
  const avatarSize = 463;
  const maxWidthText = 980;
  const maxHeightText = 920;
  const textX = 840;
  const textY = 480;
  const maxWidthFullName = 442;
  const maxHeightFullName = 71;
  const fullNameX = 177;
  const fullNameY = 910;
  const maxWidthRole = 527;
  const maxHeightRole = 56;
  const roleX = 139;
  const roleY = 980;
  const background = await loadImage('./storage/background.png');
  const canvas = createCanvas(background.width, background.height);
  const ctx = canvas.getContext('2d');
  const avatarImage = new Image();
  const fonts = {
    sm: '30px "RobotoBold"',
    md: '40px "RobotoBold"',
    lg: '50px "RobotoBold"',
  };

  // Form data
  const text = req.body.text || 'Thông điệp của bạn...';
  const fullName = req.body.full_name || 'Tên của bạn...';
  const role = req.body.role || 'Vai trò của bạn...';
  const font = text.length <= 300 ? fonts.lg : fonts.md;
  const fullNameFont =
    fullName.length <= 14 ? fonts.lg : fullName.length <= 18 ? fonts.md : fonts.sm;
  const roleFont = fullName.length <= 14 ? fonts.lg : fullName.length <= 18 ? fonts.md : fonts.sm;

  let avatar = null;
  try {
    avatar = await Jimp.read(req.file.buffer);
    avatar.cover(avatarSize, avatarSize);
    avatar.circle(10000);
    avatar.crop(0, 0, avatarSize, avatarSize - 36);
  } catch (error) {
    console.log(error);
  }

  ctx.drawImage(background, 0, 0);
  if (avatar) {
    avatarImage.src = await avatar.getBufferAsync(Jimp.MIME_PNG);
    ctx.drawImage(avatarImage, avatarX, avatarY);
  }

  ctx.fillStyle = '#121f75';
  ctx.font = font;
  drawText(ctx, text, textX, textY, maxWidthText, maxHeightText);

  ctx.fillStyle = 'transparent';
  ctx.fillRect(fullNameX, fullNameY, maxWidthFullName, maxHeightFullName);

  ctx.font = fullNameFont;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'center';
  ctx.fillText(fullName, fullNameX + maxWidthFullName / 2, fullNameY);

  ctx.fillStyle = 'transparent';
  ctx.fillRect(roleX, roleY, maxWidthRole, maxHeightRole);

  ctx.font = roleFont;
  ctx.fillStyle = '#121f75';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'center';
  ctx.fillText(role, roleX + maxWidthRole / 2, roleY);

  const imageRef = ref(storage, 'images/' + req.file.originalname + '.jpg');
  const compressedImage = await imagemin.buffer(canvas.toBuffer(), {
    plugins: [
      imageminMozjpeg({
        quality: 50,
        progressive: true, // Enable progressive rendering
        fastCrush: true, // Use fast DCT methods (less accurate but faster)
      }),
    ],
  });
  const snapshot = await uploadBytes(imageRef, compressedImage, {
    contentType: 'image/jpeg',
  });

  console.log({ snapshot });
  console.log('Uploaded a blob or file!');
  const url = await getDownloadURL(imageRef);
  // const dataUrl = canvas.toDataURL('image/jpeg');
  // const out = fs.createWriteStream('./storage/test.jpeg');
  // const stream = canvas.createJPEGStream();
  // stream.pipe(out);
  // out.on('finish', () => console.log('The JPEG file was created.'));

  res.json({
    message: 'Successfully',
    url: url,
  });
});

function drawText(ctx, text, x, y, maxWidth, maxHeight) {
  let words = text.split(' '); // split the text into words
  let line = ''; // current line of text
  let lineHeight = ctx.measureText('M').width * 1.6; // height of a line based on font size
  let lines = []; // array of lines

  for (let i = 0; i < words.length; i++) {
    // loop through each word
    const word = words[i].trim() === '' ? '' : words[i].trim() + ' ';
    let testLine = line + word; // add the word to the current line
    let testWidth = ctx.measureText(testLine).width; // measure the width of the line
    if (testWidth > maxWidth) {
      // if it exceeds the maximum width
      lines.push(line); // push the current line to the array
      line = words[i] + ' '; // start a new line with the current word
    } else {
      line = testLine; // otherwise keep adding words to the current line
    }
  }
  lines.push(line); // push the last line to the array

  for (let i = 0; i < lines.length; i++) {
    // loop through each line
    let dy = y + i * lineHeight; // calculate the y position of the line
    if (dy > maxHeight) break; // if it exceeds the maximum height, stop drawing
    ctx.fillText(lines[i], x, dy); // draw the line on the canvas
  }
}

app.listen(9090, () => console.log('Server running on port 9090'));
