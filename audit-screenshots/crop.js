const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const OUT = 'D:/PaperClip/audit-screenshots';

async function meta(f){ return sharp(path.join(OUT,f)).metadata(); }

async function main(){
  // Crop desktop-full into 3 horizontal slices to inspect promos/instagram/footer
  const dm = await meta('desktop-full.png');
  console.log('desktop-full', dm.width, 'x', dm.height);
  const sliceH = Math.min(1500, Math.floor(dm.height/3));
  for (let i=0;i<3;i++){
    const top = i*sliceH;
    await sharp(path.join(OUT,'desktop-full.png'))
      .extract({left:0, top, width: dm.width, height: Math.min(sliceH, dm.height-top)})
      .toFile(path.join(OUT, 'desktop-slice-'+(i+1)+'.png'));
  }
  // Mobile slices for upload
  const mm = await meta('mobile-full.png');
  console.log('mobile-full', mm.width, 'x', mm.height);
  const mSliceH = 1600;
  for (let i=0;i*mSliceH<mm.height;i++){
    const top = i*mSliceH;
    const h = Math.min(mSliceH, mm.height-top);
    if (h < 50) break;
    await sharp(path.join(OUT,'mobile-full.png'))
      .extract({left:0, top, width: mm.width, height: h})
      .toFile(path.join(OUT, 'mobile-slice-'+(i+1)+'.png'));
  }
  console.log('done');
}
main().catch(e=>{console.error(e);process.exit(1);});
