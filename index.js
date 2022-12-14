const imageUpload = document.getElementById('imageUpload');
const divDataOutputDisplay = document.getElementById('divDataOutputDisplay');
const divPopupDisplay = document.getElementById('divPopup');
const MODELS_PATH = './JS/models';
const APIAccessCode =
  'AKfycbwip48-94Ot2WwXuxGlBYgB6HoDWc4_VcSuYztNCD2SSu3qav5xDkXFoRARfnRGrqY1';
const FolderAccessCode = '1oEho4aHL_OPxPAUYBAKGRVHtwY7Lju37';
var labeledImagesPaths = [];

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_PATH),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_PATH),
  faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS_PATH),
]).then(AccessDriveImages(FolderAccessCode));

function AccessDriveImages(accessID) {
  var urlPart1 = 'https://script.google.com/macros/s/';
  var id = APIAccessCode;
  var extension = '/exec';
  var serviceURL = urlPart1 + id + extension;
  var xobj = new XMLHttpRequest();
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == 200) {
      var responseData = xobj.response;
      if (responseData != '') {
        var options = JSON.parse(responseData);
        var folderItemsList = options.folder_items;
        var optionsHTML = '';
        for (i = 0; i < folderItemsList.length; i++) {
          const alteredGoogleURL =
            'https://drive.google.com/uc?id=' + folderItemsList[i].id;
          labeledImagesPaths.push(folderItemsList[i]);
        }
        start();
      } else {
        window.alert('Folder is empty');
      }
    } else {
    }
  };
  if (accessID == '') {
    xobj.open('GET', serviceURL, true);
    xobj.send();
  } else {
    var headerObj = 'Contenttype=application/json&userRequest=FileAccess';
    var obj = {
      method_name: 'allFilesInChildFolders',
      service_request_data: { folder_id: accessID },
    };
    var dbParam = JSON.stringify(obj);
    xobj.open('POST', serviceURL + '?' + headerObj, true);
    xobj.send(dbParam);
  }
}

async function start() {
  const container = document.getElementById('divDataOutputDisplay');
  const labeledFaceDescriptors = await loadLabeledImages(labeledImagesPaths);
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  let image;
  let canvas;
  const logger = document.getElementById('divDataReferencesDisplay');
  logger.append('Loaded');
  divPopupDisplay.style.visibility = 'hidden';
  imageUpload.addEventListener('change', async () => {
    if (image) image.remove();
    if (canvas) canvas.remove();
    image = await faceapi.bufferToImage(imageUpload.files[0]);
    container.append(image);
    canvas = faceapi.createCanvasFromMedia(image);
    container.append(canvas);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map((d) =>
      faceMatcher.findBestMatch(d.descriptor)
    );
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result.toString(),
      });
      drawBox.draw(canvas);
    });
  });
}

function loadLabeledImages(paths) {
  const labels = paths;
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      label.filesList.map(async (fileItem) => {
        const imgSource = 'data:image/jpeg;base64,' + fileItem.base64;
        const img = new Image();
        img.src = imgSource;
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      });
      return new faceapi.LabeledFaceDescriptors(label.folderName, descriptions);
    })
  );
}
