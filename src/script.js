const config = {
  cache: {
    size: 10 * 1024 * 1024
  },

  search: {
    terms: [
      'nature',
      'water',
      'river',
      'mountain'
    ],
    base: 'https://source.unsplash.com',
    res: [
      1920,
      1080
    ]
  }
}

function getRandomImage() {
  const terms = config.search.terms.join(',');
  let url = config.search.base + '/' + config.search.res[0] + 'x' + config.search.res[1] + '/?' + terms;
  return url;
}

function getTime() {
  let d = new Date;
  let hours = d.getHours();
  let minutes = d.getMinutes();
  return hours + ':' + (minutes < 10 ? '0'+minutes : minutes);
}

let cs;
function getPermission(cb) {
  cs = new ChromeStore();
  cs.init(config.cache.size, function(cstore){
    cs.getDir('tmp', {create: true}, function(){
      if (typeof cb != 'undefined') { cb(); }
    });
  });
}

function saveImage(cb) {
  let imgTitle = (new Date()).getTime();
  cs.getAndWrite(getRandomImage(), 'tmp/'+imgTitle+'.jpg', 'image/jpeg', {create: true}, function(){
    if (typeof cb != 'undefined') { cb('tmp/'+imgTitle+'.jpg'); }
  });
}

function findImage(cb) {
  cs.ls('tmp', (arr) => {
    if (arr.length == 0) { return; }
    cs.getFile('tmp/'+arr[0].name, {}, (file) => {
      console.log(arr)
      file.file(function(f) {
      var reader = new FileReader();

      reader.onloadend = function(e) {
        cb((this.result))
        cs.deleteFile('tmp/'+arr[0].name);
      };

      reader.readAsDataURL(f);
    }, undefined);
    });
  })
}

function setImage(img) {
  document.querySelector('.bg').style['background-image'] = 'url('+img+')';
}

function updateTime() {
  let t = getTime();
  document.querySelector('.time').innerHTML = t;
}

function main() {
  updateTime();

  getPermission(() => {
    findImage((img) => {
      setImage(img);
    });

    saveImage();
  });

  setInterval(() => {
    updateTime();
  }, 1000);
}

main();
