document.addEventListener('DOMContentLoaded', () => {
    // Navigation logic
    const navHiveFest10 = document.getElementById('navHiveFest10');
    const navInstaxHF10 = document.getElementById('navInstaxHF10');
    const hivefest10Section = document.getElementById('hivefest10Section');
    const instaxhf10Section = document.getElementById('instaxhf10Section');
    const mainTitle = document.getElementById('mainTitle');

    navHiveFest10.addEventListener('click', (e) => {
        e.preventDefault();
        navHiveFest10.classList.add('active');
        navInstaxHF10.classList.remove('active');
        hivefest10Section.style.display = '';
        instaxhf10Section.style.display = 'none';
        mainTitle.innerHTML = 'HiveFest<span class="super">10</span> Image Generator';
    });
    navInstaxHF10.addEventListener('click', (e) => {
        e.preventDefault();
        navInstaxHF10.classList.add('active');
        navHiveFest10.classList.remove('active');
        hivefest10Section.style.display = 'none';
        instaxhf10Section.style.display = '';
        mainTitle.innerHTML = 'Polaroid Instax HF10 Overlay';
    });

    // HiveFest10 logic
    const imageUpload = document.getElementById('imageUpload');
    const fileName = document.getElementById('fileName');
    const uploadedImage = document.getElementById('uploadedImage');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const generateButton = document.getElementById('generateButton');
    const downloadButton = document.getElementById('downloadButton');
    const copyButton = document.getElementById('copyButton');
    const downloadOptions = document.getElementById('downloadOptions');
    const cropperContainer = document.getElementById('cropperContainer');
    const cropperImage = document.getElementById('cropperImage');
    const cropDoneButton = document.getElementById('cropDoneButton');
    const dropZone = document.getElementById('dropZone');
    let selectedFrameSrc = null;
    let cropper = null;

    // Debug function
    const debugImageLoad = (img, src) => {
        console.log('Attempting to load image:', src);
        return new Promise((resolve, reject) => {
            img.onload = () => {
                console.log('Successfully loaded image:', src);
                resolve(img);
            };
            img.onerror = (e) => {
                console.error('Failed to load image:', src, e);
                reject(new Error(`Failed to load image: ${src}`));
            };
            img.src = src;
        });
    };

    // Preload frames with better error handling
    const preloadFrames = (selector) => {
        document.querySelectorAll(selector).forEach(frame => {
            const tryLoadImage = (src) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                return debugImageLoad(img, src);
            };
            tryLoadImage(frame.src)
                .then(() => {
                    frame.dataset.valid = 'true';
                    frame.dataset.loaded = 'true';
                    console.log('Frame loaded successfully:', frame.src);
                })
                .catch(() => {
                    const imgurUrl = 'https://i.imgur.com/bXwurtl.png';
                    console.log('Trying backup URL:', imgurUrl);
                    tryLoadImage(imgurUrl)
                        .then(() => {
                            frame.src = imgurUrl;
                            frame.dataset.valid = 'true';
                            frame.dataset.loaded = 'true';
                            console.log('Frame loaded successfully from Imgur');
                        })
                        .catch(() => {
                            frame.dataset.valid = 'false';
                            console.error('Frame failed to load from all sources');
                        });
                });
        });
    };
    preloadFrames('.frame');

    // Handle file processing
    const processFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            fileName.textContent = file.name || 'Pasted image';
            const reader = new FileReader();
            reader.onload = (e) => {
                cropperImage.src = e.target.result;
                uploadedImage.src = e.target.result;
                cropperContainer.style.display = 'block';
                uploadedImage.style.display = 'none';
                canvas.style.display = 'none';
                downloadOptions.style.display = 'none';
                if (cropper) {
                    cropper.destroy();
                }
                cropper = new Cropper(cropperImage, {
                    aspectRatio: 16 / 9,
                    viewMode: 2,
                    background: false,
                    zoomable: true,
                    minCropBoxWidth: 100,
                    minCropBoxHeight: 100
                });
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please provide a valid image file.');
        }
    };

    // Instax Mini logic
    const imageUploadInstax = document.getElementById('imageUploadInstax');
    const fileNameInstax = document.getElementById('fileNameInstax');
    const uploadedImageInstax = document.getElementById('uploadedImageInstax');
    const canvasInstax = document.getElementById('canvasInstax');
    const ctxInstax = canvasInstax.getContext('2d');
    const generateButtonInstax = document.getElementById('generateButtonInstax');
    const downloadButtonInstax = document.getElementById('downloadButtonInstax');
    const copyButtonInstax = document.getElementById('copyButtonInstax');
    const downloadOptionsInstax = document.getElementById('downloadOptionsInstax');
    const cropperContainerInstax = document.getElementById('cropperContainerInstax');
    const cropperImageInstax = document.getElementById('cropperImageInstax');
    const cropDoneButtonInstax = document.getElementById('cropDoneButtonInstax');
    const dropZoneInstax = document.getElementById('dropZoneInstax');
    let selectedFrameSrcInstax = null;
    let cropperInstax = null;

    preloadFrames('#frameSelectionInstax .frame');

    const processFileInstax = (file) => {
        if (file && file.type.startsWith('image/')) {
            fileNameInstax.textContent = file.name || 'Pasted image';
            const reader = new FileReader();
            reader.onload = (e) => {
                cropperImageInstax.src = e.target.result;
                uploadedImageInstax.src = e.target.result;
                cropperContainerInstax.style.display = 'block';
                uploadedImageInstax.style.display = 'none';
                canvasInstax.style.display = 'none';
                downloadOptionsInstax.style.display = 'none';
                if (cropperInstax) {
                    cropperInstax.destroy();
                }
                cropperInstax = new Cropper(cropperImageInstax, {
                    aspectRatio: 890 / 1188,
                    viewMode: 2,
                    background: false,
                    zoomable: true,
                    minCropBoxWidth: 89,
                    minCropBoxHeight: 119
                });
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please provide a valid image file.');
        }
    };

    // Drag and drop handling
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        processFile(file);
    });
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        processFile(file);
    });

    // Instax drag and drop
    dropZoneInstax.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZoneInstax.classList.add('drag-over');
    });
    dropZoneInstax.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZoneInstax.classList.remove('drag-over');
    });
    dropZoneInstax.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZoneInstax.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        processFileInstax(file);
    });
    imageUploadInstax.addEventListener('change', (e) => {
        const file = e.target.files[0];
        processFileInstax(file);
    });

    // Paste handling for both sections
    document.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.type.indexOf('image') === 0) {
                const file = item.getAsFile();
                if (hivefest10Section.style.display !== 'none') {
                    processFile(file);
                } else {
                    processFileInstax(file);
                }
                break;
            }
        }
    });

    // Handle frame selection with absolute paths
    document.querySelectorAll('#frameSelection .frame').forEach(frame => {
        frame.addEventListener('click', () => {
            const absolutePath = frame.dataset.absolutePath || new URL(frame.src, window.location.href).href;
            console.log('Frame clicked:', absolutePath);
            if (frame.dataset.valid !== 'true') {
                console.log('Attempting to reload invalid frame');
                const img = new Image();
                img.crossOrigin = 'anonymous';
                debugImageLoad(img, absolutePath)
                    .then(() => {
                        frame.dataset.valid = 'true';
                        selectFrame(frame, absolutePath);
                    })
                    .catch(() => {
                        alert('Frame unavailable. Please try another.');
                    });
                return;
            }
            selectFrame(frame, absolutePath);
        });
    });
    const selectFrame = (frame, absolutePath) => {
        document.querySelectorAll('#frameSelection .frame').forEach(f => f.classList.remove('selected'));
        frame.classList.add('selected');
        selectedFrameSrc = absolutePath;
        console.log('Frame selected:', selectedFrameSrc);
    };

    // Instax frame selection
    document.querySelectorAll('#frameSelectionInstax .frame').forEach(frame => {
        frame.addEventListener('click', () => {
            const absolutePath = frame.dataset.absolutePath || new URL(frame.src, window.location.href).href;
            console.log('Instax Frame clicked:', absolutePath);
            if (frame.dataset.valid !== 'true') {
                console.log('Attempting to reload invalid frame');
                const img = new Image();
                img.crossOrigin = 'anonymous';
                debugImageLoad(img, absolutePath)
                    .then(() => {
                        frame.dataset.valid = 'true';
                        selectFrameInstax(frame, absolutePath);
                    })
                    .catch(() => {
                        alert('Frame unavailable. Please try another.');
                    });
                return;
            }
            selectFrameInstax(frame, absolutePath);
        });
    });
    const selectFrameInstax = (frame, absolutePath) => {
        document.querySelectorAll('#frameSelectionInstax .frame').forEach(f => f.classList.remove('selected'));
        frame.classList.add('selected');
        selectedFrameSrcInstax = absolutePath;
        console.log('Instax Frame selected:', selectedFrameSrcInstax);
    };

    // Handle crop completion with cross-origin support
    cropDoneButton.addEventListener('click', () => {
        if (cropper) {
            const croppedCanvas = cropper.getCroppedCanvas({
                width: 1920,
                height: 1080,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });
            const cleanCanvas = document.createElement('canvas');
            cleanCanvas.width = croppedCanvas.width;
            cleanCanvas.height = croppedCanvas.height;
            const ctx = cleanCanvas.getContext('2d');
            ctx.drawImage(croppedCanvas, 0, 0);
            uploadedImage.src = cleanCanvas.toDataURL('image/png');
            cropperContainer.style.display = 'none';
            uploadedImage.style.display = 'block';
        }
    });
    cropDoneButtonInstax.addEventListener('click', () => {
        if (cropperInstax) {
            const croppedCanvas = cropperInstax.getCroppedCanvas({
                width: 890,
                height: 1188,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });
            const cleanCanvas = document.createElement('canvas');
            cleanCanvas.width = croppedCanvas.width;
            cleanCanvas.height = croppedCanvas.height;
            const ctx = cleanCanvas.getContext('2d');
            ctx.drawImage(croppedCanvas, 0, 0);
            uploadedImageInstax.src = cleanCanvas.toDataURL('image/png');
            cropperContainerInstax.style.display = 'none';
            uploadedImageInstax.style.display = 'block';
        }
    });

    // Generate final image
    generateButton.addEventListener('click', async () => {
        if (!uploadedImage.src || !selectedFrameSrc) {
            alert('Please select an image and choose a frame.');
            return;
        }
        const selectedFrame = document.querySelector('#frameSelection .frame.selected');
        if (selectedFrame && selectedFrame.dataset.valid === 'false') {
            alert('The selected frame is not available. Please choose another one.');
            return;
        }
        try {
            const frameImage = new Image();
            frameImage.crossOrigin = 'anonymous';
            const loadFrame = new Promise((resolve, reject) => {
                frameImage.onload = () => resolve();
                frameImage.onerror = () => {
                    reject(new Error('Unable to load the selected frame. Please try again or choose another frame.'));
                };
                frameImage.src = `${selectedFrameSrc}?t=${new Date().getTime()}`;
            });
            await loadFrame;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 1920;
            tempCanvas.height = 1080;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(uploadedImage, 0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(frameImage, 0, 0, tempCanvas.width, tempCanvas.height);
            canvas.width = tempCanvas.width;
            canvas.height = tempCanvas.height;
            ctx.drawImage(tempCanvas, 0, 0);
            uploadedImage.style.display = 'none';
            canvas.style.display = 'block';
            downloadOptions.style.display = 'block';
        } catch (error) {
            console.error('Generation error:', error);
            alert(error.message);
        }
    });

    // Instax generate final image
    generateButtonInstax.addEventListener('click', async () => {
        if (!uploadedImageInstax.src || !selectedFrameSrcInstax) {
            alert('Bitte Bild und Rahmen auswählen.');
            return;
        }
        const selectedFrame = document.querySelector('#frameSelectionInstax .frame.selected');
        if (selectedFrame && selectedFrame.dataset.valid === 'false') {
            alert('Der ausgewählte Rahmen ist nicht verfügbar. Bitte anderen wählen.');
            return;
        }
        try {
            const frameImage = new Image();
            frameImage.crossOrigin = 'anonymous';
            const loadFrame = new Promise((resolve, reject) => {
                frameImage.onload = () => resolve();
                frameImage.onerror = () => {
                    reject(new Error('Instax Rahmen konnte nicht geladen werden.')); 
                };
                frameImage.src = `${selectedFrameSrcInstax}?t=${new Date().getTime()}`;
            });
            await loadFrame;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 890;
            tempCanvas.height = 1188;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(uploadedImageInstax, 0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(frameImage, 0, 0, tempCanvas.width, tempCanvas.height);
            canvasInstax.width = tempCanvas.width;
            canvasInstax.height = tempCanvas.height;
            ctxInstax.drawImage(tempCanvas, 0, 0);
            uploadedImageInstax.style.display = 'none';
            canvasInstax.style.display = 'block';
            downloadOptionsInstax.style.display = 'block';
        } catch (error) {
            console.error('Instax Generation error:', error);
            alert(error.message);
        }
    });

    // Generate random filename
    const generateRandomFilename = () => {
        const adjectives = ['awesome', 'amazing', 'cool', 'vibrant', 'fantastic', 'epic'];
        const nouns = ['hiver', 'witness', 'community', 'festival', 'celebration'];
        const randomNum = Math.floor(Math.random() * 10000);
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `hivefest10-${adj}-${noun}-${randomNum}.png`;
    };
    const generateRandomFilenameInstax = () => {
        const adjectives = ['instax', 'mini', 'leica', 'sofort', 'polaroid', 'hf10'];
        const nouns = ['snapshot', 'memory', 'festival', 'moment', 'frame'];
        const randomNum = Math.floor(Math.random() * 10000);
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `instaxhf10-${adj}-${noun}-${randomNum}.png`;
    };

    // Download image
    downloadButton.addEventListener('click', () => {
        try {
            const link = document.createElement('a');
            link.download = generateRandomFilename();
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            alert('Error downloading: ' + error.message);
        }
    });
    downloadButtonInstax.addEventListener('click', () => {
        try {
            const link = document.createElement('a');
            link.download = generateRandomFilenameInstax();
            link.href = canvasInstax.toDataURL('image/png');
            link.click();
        } catch (error) {
            alert('Fehler beim Download: ' + error.message);
        }
    });

    // Copy to clipboard
    copyButton.addEventListener('click', async () => {
        try {
            canvas.toBlob(async (blob) => {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                alert('Image copied to clipboard!');
            });
        } catch (error) {
            alert('Error copying to clipboard: ' + error.message);
        }
    });
    copyButtonInstax.addEventListener('click', async () => {
        try {
            canvasInstax.toBlob(async (blob) => {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                alert('Bild in die Zwischenablage kopiert!');
            });
        } catch (error) {
            alert('Fehler beim Kopieren: ' + error.message);
        }
    });
});
