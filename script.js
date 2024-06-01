document
  .getElementById("originalImage")
  .addEventListener("change", loadOriginalImage);
document
  .getElementById("watermarkImage")
  .addEventListener("change", loadWatermarkImage);
document
  .getElementById("applyWatermark")
  .addEventListener("click", applyWatermark);
document
  .getElementById("downloadResult")
  .addEventListener("click", downloadResult);
document
  .getElementById("watermarkedImage")
  .addEventListener("change", loadWatermarkedImage);
document
  .getElementById("extractWatermark")
  .addEventListener("click", extractWatermark);

let originalImageCanvas = document.getElementById("canvasOriginal");
let watermarkImageCanvas = document.getElementById("canvasWatermark");
let resultCanvas = document.getElementById("canvasResult");
let extractedWatermarkCanvas = document.getElementById(
  "canvasExtractedWatermark"
);

let originalImageContext = originalImageCanvas.getContext("2d");
let watermarkImageContext = watermarkImageCanvas.getContext("2d");
let resultContext = resultCanvas.getContext("2d");
let extractedWatermarkContext = extractedWatermarkCanvas.getContext("2d");

let originalImage, watermarkImage, watermarkedImage;

function loadOriginalImage(event) {
  let reader = new FileReader();
  reader.onload = function (e) {
    let img = new Image();
    img.onload = function () {
      originalImageCanvas.style.display = "block";
      originalImageCanvas.width = img.width;
      originalImageCanvas.height = img.height;
      originalImageContext.clearRect(
        0,
        0,
        originalImageCanvas.width,
        originalImageCanvas.height
      );
      originalImageContext.drawImage(
        img,
        0,
        0,
        originalImageCanvas.width,
        originalImageCanvas.height
      );
      originalImage = img;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(event.target.files[0]);
}

function loadWatermarkImage(event) {
  let reader = new FileReader();
  reader.onload = function (e) {
    let img = new Image();
    img.onload = function () {
      watermarkImageCanvas.style.display = "block";
      watermarkImageCanvas.width = originalImageCanvas.width;
      watermarkImageCanvas.height = originalImageCanvas.height;
      watermarkImageContext.clearRect(
        0,
        0,
        watermarkImageCanvas.width,
        watermarkImageCanvas.height
      );
      watermarkImageContext.drawImage(
        img,
        0,
        0,
        watermarkImageCanvas.width,
        watermarkImageCanvas.height
      );
      watermarkImage = img;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(event.target.files[0]);
}

function applyWatermark() {
  if (!originalImage || !watermarkImage) {
    alert("Please load both images.");
    return;
  }

  resultCanvas.style.display = "block";
  resultCanvas.width = originalImageCanvas.width;
  resultCanvas.height = originalImageCanvas.height;

  let originalImageData = originalImageContext.getImageData(
    0,
    0,
    originalImageCanvas.width,
    originalImageCanvas.height
  );
  let watermarkImageData = watermarkImageContext.getImageData(
    0,
    0,
    originalImageCanvas.width,
    originalImageCanvas.height
  );

  let originalData = originalImageData.data;
  let watermarkData = watermarkImageData.data;
  let resultData = new Uint8ClampedArray(originalData);

  for (let i = 0; i < originalData.length; i += 4) {
    resultData[i] = originalData[i] + 0.01 * watermarkData[i]; // R
    resultData[i + 1] = originalData[i + 1] + 0.01 * watermarkData[i + 1]; // G
    resultData[i + 2] = originalData[i + 2] + 0.01 * watermarkData[i + 2]; // B
  }

  let resultImageData = new ImageData(
    resultData,
    originalImageData.width,
    originalImageData.height
  );
  resultContext.putImageData(resultImageData, 0, 0);
}

function downloadResult() {
  let link = document.createElement("a");
  link.download = "watermarked_image.png";
  link.href = resultCanvas.toDataURL();
  link.click();
}

function loadWatermarkedImage(event) {
  let reader = new FileReader();
  reader.onload = function (e) {
    let img = new Image();
    img.onload = function () {
      resultCanvas.style.display = "block";
      resultCanvas.width = img.width;
      resultCanvas.height = img.height;
      resultContext.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
      resultContext.drawImage(
        img,
        0,
        0,
        resultCanvas.width,
        resultCanvas.height
      );
      watermarkedImage = img;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(event.target.files[0]);
}

function extractWatermark() {
  if (!watermarkedImage) {
    alert("Please load the watermarked image.");
    return;
  }

  let watermarkedImageData = resultContext.getImageData(
    0,
    0,
    resultCanvas.width,
    resultCanvas.height
  );
  let originalImageData = originalImageContext.getImageData(
    0,
    0,
    originalImageCanvas.width,
    originalImageCanvas.height
  );

  let watermarkedData = watermarkedImageData.data;
  let originalData = originalImageData.data;
  let extractedData = new Uint8ClampedArray(watermarkedData.length);

  for (let i = 0; i < watermarkedData.length; i += 4) {
    extractedData[i] = (watermarkedData[i] - originalData[i]) / 0.01; // R
    extractedData[i + 1] =
      (watermarkedData[i + 1] - originalData[i + 1]) / 0.01; // G
    extractedData[i + 2] =
      (watermarkedData[i + 2] - originalData[i + 2]) / 0.01; // B
    extractedData[i + 3] = 255; // A
  }

  extractedWatermarkCanvas.style.display = "block";
  extractedWatermarkCanvas.width = resultCanvas.width;
  extractedWatermarkCanvas.height = resultCanvas.height;
  extractedWatermarkContext.putImageData(
    new ImageData(extractedData, resultCanvas.width, resultCanvas.height),
    0,
    0
  );
}
