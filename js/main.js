document.addEventListener('DOMContentLoaded', () => {
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
    const preloadFrames = () => {
        document.querySelectorAll('.frame').forEach(frame => {
            // Use direct Imgur URL if local file fails
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
                    // If local file fails, try Imgur URL as backup
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
    preloadFrames();

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

    // Paste handling
    document.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.type.indexOf('image') === 0) {
                const file = item.getAsFile();
                processFile(file);
                break;
            }
        }
    });

    // Handle image upload
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        processFile(file);
    });

    // Handle frame selection with absolute paths
    document.querySelectorAll('.frame').forEach(frame => {
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
        document.querySelectorAll('.frame').forEach(f => f.classList.remove('selected'));
        frame.classList.add('selected');
        selectedFrameSrc = absolutePath;
        console.log('Frame selected:', selectedFrameSrc);
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
            
            // Create a new canvas to ensure it's not tainted
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

    // Generate final image
    generateButton.addEventListener('click', async () => {
        if (!uploadedImage.src || !selectedFrameSrc) {
            alert('Please select an image and choose a frame.');
            return;
        }

        const selectedFrame = document.querySelector('.frame.selected');
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

            // Create a new untainted canvas
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 1920;
            tempCanvas.height = 1080;
            const tempCtx = tempCanvas.getContext('2d');

            // Draw on temp canvas
            tempCtx.drawImage(uploadedImage, 0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(frameImage, 0, 0, tempCanvas.width, tempCanvas.height);

            // Copy to display canvas
            canvas.width = tempCanvas.width;
            canvas.height = tempCanvas.height;
            ctx.drawImage(tempCanvas, 0, 0);

            // Show canvas and download options
            uploadedImage.style.display = 'none';
            canvas.style.display = 'block';
            downloadOptions.style.display = 'block';
        } catch (error) {
            console.error('Generation error:', error);
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
});