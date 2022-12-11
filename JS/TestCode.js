const imageUpload = document.getElementById('imageUpload');
const divDataOutputDisplay = document.getElementById('divDataOutputDisplay');
const divPopupDisplay = document.getElementById('divPopup');

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/JS/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/JS/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/JS/models')
]).then(start);


/*

async function onUploadInputChangedEvent() {
    try {
        divDataOutputDisplay.append('Loaded');
        let uploadedImageFile = imageUpload.files[0];
        let displayImageWithAllData = new Image();
        divDataOutputDisplay.append(displayImageWithAllData);        
        displayImageWithAllData.style.width = "100%";
        displayImageWithAllData.style.height = "100%";

        // FileReader support
        if (FileReader && uploadedImageFile) {// && files.length) {
            var fr = new FileReader();
            fr.onload = function () {
                //document.getElementById(outImage).src = fr.result;
                displayImageWithAllData.src = fr.result;
            }
            fr.readAsDataURL(uploadedImageFile);
        }// Not supported
        else {
            // fallback -- perhaps submit the input to an iframe and temporarily store
            // them on the server until the user's session ends.
        }
        //displayImageWithAllData.src = uploadedImageFile;
        displayImageWithAllData.onload = function () {
            //context.drawImage(base_image, 0, 0);
        }
    }
    catch (ex) {}
}
*/

async function start() {
    const container = document.getElementById('divDataOutputDisplay');
    //container.style.position = 'relative'
    //document.body.append(container)
    const labeledFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    let image
    let canvas
    //document.body.append('Loaded')
    const logger = document.getElementById('divDataReferencesDisplay');
    logger.append('Loaded')
    divPopupDisplay.style.visibility = "hidden";
    imageUpload.addEventListener('change', async () => {
        if (image) image.remove()
        if (canvas) canvas.remove()
        image = await faceapi.bufferToImage(imageUpload.files[0]);
        /*
        image.style.height = "500px";
        image.style.width = "450px";
        image.height = "500px";
        image.width = "450px";
        */
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
async function start1() {
    const container = document.getElementById('divDataOutputDisplay')
    //container.style.position = 'relative'
    //document.body.append(container)

    const labeledFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    let image
    let canvas

    document.body.append('Loaded')
    imageUpload.addEventListener('change', async () => {
        if (image) { image.remove() }
        if (canvas) { canvas.remove() }
        let uploadedImageFile = imageUpload.files[0];
        image = await faceapi.bufferToImage(imageUpload.files[0]);
        /*
        image.width = container.width;
        image.height = container.height;
        container.append(image)
        */
        canvas = faceapi.createCanvasFromMedia(image)
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = "100%";
        canvas.height = "100%";
        container.append(canvas)


        var context = canvas.getContext('2d');
        var displayImageWithAllData = new Image();
        displayImageWithAllData.style.width = "100%";
        displayImageWithAllData.style.height = "100%";
        // FileReader support
        if (FileReader && uploadedImageFile) {
            var fr = new FileReader();
            fr.onload = function () {
                displayImageWithAllData.src = fr.result;
            }
            fr.readAsDataURL(uploadedImageFile);
        }
        else {
        }
        displayImageWithAllData.onload = async function () {
            context.drawImage(displayImageWithAllData, 0, 0);

            const displaySize = { width: displayImageWithAllData.style.width, height: displayImageWithAllData.style.height }
            faceapi.matchDimensions(canvas, displaySize)
            const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                drawBox.draw(canvas)
            });
        }
        /*
        const displaySize = { width: displayImageWithAllData.style.width, height: displayImageWithAllData.style.height }
        faceapi.matchDimensions(canvas, displaySize)
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
            drawBox.draw(canvas)
        });
        */
    });
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

