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
]).then(AccessDriveImages(FolderAccessCode)); //.then(start);

function AccessDriveImages(accessID) {
  //divPopupDisplay.style.visibility = 'hidden';
  var urlPart1 = 'https://script.google.com/macros/s/';
  var id = APIAccessCode; //'AKfycbzY7Ur9TbvrbQUlak3NSXvI_Oe8uIcq09Wxizm2HK67MFfNk4A090dPav_su-Q39Gr4'; //"AKfycbwPQZSMXpm2vtSsKYMRY12kENwd9n1rZyJAi_bSldBONoOUKvTEw90f4WIYFLEgU4b0";
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
          //console.log(folderItemsList[i]);
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
  //container.style.position = 'relative'
  //document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages(labeledImagesPaths);
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  let image;
  let canvas;
  //document.body.append('Loaded')
  const logger = document.getElementById('divDataReferencesDisplay');
  logger.append('Loaded');
  divPopupDisplay.style.visibility = 'hidden';
  imageUpload.addEventListener('change', async () => {
    if (image) image.remove();
    if (canvas) canvas.remove();
    image = await faceapi.bufferToImage(imageUpload.files[0]);
    /*
        image.style.height = "500px";
        image.style.width = "450px";
        image.height = "500px";
        image.width = "450px";
        */
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

function loadFoldersDataFromWindowsPC() {
  divPopupDisplay.style.visibility = 'hidden';
  const WINDOWS = 'Windows';
  const MAC = 'MacOS';
  const UNIX = 'UNIX';
  const LINUX = 'Linux';
  //let labeledImagesFolderPath = "";
  let localImagesFolderPath =
    'C:Userspulagam.sivaprasadrDownloadslabeled_images'; //"C:\Users\pulagam.sivaprasadr\Downloads\FaceRecognition\labeled_images";//document.getElementById('localImagesFolderPath');
  try {
    /*
        var OSName = "";
        if (navigator.appVersion.indexOf("Win") != -1) {
            OSName = WINDOWS;
        }
        else if (navigator.appVersion.indexOf("Mac") != -1) {
            OSName = MAC;
        }
        else if (navigator.appVersion.indexOf("X11") != -1) {
            OSName = UNIX;
        } else if (navigator.appVersion.indexOf("Linux") != -1) {
            OSName = LINUX;
        } else { }

        if (OSName === WINDOWS) {
            /*
            fs.readdir(localImagesFolderPath, (err, files) => {
                files.forEach(file => {
                    console.log(file);
                });
            });
            * /
            //var fs = new File
            var directory = localImagesFolderPath;
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open('GET', directory, false); // false for synchronous request
            xmlHttp.send(null);
            var ret = xmlHttp.responseText;
            var fileList = ret.split('\n');
            for (i = 0; i < fileList.length; i++) {
                var fileinfo = fileList[i].split(' ');
                if (fileinfo[0] == '201:') {
                    document.write(fileinfo[1] + "<br>");
                    document.write('<img src=\"' + directory + fileinfo[1] + '\"/>');
                }
            }
        }*/
  } catch (exception) {}
}

function readFile(file) {
  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    const result = event.target.result;
    // Do something with result
  });

  reader.addEventListener('progress', (event) => {
    if (event.loaded && event.total) {
      const percent = (event.loaded / event.total) * 100;
      console.log(`Progress: ${Math.round(percent)}`);
    }
  });
  reader.readAsDataURL(file);
}

function OpenFoldersWithPHP() {
  try {
    /*
        var url = "C:\Users\pulagam.sivaprasadr\Downloads\labeled_images";//"../LocalImages";
        var localURL = "C:\Users\pulagam.sivaprasadr\Downloads\labeled_images";//"ProjFiles/LocalImages/";
        var obj = { "localURL": url };
        dbParam = JSON.stringify(obj);
        var xobj = new XMLHttpRequest();
        // xobj.overrideMimeType("application/json");
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == 200) {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                //callback(xobj.responseText);
                var data = xobj.response;
                var options = JSON.parse(data);
                var optionsHTML = "";
                for (i = 0; i < options.all_local_files.length; i++) {
                    data += "<div id=\"lvtemplate\" style=\" position:static; margin:auto; padding-top: 12px; padding-right: 13px; padding-bottom: 16px; padding-left: 15px; height:400px; width:160px; float:left; vertical-align:middle\">" + "\n" + "<center>" + "\n" + "<h2>" + "\n" + " hi, hello" + "\n" + "</h2>" + "\n" + "<a href=\"" + localURL + options.all_local_files[i] + "\" target=\"_blank\">" + "\n" + "<img style=\"height : 200px; width : 200px; float:left\"src=\"" + localURL + options.all_local_files[i] + "\" />" + "\n" + "</a>" + "\n" + "<h3>" + "\n" + "see you..." + "\n" + "</h3>" + "\n" + "</center>" + "\n" + "</div>";
                }
                var y = document.getElementById("divDataOutputDisplay");
                y.innerHTML = data;
            }
        };
        xobj.open("POST", "./PHP/ReceiveService.php?userRequest=GetLocalImages", true);
        xobj.setRequestHeader("Content-type", "application/json");
        xobj.send(dbParam);
*/
    // alert(e.dataset.id+"\n"+e.dataset.option);
  } catch (ex) {}
}

/*
const imageUpload = document.getElementById('imageUpload');
const displayImageWithAllData = document.getElementById('imageInputDisplay');
var context;

/*
var image;
var canvas;
* /

function onLoadBody() {
    try {
        imageUpload = document.getElementById('imageUpload');
        displayImageWithAllData = document.getElementById('imageInputDisplay');

        imageUpload.addEventListener('change', async () => {
            if (image) image.remove()
            if (canvas) canvas.remove()
            image = await faceapi.bufferToImage(imageUpload.files[0])
            container.append(image)
            canvas = faceapi.createCanvasFromMedia(image)
            container.append(canvas)
            const displaySize = { width: image.width, height: image.height }
            faceapi.matchDimensions(canvas, displaySize)
            const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                drawBox.draw(canvas)
            })
        });

    } catch (exception) {}
}

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start);

async function start() {
    const container = document.getElementById('divDataInput')
    container.style.position = 'relative';
  //document.body.append(container)

    const labeledFaceDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

    let image;
    let canvas;
    container.append('Loaded');

    imageUpload.addEventListener('change', async () => {
        if (image) { image.remove(); }
        if (canvas) { canvas.remove(); }
        image = await faceapi.bufferToImage(imageUpload.files[0]);
        //container.append(image);
        canvas = faceapi.createCanvasFromMedia(image);
        //container.append(canvas);

        const displaySize = { width: image.width, height: image.height }
        faceapi.matchDimensions(canvas, displaySize)
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

        context = canvas.getContext('2d');
        displayImageWithAllData.src = image;
        displayImageWithAllData.onload = function () {
            context.drawImage(base_image, 0, 0);
        }

        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
            drawBox.draw(canvas)
        });
    });
}

function workingWithCanavas(canvas, image) {

    var canvas = document.getElementById('imageInputDisplay'),
    var context = canvas.getContext('2d');
    var displayImageWithAllData = new Image();
    displayImageWithAllData.src = image;
    displayImageWithAllData.onload = function () {
        context.drawImage(base_image, 0, 0);
    }
}


function workingWithCanavas1(canvas, image) {
    var canvas = document.getElementById('viewport'),
        context = canvas.getContext('2d');

    make_base();

    function make_base() {
        base_image = new Image();
        base_image.src = 'img/base.png';
        base_image.onload = function () {
            context.drawImage(base_image, 0, 0);
        }
    }
}

function loadLabeledImages() {
  const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
*/

/*
async function start1() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  let image
  let canvas
  document.body.append('Loaded')
  imageUpload.addEventListener('change', async () => {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload.files[0])
    container.append(image)
    canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })
  })
}
function loadLabeledImages1() {
  const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
*/

/*
const input = await faceapi.toNetInput(videoEl)
const locations = await faceapi.locateFaces(input, minConfidence)
//const resized_locations = locations.map(det => det.forSize(160, 160))
const faceImages = await faceapi.extractFaces(input.inputs[0], locations)

// detect landmarks and get the aligned face image bounding boxes
const alignedFaceBoxes = await Promise.all(faceImages.map(
    async (faceCanvas, i) => {
        const faceLandmarks = await faceapi.detectLandmarks(faceCanvas)
        return faceLandmarks.align(locations[i])
    }
))
const alignedFaceImages = await faceapi.extractFaces(input.inputs[0], alignedFaceBoxes)

// free memory for input tensors
input.dispose()

//$('#facesContainer').empty()
faceImages.forEach(async (faceCanvas, i) => {
    $('#facesContainer').append(alignedFaceImages[i])
    percentage = percentage + 5;
})



var res = document.createElement("canvas")
res.width = 160
res.height = 160
res_con = res.getContext("2d")
res_con.drawImage(alignedFaceImages[i], 0, 0, 160, 160)


*/

/*
 * https://codesandbox.io/s/cranky-thompson-0u14m?file=/src/PhotoFaceDetection.js:1811-1864
async function extractFaceFromBox(imageRef, box) {
    const regionsToExtract = [
      new faceapi.Rect(box.x, box.y, box.width, box.height)
    ];
    let faceImages = await faceapi.extractFaces(imageRef, regionsToExtract);

    if (faceImages.length === 0) {
      console.log("No face found");
    } else {
      const outputImage = "";
      faceImages.forEach((cnv) => {
        outputImage.src = cnv.toDataURL();
        setPic(cnv.toDataURL());
      });
      // setPic(faceImages.toDataUrl);
      console.log("face found ");
      console.log(pic);
    }
  }
  */
