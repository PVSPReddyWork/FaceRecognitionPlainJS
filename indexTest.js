const divPopupDisplay = document.getElementById('divPopup');
const divSelectTypeOptionsInputs = document.getElementById(
  'divSelectTypeOptionsInputs'
);
const divDataOutputDisplay = document.getElementById('divDataOutputDisplay');
const MODELS_PATH = './JS/models';
const APIAccessCode =
  'AKfycbwip48-94Ot2WwXuxGlBYgB6HoDWc4_VcSuYztNCD2SSu3qav5xDkXFoRARfnRGrqY1';
const FolderAccessCode = '1GG-syXZ7Jnvfc6gy1LlEzoa6aGhUY6YV'; //'1oEho4aHL_OPxPAUYBAKGRVHtwY7Lju37';
var labeledImagesPaths = [];
var imageUpload;

function init() {
  try {
    divPopupDisplay.style.visibility = 'hidden';
  } catch (ex) {
    console.log(ex);
  }
}
init();

function onOptionSelected(e) {
  try {
    let owner = e;
    //let addData
    divPopupDisplay.style.visibility = 'visible';
    if (e.id === 'selectInputType') {
      const selectedInputTypeValue = e.value;
      console.log(selectedInputTypeValue);
      switch (selectedInputTypeValue) {
        case 'Go With Custom Data':
          imageUpload = document.createElement('input');
          imageUpload.id = 'imageUpload';
          imageUpload.type = 'file';
          imageUpload.accept = 'image/png, image/gif, image/jpeg';
          divSelectTypeOptionsInputs.append(imageUpload);
          break;
        case 'I have all Ids':
          break;
        default:
          divSelectTypeOptionsInputs.innerHTML = '';
          break;
      }
    }
  } catch (ex) {
    console.log(ex);
  }
  divPopupDisplay.style.visibility = 'hidden';
}
