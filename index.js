import { Image, createCanvas, loadImage, registerFont } from 'canvas';
import express from 'express';
import Jimp from 'jimp';
import fs from 'fs';
import multer, { memoryStorage } from 'multer';

const app = express();
const upload = multer({ dest: 'upload/', storage: memoryStorage() });
registerFont('./storage/roboto/roboto-viet-hoa_095802/Roboto-Bold.ttf', {
  family: 'RobotoBold',
  weight: 700,
});

app.post('/upload', upload.single('avatar'), async (req, res) => {
  // const avatar = await loadImage(req.file.buffer)
  let avatar = await Jimp.read(req.file.buffer);
  avatar.cover(476, 475);
  avatar.circle(10000);
  const background = await loadImage('./storage/background.jpg');
  const canvas = createCanvas(background.width, background.height);
  const ctx = canvas.getContext('2d');
  const backgroundImage = new Image();
  const maxWidthText = 1100;
  const maxHeightText = 1000;
  const fonts = {
    md: '40px "RobotoBold"',
    lg: '50px "RobotoBold"',
  };
  const font = req.body.text.length <= 300 ? fonts.lg : fonts.md;
  backgroundImage.src = await avatar.getBufferAsync(Jimp.MIME_PNG);

  ctx.drawImage(background, 0, 0);
  ctx.drawImage(backgroundImage, 1353, 376);
  ctx.fillStyle = '#121f75';

  ctx.font = font;
  drawText(ctx, req.body.text || 'Xin chào', 130, 400, maxWidthText, maxHeightText);
  const dataUrl = canvas.toBuffer('image/jpeg');
  const out = fs.createWriteStream('./storage/test.jpeg');
  const stream = canvas.createJPEGStream();
  stream.pipe(out);
  out.on('finish', () => console.log('The JPEG file was created.'));

  res.json({
    message: 'Successfully',
    data: dataUrl,
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
