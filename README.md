# 🔍 AI Image Forensics Tool

> **Enterprise-grade detection system for AI-generated images and deepfakes using multi-modal forensic analysis**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/flask-2.0+-green.svg)](https://flask.palletsprojects.com/)
[![Status](https://img.shields.io/badge/status-production-success.svg)](https://github.com)

![AI Forensics Banner] <img width="1897" height="867" alt="image" src="https://github.com/user-attachments/assets/9c3125a2-183d-4c8d-a8a8-2f6ac1eac254" />
<img width="1919" height="864" alt="Screenshot 2026-01-31 155433" src="https://github.com/user-attachments/assets/998c2be9-a32f-4a57-aec5-c1887f6809fd" />
<img width="1895" height="863" alt="Screenshot 2026-01-31 155454" src="https://github.com/user-attachments/assets/11d6a5fe-e7b6-4309-815d-c6f736571c70" />
<img width="1899" height="870" alt="Screenshot 2026-01-31 155506" src="https://github.com/user-attachments/assets/a7f60f69-269e-45a1-af20-d8414b6956f0" />

<img width="1758" height="845" alt="Screenshot 2026-01-31 155609" src="https://github.com/user-attachments/assets/04192412-0442-4fe5-9743-79eb796265f5" />


---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Demo](#-demo)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Technical Details](#-technical-details)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

The **AI Image Forensics Tool** is a professional-grade web application designed to detect synthetic media, AI-generated images, and deepfakes. It combines traditional digital forensics techniques with modern signal processing to provide comprehensive image authenticity verification.

### Why This Matters

With the proliferation of generative AI tools (Midjourney, DALL-E, Stable Diffusion), distinguishing real from synthetic media has become critical for:
- **Journalism** - Verifying image authenticity in news
- **Law Enforcement** - Digital evidence validation
- **Social Media Platforms** - Combating misinformation
- **Corporate Security** - Protecting brand integrity

---

## ✨ Features

### 🔬 Forensic Analysis Modules

| Module | Description | Detection Method |
|--------|-------------|------------------|
| **Metadata Inspector** | Deep EXIF/XMP extraction | Software signatures, C2PA provenance |
| **Error Level Analysis (ELA)** | Compression artifact detection | Multi-pass JPEG analysis |
| **Frequency Analysis (FFT)** | GAN signature detection | Fast Fourier Transform patterns |
| **Noise Variance** | Sensor noise inconsistencies | Statistical variance mapping |
| **AI Signature Scanner** | Known generator detection | Pattern matching database |

### 🎨 User Experience

- **Modern SaaS UI** - Glassmorphic design with Zinc/Slate theme
- **Drag & Drop** - Intuitive file upload interface
- **Real-time Analysis** - Live confidence scoring
- **Interactive Visualizations** - Gauge charts, heatmaps, spectrum graphs
- **Mobile Responsive** - Touch-optimized for field investigations
- **PDF Reports** - Evidence-grade documentation

### 🛡️ Security & Reliability

- ✅ Server-side verification (double-check client results)
- ✅ CORS protection with configurable origins
- ✅ Rate limiting on API endpoints
- ✅ Sanitized file uploads with size validation
- ✅ No data persistence (privacy-first)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ metadata.js │  │  pixel.js   │  │frequency.js │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         └────────────┬────────────────────┘                │
│                      ▼                                      │
│              ┌───────────────┐                              │
│              │  scoring.js   │ ◄── Weighted Confidence     │
│              └───────┬───────┘                              │
│                      ▼                                      │
│              ┌───────────────┐                              │
│              │    ui.js      │ ◄── Visualization & DOM     │
│              └───────────────┘                              │
└─────────────────────────────────────────────────────────────┘
                          │
                    HTTP POST
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVER LAYER (Flask)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  app.py                                              │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │/api/analyze│  │/api/report │  │   /static  │    │  │
│  │  └─────┬──────┘  └─────┬──────┘  └────────────┘    │  │
│  │        │                │                            │  │
│  │        ▼                ▼                            │  │
│  │  ┌─────────────────────────────┐                    │  │
│  │  │  PIL + NumPy + fpdf2        │                    │  │
│  │  │  (Deep EXIF, ELA, PDF Gen)  │                    │  │
│  │  └─────────────────────────────┘                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend**
- Pure JavaScript (ES6+) - No frameworks for maximum performance
- CSS3 with CSS Grid/Flexbox
- HTML5 Canvas for visualizations

**Backend**
- **Flask** 2.0+ - Lightweight Python microframework
- **Pillow (PIL)** - Image processing & EXIF extraction
- **NumPy** - Numerical computations
- **fpdf2** - PDF report generation

**Deployment**
- PythonAnywhere (Production)
- Docker support (Coming soon)

---

## 📦 Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager
- Virtual environment (recommended)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Naveen-21-Cyber/ai-image-forensics.git
cd ai-image-forensics

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

The application will be available at `http://localhost:5000`

### Docker Installation (Alternative)

```bash
# Build the image
docker build -t ai-forensics .

# Run the container
docker run -p 5000:5000 ai-forensics
```

---

## 🚀 Usage

### Web Interface

1. **Navigate** to `http://localhost:5000`
2. **Upload** an image via drag-and-drop or file picker
3. **Analyze** - Click "Analyze Image" button
4. **Review** results across multiple forensic modules
5. **Export** - Download PDF report for documentation

### Programmatic Access

```python
import requests

# Analyze an image
with open('suspicious_image.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:5000/api/analyze',
        files={'image': f}
    )
    
results = response.json()
print(f"AI Probability: {results['ai_probability']}%")
print(f"Verdict: {results['verdict']}")

# Generate PDF report
report_response = requests.post(
    'http://localhost:5000/api/report',
    files={'image': open('suspicious_image.jpg', 'rb')}
)

with open('forensic_report.pdf', 'wb') as f:
    f.write(report_response.content)
```

---

## 📡 API Documentation

### POST `/api/analyze`

Performs server-side forensic analysis on uploaded image.

**Request:**
```http
POST /api/analyze HTTP/1.1
Content-Type: multipart/form-data

image: [binary file data]
```

**Response:**
```json
{
  "metadata": {
    "software": "Adobe Photoshop CC 2023",
    "camera_make": null,
    "has_c2pa": false
  },
  "ela_score": 72.5,
  "ai_probability": 85.3,
  "verdict": "Likely AI-Generated",
  "confidence": "High"
}
```

### POST `/api/report`

Generates evidence-grade PDF report.

**Request:**
```http
POST /api/report HTTP/1.1
Content-Type: multipart/form-data

image: [binary file data]
```

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename=forensic_report_[timestamp].pdf

[Binary PDF data]
```

---

## 🌐 Deployment

### PythonAnywhere (Production)

1. **Create Account** at [pythonanywhere.com](https://www.pythonanywhere.com)

2. **Upload Files** via Git or file browser
   ```bash
   git clone https://github.com/yourusername/ai-image-forensics.git
   cd ai-image-forensics
   ```

3. **Install Dependencies**
   ```bash
   pip3.8 install --user -r requirements.txt
   ```

4. **Configure WSGI**
   - Go to Web tab → Add new web app
   - Choose Flask
   - Point to `app.py`
   - Set working directory

5. **Environment Variables** (optional)
   ```bash
   export FLASK_ENV=production
   export SECRET_KEY=your-secret-key-here
   ```

### Heroku Deployment

```bash
# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

### AWS EC2 / DigitalOcean

```bash
# Install nginx
sudo apt update
sudo apt install nginx python3-pip

# Setup systemd service
sudo nano /etc/systemd/system/ai-forensics.service

# Start service
sudo systemctl start ai-forensics
sudo systemctl enable ai-forensics
```

---

## 🔬 Technical Details

### Error Level Analysis (ELA)

ELA detects areas of an image that have been modified by analyzing compression artifacts:

```python
def ela_analysis(image_path, quality=95):
    original = Image.open(image_path).convert('RGB')
    
    # Resave at specific quality
    temp_path = 'temp_ela.jpg'
    original.save(temp_path, 'JPEG', quality=quality)
    compressed = Image.open(temp_path)
    
    # Calculate difference
    ela_image = ImageChops.difference(original, compressed)
    
    # Amplify differences
    extrema = ela_image.getextrema()
    max_diff = max([ex[1] for ex in extrema])
    scale = 255.0 / max_diff if max_diff != 0 else 1
    
    ela_image = ImageEnhance.Brightness(ela_image).enhance(scale)
    return ela_image
```

### FFT Analysis

Fast Fourier Transform reveals periodic patterns left by GANs:

```javascript
function performFFT(imageData) {
    const grayscale = toGrayscale(imageData);
    const fft = new FFT(grayscale.width, grayscale.height);
    const spectrum = fft.forward(grayscale.data);
    
    // Detect grid patterns
    const gridScore = detectGridPattern(spectrum);
    return gridScore > THRESHOLD ? 'AI' : 'Real';
}
```

### Confidence Scoring

Weighted multi-factor scoring algorithm:

| Factor | Weight | Range |
|--------|--------|-------|
| Metadata | 25% | 0-100 |
| ELA Score | 30% | 0-100 |
| FFT Anomalies | 25% | 0-100 |
| Noise Variance | 20% | 0-100 |

**Final Score** = Σ(Factor × Weight)

---

## 🗺️ Roadmap

### Version 1.1 (Q2 2026)
- [ ] ResNet50 deep learning classifier
- [ ] Batch processing API
- [ ] User authentication system
- [ ] Analysis history dashboard

### Version 2.0 (Q3 2026)
- [ ] Video deepfake detection
- [ ] AWS S3 integration for report archival
- [ ] Real-time API for social media platforms
- [ ] Advanced GAN signature database

### Future Considerations
- [ ] Blockchain timestamping for reports
- [ ] Mobile app (iOS/Android)
- [ ] Browser extension for quick verification
- [ ] Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Code Standards
- Follow PEP 8 for Python code
- Use ESLint for JavaScript
- Add unit tests for new features
- Update documentation accordingly

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 🙏 Acknowledgments

- **Hany Farid** - Pioneer in digital image forensics
- **OpenCV Community** - Computer vision algorithms
- **EXIF Tool** - Metadata extraction inspiration
- **C2PA Coalition** - Content provenance standards

---

## 📞 Contact & Support

- **Author:** [Your Name]
- **Email:** your.email@example.com
- **LinkedIn:** [Your Profile](https://linkedin.com/in/yourprofile)
- **Twitter:** [@yourhandle](https://twitter.com/yourhandle)

### Report Issues
Found a bug? [Open an issue](https://github.com/yourusername/ai-image-forensics/issues)

### Security Vulnerabilities
Please report security issues to: security@yourdomain.com

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with 🔬 by cybersecurity enthusiasts | Powered by Python & Flask

[Demo](https://demo-link.com) • [Documentation](https://docs-link.com) • [Report Bug](https://github.com/yourusername/ai-image-forensics/issues)

</div>
