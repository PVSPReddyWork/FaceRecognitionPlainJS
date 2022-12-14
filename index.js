const imageUpload = document.getElementById('imageUpload'),
  divDataOutputDisplay = document.getElementById('divDataOutputDisplay'),
  divPopupDisplay = document.getElementById('divPopup'),
  MODELS_PATH = './JS/models',
  APIAccessCode =
    'AKfycbwip48-94Ot2WwXuxGlBYgB6HoDWc4_VcSuYztNCD2SSu3qav5xDkXFoRARfnRGrqY1',
  FolderAccessCode = '1oEho4aHL_OPxPAUYBAKGRVHtwY7Lju37';
var labeledImagesPaths = [];
function AccessDriveImages(e) {
  var a = 'https://script.google.com/macros/s/' + APIAccessCode + '/exec',
    t = new XMLHttpRequest();
  if (
    ((t.onreadystatechange = function () {
      if (4 == t.readyState && 200 == t.status) {
        var e = t.response;
        if ('' != e) {
          var a = JSON.parse(e).folder_items;
          for (i = 0; i < a.length; i++) {
            a[i].id;
            labeledImagesPaths.push(a[i]);
          }
          start();
        } else window.alert('Folder is empty');
      }
    }),
    '' == e)
  )
    t.open('GET', a, !0), t.send();
  else {
    var s = {
        method_name: 'allFilesInChildFolders',
        service_request_data: { folder_id: e },
      },
      c = JSON.stringify(s);
    t.open(
      'POST',
      a + '?Contenttype=application/json&userRequest=FileAccess',
      !0
    ),
      t.send(c);
  }
}
async function start() {
  const e = document.getElementById('divDataOutputDisplay'),
    a = await loadLabeledImages(labeledImagesPaths),
    t = new faceapi.FaceMatcher(a, 0.6);
  let s, i;
  document.getElementById('divDataReferencesDisplay').append('Loaded'),
    (divPopupDisplay.style.visibility = 'hidden'),
    imageUpload.addEventListener('change', async () => {
      s && s.remove(),
        i && i.remove(),
        (s = await faceapi.bufferToImage(imageUpload.files[0])),
        e.append(s),
        (i = faceapi.createCanvasFromMedia(s)),
        e.append(i);
      const a = { width: s.width, height: s.height };
      faceapi.matchDimensions(i, a);
      const c = await faceapi
          .detectAllFaces(s)
          .withFaceLandmarks()
          .withFaceDescriptors(),
        o = faceapi.resizeResults(c, a);
      o.map((e) => t.findBestMatch(e.descriptor)).forEach((e, a) => {
        const t = o[a].detection.box;
        new faceapi.draw.DrawBox(t, { label: e.toString() }).draw(i);
      });
    });
}
function loadLabeledImages(e) {
  const a = e;
  return Promise.all(
    a.map(async (e) => {
      const a = [];
      return (
        e.filesList.map(async (e) => {
          const t = 'data:image/jpeg;base64,' + e.base64,
            s = new Image();
          s.src = t;
          const i = await faceapi
            .detectSingleFace(s)
            .withFaceLandmarks()
            .withFaceDescriptor();
          a.push(i.descriptor);
        }),
        new faceapi.LabeledFaceDescriptors(e.folderName, a)
      );
    })
  );
}
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_PATH),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_PATH),
  faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS_PATH),
]).then(AccessDriveImages(FolderAccessCode));
