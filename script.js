// DOM Elements
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
const resultContainer = document.getElementById('result-container');
const predictionClass = document.getElementById('prediction-class');
const confidenceLevel = document.getElementById('confidence-level');
const confidenceValue = document.getElementById('confidence-value');
const disposalMethod = document.getElementById('disposal-method');
const recyclingInfo = document.getElementById('recycling-info');
const environmentalImpact = document.getElementById('environmental-impact');
const newClassificationBtn = document.getElementById('new-classification-btn');
const learnMoreBtn = document.getElementById('learn-more-btn');
const analyzingText = document.getElementById('analyzing-text');

// Input method elements
const uploadMethodBtn = document.getElementById('upload-btn-method');
const webcamMethodBtn = document.getElementById('webcam-btn-method');
const webcamContainer = document.getElementById('webcam-container');
const webcam = document.getElementById('webcam');
const captureBtn = document.getElementById('capture-btn');

// Contact form elements
const contactForm = document.getElementById('contact-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const categoryInput = document.getElementById('category');
const messageInput = document.getElementById('message');

// Waste information database
const wasteDatabase = {
    "E-waste": {
        disposal: "Special e-waste recycling centers",
        recycling: "E-waste contains valuable metals and hazardous materials. Proper recycling recovers resources and prevents pollution.",
        impact: "Improper disposal can leak lead, mercury, and other toxins into the environment."
    },
    "Automobile Wastes": {
        disposal: "Automotive waste recycling facilities",
        recycling: "Vehicle parts can often be refurbished or recycled. Fluids require special handling.",
        impact: "Auto fluids can contaminate soil and water if not disposed properly."
    },
    "Battery Waste": {
        disposal: "Battery collection points or retailers that sell batteries",
        recycling: "Batteries contain valuable metals that can be recovered and reused.",
        impact: "Batteries can leak heavy metals like lead and cadmium into the environment."
    },
    "Glass Waste": {
        disposal: "Glass recycling bins or local recycling centers",
        recycling: "Glass can be recycled endlessly without quality loss. Separate by color when possible.",
        impact: "Glass takes over 1 million years to decompose in landfills."
    },
    "Light Bulbs": {
        disposal: "Special bulb recycling locations (varies by bulb type)",
        recycling: "CFLs contain mercury and require special recycling. LEDs are more eco-friendly.",
        impact: "CFLs can release mercury vapor if broken, harming air quality."
    },
    "Metal Waste": {
        disposal: "Metal recycling centers or curbside recycling",
        recycling: "Metals can be recycled indefinitely. Aluminum recycling saves 95% of energy vs new production.",
        impact: "Mining for new metals causes significant habitat destruction and pollution."
    },
    "Organic Waste": {
        disposal: "Compost bins or municipal organic waste collection",
        recycling: "Organic waste can be composted into nutrient-rich soil amendment.",
        impact: "Decomposing organics in landfills produce methane, a potent greenhouse gas."
    },
    "Paper Waste": {
        disposal: "Paper recycling bins or local recycling programs",
        recycling: "Paper can be recycled 5-7 times before fibers become too short.",
        impact: "Recycling paper saves trees and uses 70% less energy than making new paper."
    },
    "Plastic Waste": {
        disposal: "Check local guidelines as plastic types vary in recyclability",
        recycling: "Not all plastics are equally recyclable. Look for resin identification codes.",
        impact: "Plastic can take up to 500 years to decompose and harms marine life."
    },
    "Background": {
        disposal: "No waste detected - nothing to dispose",
        recycling: "No waste present in the image",
        impact: "No environmental impact from waste"
    }
};

// Current active input method
let activeMethod = 'upload';
let currentFacingMode = 'environment'; // Default to back camera
const switchCameraBtn = document.getElementById('switch-camera-btn');

// Load Teachable Machine model
let model, labels;
async function loadModel() {
    try {
        // Show loading state
        predictionClass.textContent = 'Loading model...';
        resultContainer.style.display = 'block';
        
        // Load model
        model = await tf.loadLayersModel('model/model.json');
        
        // Load labels from metadata
        const metadata = await fetch('model/metadata.json').then(res => res.json());
        labels = metadata.labels;
        
        console.log("Model and labels loaded successfully");
        resultContainer.style.display = 'none';
    } catch (err) {
        console.error("Error loading model:", err);
        resultContainer.style.display = 'block';
        predictionClass.textContent = 'Error loading model';
        confidenceValue.textContent = '0%';
        confidenceLevel.style.width = '0%';
        disposalMethod.textContent = 'Please check console for details';
    }
}

// Initialize
loadModel();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const navbarHeight = 120; // Adjust this value based on your navbar height
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Set up input method switching
uploadMethodBtn.addEventListener('click', () => switchInputMethod('upload'));
webcamMethodBtn.addEventListener('click', () => switchInputMethod('webcam'));

function switchInputMethod(method) {
    activeMethod = method;
    
    // Reset all UI elements
    uploadArea.style.display = 'none';
    webcamContainer.style.display = 'none';
    imagePreview.style.display = 'none';
    resultContainer.style.display = 'none';
    analyzingText.style.display = 'none';
    switchCameraBtn.style.display = 'none';
    
    // Update active button
    uploadMethodBtn.classList.remove('active');
    webcamMethodBtn.classList.remove('active');
    
    // Show selected method
    switch(method) {
        case 'upload':
            uploadArea.style.display = 'block';
            uploadMethodBtn.classList.add('active');
            break;
        case 'webcam':
            webcamContainer.style.display = 'block';
            webcamMethodBtn.classList.add('active');
            initWebcam();
            break;
    }
}

// Upload method event listeners
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary)';
    uploadArea.style.backgroundColor = 'rgba(103, 114, 229, 0.1)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--gray)';
    uploadArea.style.backgroundColor = 'transparent';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--gray)';
    uploadArea.style.backgroundColor = 'transparent';
    
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFileUpload(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFileUpload(e.target.files[0]);
    }
});

// Webcam method
let stream = null;

async function initWebcam() {
    try {
        // Stop any existing stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        const constraints = {
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        webcam.srcObject = stream;
        switchCameraBtn.style.display = 'block';
    } catch (err) {
        console.error("Error accessing webcam:", err);
        
        // If back camera fails, try front camera
        if (currentFacingMode === 'environment') {
            currentFacingMode = 'user';
            try {
                await initWebcam();
                return;
            } catch (fallbackErr) {
                console.error("Fallback camera also failed:", fallbackErr);
            }
        }
        
        alert("Could not access webcam. Please check permissions.");
        switchCameraBtn.style.display = 'none';
    }
}

switchCameraBtn.addEventListener('click', async () => {
    // Toggle between front and back camera
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    
    // Show loading indicator
    switchCameraBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        await initWebcam();
    } catch (err) {
        console.error("Error switching camera:", err);
        alert("Could not switch camera. Some devices may not support multiple cameras.");
    }
    
    // Restore icon
    switchCameraBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
});

captureBtn.addEventListener('click', () => {
    // Create canvas to capture image
    const canvas = document.createElement('canvas');
    canvas.width = webcam.videoWidth;
    canvas.height = webcam.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);
    
    // Convert to image and predict
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        imagePreview.src = url;
        imagePreview.style.display = 'block';
        webcamContainer.style.display = 'none';
        
        imagePreview.onload = () => {
            predictImage(imagePreview);
            URL.revokeObjectURL(url);
        };
    }, 'image/jpeg', 0.9);
});

// New classification button
newClassificationBtn.addEventListener('click', () => {
    resultContainer.style.display = 'none';
    analyzingText.style.display = 'none';
    switchInputMethod(activeMethod);
});

// Learn more button
learnMoreBtn.addEventListener('click', () => {
    const currentClass = predictionClass.textContent;
    if (currentClass && currentClass !== "Analyzing..." && currentClass !== "Error") {
        alert(`Learn more about ${currentClass}:\n\nRecycling Info: ${wasteDatabase[currentClass].recycling}\n\nEnvironmental Impact: ${wasteDatabase[currentClass].impact}`);
    }
});

// Handle file upload
function handleFileUpload(file) {
    if (!file.type.match('image.*')) {
        alert('Please upload an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        uploadArea.style.display = 'none';
        
        // Show analyzing text while processing
        analyzingText.style.display = 'block';
        analyzingText.textContent = 'Analyzing image...';
        
        // When image is loaded, run prediction
        imagePreview.onload = () => {
            predictImage(imagePreview);
        };
    };
    reader.readAsDataURL(file);
}

// Predict function
async function predictImage(imageElement) {
    if (!model) {
        alert('Model is still loading. Please wait...');
        return;
    }

    // Show loading state
    resultContainer.style.display = 'none';
    analyzingText.style.display = 'block';
    analyzingText.textContent = 'Analyzing waste type...';

    try {
        // Preprocess the image
        const tensor = tf.browser.fromPixels(imageElement)
            .resizeNearestNeighbor([224, 224])  // Model expects 224x224
            .toFloat()
            .div(tf.scalar(255))  // Normalize to [0,1]
            .expandDims();
        
        // Predict
        const predictions = await model.predict(tensor).data();
        const maxPrediction = Math.max(...predictions);
        const predictedIndex = predictions.indexOf(maxPrediction);
        const predictedLabel = labels[predictedIndex];
        
        // Hide analyzing text and show results
        analyzingText.style.display = 'none';
        resultContainer.style.display = 'block';
        
        // Display results with animation
        predictionClass.textContent = predictedLabel;
        confidenceValue.textContent = `${(maxPrediction * 100).toFixed(1)}%`;
        confidenceLevel.style.width = `${maxPrediction * 100}%`;
        
        // Show waste information
        const wasteData = wasteDatabase[predictedLabel] || {
            disposal: 'Standard waste bin',
            recycling: 'No specific recycling information available',
            impact: 'No significant environmental impact data'
        };
        
        disposalMethod.textContent = `Disposal Method: ${wasteData.disposal}`;
        recyclingInfo.textContent = wasteData.recycling;
        environmentalImpact.textContent = `Environmental Impact: ${wasteData.impact}`;
        
        // Clean up
        tensor.dispose();
    } catch (error) {
        console.error("Prediction error:", error);
        analyzingText.style.display = 'none';
        resultContainer.style.display = 'block';
        predictionClass.textContent = 'Error';
        confidenceValue.textContent = '0%';
        confidenceLevel.style.width = '0%';
        disposalMethod.textContent = 'Unable to determine';
    }
}

// Contact form submission
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validate form
    if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
        alert('Please fill in all required fields');
        return;
    }
    
    // In a real app, you would send this data to a server
    console.log('Form submitted:', {
        name: nameInput.value,
        email: emailInput.value,
        category: categoryInput.value,
        message: messageInput.value
    });
    
    // Show success message and reset form
    alert('Thank you for your message! We will get back to you soon.');
    contactForm.reset();
    
    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Clean up webcam on page unload
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    switchCameraBtn.style.display = 'none';
});

// Initialize with upload method
switchInputMethod('upload');